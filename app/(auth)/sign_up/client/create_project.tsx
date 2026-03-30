import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import GradientButton from "@/components/Buttons/GradientButton";
import { FormDatePicker } from "@/components/Forms/DatePicker";
import DropdownField from "@/components/Forms/DropDown";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import FormInput from "@/components/Forms/Formnput";
import { FormTextArea } from "@/components/Forms/TextArea";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import PageHeader from "@/components/Miscallaneous/PageHeader";
import { reportImage } from "@/constants/icon";
import { useProjects } from "@/core/hooks/useProjects";
import { addProjectSchema } from "@/core/schemas/dashboardschema";
import { LookupService } from "@/core/services/lookup/LookupService";
import { uploadFile } from "@/core/utils/fileUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { FileText, Image, Plus, X } from "lucide-react-native";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Toast from "react-native-toast-message";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────
const extendedProjectSchema = addProjectSchema
  .omit({ projectMedia: true })
  .extend({
    milestones: z
      .array(
        z.object({
          milestoneName: z.string().trim().min(1, "Milestone name is required"),
          milestoneDescription: z.string().trim().min(1, "Milestone description is required"),
          completionDate: z.string().min(1, "Completion date is required"),
          paymentAmount: z.number().positive("Payment amount must be greater than 0"),
        })
      )
      .min(1, "At least one milestone is required"),
    mediaFiles: z
      .array(z.object({ file: z.any().nullable(), fileId: z.string().optional() }))
      .default([]),
    documentFiles: z
      .array(z.object({ file: z.any().nullable(), fileId: z.string().optional() }))
      .default([]),
  });

type ExtendedProjectInput = z.infer<typeof extendedProjectSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function CreateProjectScreen() {
  const router = useRouter();
  const [openDatePicker, setOpenDatePicker] = React.useState<"start" | "end" | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const { submitBidMutation, submitBidSuccess } = useProjects();

  // ── Lookups ────────────────────────────────────────────────────────────────
  const { data: projectTypesResponse, isLoading: isLoadingProjectTypes } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => {
      const res = await LookupService.getProjectTypes();
      return res.data.data.items;
    },
  });

  const { data: getBudgetRangesResponse, isLoading: isLoadingBudgetRanges } = useQuery({
    queryKey: ["budgetRange"],
    queryFn: async () => {
      const res = await LookupService.getBudgetRanges();
      return res.data.data.items;
    },
  });

  const { data: getTimelineResponse, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ["getTimeline"],
    queryFn: async () => {
      const res = await LookupService.getTimelines();
      return res.data.data.items;
    },
  });

  const projectTypesData =
    projectTypesResponse?.map((item) => ({ label: item.label, value: item.value, id: item.id })) ?? [];
  const budgetData =
    getBudgetRangesResponse?.map((item) => ({ label: item.label, value: item.value, id: item.id })) ?? [];
  const timelineData =
    getTimelineResponse?.map((item) => ({ label: item.label, value: item.value, id: item.id })) ?? [];

  // ── Form ───────────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ExtendedProjectInput>({
    resolver: zodResolver(extendedProjectSchema),
    defaultValues: {
      projectName: "",
      projectType: "",
      budgetRangeId: "",
      timelineId: "",
      location: "",
      budget: "",
      startDate: "",
      endDate: "",
      description: "",
      milestones: [
        { milestoneName: "", milestoneDescription: "", completionDate: "", paymentAmount: 0 },
      ],
      mediaFiles: [],
      documentFiles: [],
    },
  });

  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } =
    useFieldArray({ control, name: "milestones" });

  const { fields: mediaFields, append: appendMedia, remove: removeMedia } =
    useFieldArray({ control, name: "mediaFiles" });

  const { fields: documentFields, append: appendDocument, remove: removeDocument } =
    useFieldArray({ control, name: "documentFiles" });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const showError = (text2: string) =>
    Toast.show({ type: "error", text1: "Validation Error", text2 });

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data: ExtendedProjectInput) => {
    try {
      setIsUploading(true);

      // ── Validation ───────────────────────────────────────────────────────
      const selectedProjectType = projectTypesResponse?.find((i) => i.value === data.projectType);
      const selectedBudgetRange = getBudgetRangesResponse?.find((i) => i.value === data.budgetRangeId);
      const selectedTimeline = getTimelineResponse?.find((i) => i.value === data.timelineId);
      const budgetNum = parseFloat(String(data.budget ?? "").replace(/,/g, ""));

      if (!selectedProjectType) {
        showError("Please select a valid project type");
        setIsUploading(false);
        return;
      }
      if (!selectedBudgetRange) {
        showError("Please select a budget range");
        setIsUploading(false);
        return;
      }
      if (!selectedTimeline) {
        showError("Please select a timeline");
        setIsUploading(false);
        return;
      }
      if (!Number.isFinite(budgetNum) || budgetNum <= 0) {
        showError("Please enter a valid budget amount");
        setIsUploading(false);
        return;
      }

      // ── Parallel file uploads ────────────────────────────────────────────
      const mediaFileIds: (string | null)[] = new Array(data.mediaFiles.length).fill(null);
      const documentFileIds: (string | null)[] = new Array(data.documentFiles.length).fill(null);

      const mediaTasks = data.mediaFiles.map((item, i) => {
        if (item.file) {
          return uploadFile(item.file, "work_showcase", "Project Media").then((res) => {
            mediaFileIds[i] = res.id;
            setValue(`mediaFiles.${i}.fileId`, res.id);
          });
        }
        if (item.fileId) {
          mediaFileIds[i] = item.fileId;
        }
        return Promise.resolve();
      });

      const documentTasks = data.documentFiles.map((item, i) => {
        if (item.file) {
          return uploadFile(item.file, "work_showcase", "Project Document").then((res) => {
            documentFileIds[i] = res.id;
            setValue(`documentFiles.${i}.fileId`, res.id);
          });
        }
        if (item.fileId) {
          documentFileIds[i] = item.fileId;
        }
        return Promise.resolve();
      });

      // ✅ Upload all files in parallel
      const allResults = await Promise.allSettled([...mediaTasks, ...documentTasks]);

      const failed = allResults.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        const reasons = failed
          .map((r) => (r as PromiseRejectedResult).reason?.message)
          .filter(Boolean)
          .join(", ");
        Toast.show({
          type: "error",
          text1: `${failed.length} file(s) failed to upload`,
          text2: reasons || "Please retry.",
        });
        setIsUploading(false);
        return;
      }

      // ── Build payload ────────────────────────────────────────────────────
      const apiPayload = {
        title: data.projectName,
        description: data.description,
        location: data.location,
        projectTypeId: selectedProjectType.id,
        budgetRangeId: selectedBudgetRange.id,
        exactBudget: budgetNum,
        timelineId: selectedTimeline.id,
        startDate: formatDate(data.startDate),
        endDate: formatDate(data.endDate),
        milestones: data.milestones.map((m) => ({
          name: m.milestoneName,
          description: m.milestoneDescription,
          completionDate: formatDate(m.completionDate),
          amount: m.paymentAmount,
        })),
        mediaFileIds: mediaFileIds.filter((id): id is string => !!id),
        fileIds: documentFileIds.filter((id): id is string => !!id),
        metadata: {},
      };

      console.log("Final payload:", JSON.stringify(apiPayload, null, 2));

      submitBidMutation.mutate(apiPayload, {
        onSuccess: () => {
          router.push("/sign_up/client/account_success");
        },
        onSettled: () => setIsUploading(false),
        onError: (error: any) => {
          Toast.show({
            type: "error",
            text1: "Submission Failed",
            text2: error?.response?.data?.message ?? error?.message ?? "Something went wrong. Please try again.",
          });
        },
      });
    } catch (error: any) {
      setIsUploading(false);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: error?.message ?? "Failed to upload files. Please try again.",
      });
    }
  };

  const isLoading = isUploading || submitBidMutation.isPending;

  const handleSkip = () => router.replace("/sign_up/client/account_success");

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.push("/sign_up/client/verify_identity");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingLayout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-1 flex-1">
          <PageHeader title="Tell us About Your Project" onBackPress={handleBack} />



          {/* Project Name */}
          <View className="px-4 ">
            <Controller
              control={control}
              name="projectName"
              render={({ field }) => (
                <FormInput
                  label="Project Name"
                  placeholder="e.g Modern Bungalow Construction"
                  value={String(field.value)}
                  hasError={!!errors.projectName}
                  onChangeText={field.onChange}
                />
              )}
            />
            {errors.projectName && (
              <Text className="font-inter pt-1 text-red-500 text-sm">{errors.projectName.message}</Text>
            )}
          </View>

          {/* Project Type */}
          <View className="px-4 pt-3">
            <DropdownField
              name="projectType"
              control={control}
              label="Project Type"
              placeholder={isLoadingProjectTypes ? "Loading..." : "Select project type"}
              data={projectTypesData}
              error={errors.projectType?.message as string}
            />
          </View>

          {/* Budget Range */}
          <View className="px-4 pt-3">
            <DropdownField
              name="budgetRangeId"
              control={control}
              label="Budget Range"
              placeholder={isLoadingBudgetRanges ? "Loading..." : "Select budget range"}
              data={budgetData}
              error={errors.budgetRangeId?.message as string}
            />
          </View>

          {/* Timeline */}
          <View className="px-4 pt-3">
            <DropdownField
              name="timelineId"
              control={control}
              label="Timeline"
              placeholder={isLoadingTimeline ? "Loading..." : "Select timeline"}
              data={timelineData}
              error={errors.timelineId?.message as string}
            />
          </View>

          {/* Location */}
          <View className="px-4 pt-3">
            <Controller
              control={control}
              name="location"
              render={({ field }) => (
                <FormInput
                  label="Location"
                  placeholder="e.g Lagos, Nigeria"
                  value={field.value}
                  hasError={!!errors.location}
                  onChangeText={field.onChange}
                />
              )}
            />
            {errors.location && (
              <Text className="font-inter pt-1 text-red-500 text-sm">{errors.location.message}</Text>
            )}
          </View>

          {/* Exact Budget */}
          <View className="px-4 pt-3">
            <Controller
              control={control}
              name="budget"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Exact Budget (₦)"
                  placeholder="0"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  formatNumber
                  hasError={!!errors.budget}
                />
              )}
            />
            {errors.budget && (
              <Text className="font-inter pt-1 text-red-500 text-sm">{errors.budget.message}</Text>
            )}
          </View>

          {/* Start & End Dates */}
          <View className="px-4 flex-row justify-between">
            <View className="pt-3 flex-1 mr-2">
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <FormDatePicker
                    label="Start Date"
                    value={field.value ? new Date(field.value) : new Date()}
                    onChange={(date) => field.onChange(date.toISOString())}
                    hasError={!!errors.startDate}
                    errorMessage={errors.startDate?.message}
                    isOpen={openDatePicker === "start"}
                    onOpen={() => setOpenDatePicker("start")}
                    onClose={() => setOpenDatePicker(null)}
                    minimumDate={new Date()}
                  />
                )}
              />
            </View>
            <View className="pt-3 flex-1 ml-2">
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <FormDatePicker
                    label="End Date"
                    value={field.value ? new Date(field.value) : new Date()}
                    onChange={(date) => field.onChange(date.toISOString())}
                    hasError={!!errors.endDate}
                    errorMessage={errors.endDate?.message}
                    isOpen={openDatePicker === "end"}
                    onOpen={() => setOpenDatePicker("end")}
                    onClose={() => setOpenDatePicker(null)}
                  />
                )}
              />
            </View>
          </View>

          {/* Description */}
          <View className="px-4 pt-4">
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <FormTextArea
                  label="Description"
                  placeholder="Describe your project requirements..."
                  value={field.value}
                  onChangeText={field.onChange}
                  hasError={!!errors.description}
                  errorMessage={errors.description?.message}
                  width="w-full"
                />
              )}
            />
          </View>

          {/* ── Milestones ───────────────────────────────────────────────── */}
          <View className="px-4 mt-6">
            <Text className="font-worksanssemibold text-xl mb-4">Milestones</Text>

            {milestoneFields.map((field, index) => (
              <View key={field.id} className="border border-gray-300 rounded-xl p-4 mb-4">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="font-inter text-xl">Milestone {index + 1}</Text>
                  {milestoneFields.length > 1 && (
                    <TouchableOpacity onPress={() => removeMilestone(index)}>
                      <X size={24} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Milestone Name */}
                <Controller
                  control={control}
                  name={`milestones.${index}.milestoneName`}
                  render={({ field }) => (
                    <FormInput
                      label="Milestone Name"
                      placeholder="e.g Foundation"
                      value={field.value}
                      hasError={!!errors.milestones?.[index]?.milestoneName}
                      onChangeText={field.onChange}
                    />
                  )}
                />
                {errors.milestones?.[index]?.milestoneName && (
                  <Text className="font-inter pt-1 text-red-500 text-sm">
                    {errors.milestones[index]?.milestoneName?.message}
                  </Text>
                )}

                {/* Milestone Description */}
                <View className="pt-3">
                  <Controller
                    control={control}
                    name={`milestones.${index}.milestoneDescription`}
                    render={({ field }) => (
                      <FormTextArea
                        label="Milestone Description"
                        placeholder="Describe what this milestone involves..."
                        value={field.value}
                        onChangeText={field.onChange}
                        hasError={!!errors.milestones?.[index]?.milestoneDescription}
                        errorMessage={errors.milestones?.[index]?.milestoneDescription?.message}
                        width="w-full"
                      />
                    )}
                  />
                </View>

                <View className="flex-row gap-2 justify-between">
                  {/* Completion Date */}
                  <View className="pt-7 flex-1">
                    <Controller
                      control={control}
                      name={`milestones.${index}.completionDate`}
                      render={({ field }) => (
                        <FormDatePicker
                          label="Completion Date"
                          value={field.value ? new Date(field.value) : new Date()}
                          onChange={(date) => field.onChange(date.toISOString())}
                          hasError={!!errors.milestones?.[index]?.completionDate}
                          errorMessage={errors.milestones?.[index]?.completionDate?.message}
                        />
                      )}
                    />
                  </View>

                  {/* Payment Amount */}
                  <View className="pt-3 flex-1">
                    <Controller
                      control={control}
                      name={`milestones.${index}.paymentAmount`}
                      render={({ field }) => (
                        <FormInput
                          label="Amount (₦)"
                          placeholder="Enter amount"
                          value={String(field.value)}
                          hasError={!!errors.milestones?.[index]?.paymentAmount}
                          onChangeText={(text) => field.onChange(Number(text.replace(/,/g, "")))}
                          keyboardType="numeric"
                          formatNumber
                        />
                      )}
                    />
                    {errors.milestones?.[index]?.paymentAmount && (
                      <Text className="font-inter pt-1 text-red-500 text-sm">
                        {errors.milestones[index]?.paymentAmount?.message}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={() =>
                appendMilestone({
                  milestoneName: "",
                  milestoneDescription: "",
                  completionDate: "",
                  paymentAmount: 0,
                })
              }
              className="flex-row gap-2 justify-end mb-4"
            >
              <Plus size={20} color="#2563eb" />
              <Text className="text-blue-600 font-inter">Add milestone</Text>
            </TouchableOpacity>
          </View>

          {/* ── Media Files ──────────────────────────────────────────────── */}
          <View className="px-4 mt-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-worksanssemibold text-xl">Media Files</Text>
              <Text className="font-inter text-gray-400 text-sm">Images, Videos (Optional)</Text>
            </View>

            {mediaFields.map((field, index) => (
              <View key={field.id} className="border border-gray-300 rounded-xl p-4 mb-4">
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center gap-2">
                    <Image size={20} color="#2563eb" />
                    <Text className="font-inter text-lg">Media {index + 1}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeMedia(index)}>
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* ✅ field wired — file saves to form state */}
                <Controller
                  control={control}
                  name={`mediaFiles.${index}.file`}
                  render={({ field }) => (
                    <FileUploadComponent
                      title="Click to upload media"
                      image={reportImage}
                      label="Upload Media"
                      note="PNG, JPG, MP4 (max. 10MB)"
                      control={control}
                      name={`mediaFiles.${index}.file`}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.mediaFiles?.[index]?.file?.message as string | undefined}
                      maxSizeMB={10}
                    />
                  )}
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={() => appendMedia({ file: null })}
              className="flex-row gap-2 justify-end mb-6"
            >
              <Plus size={20} color="#2563eb" />
              <Text className="text-blue-600 font-inter">Add media file</Text>
            </TouchableOpacity>
          </View>

          {/* ── Document Files ───────────────────────────────────────────── */}
          <View className="px-4 mt-2">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-worksanssemibold text-xl">Document Files</Text>
              <Text className="font-inter text-gray-400 text-sm">PDF, DOC (Optional)</Text>
            </View>

            {documentFields.map((field, index) => (
              <View key={field.id} className="border border-gray-300 rounded-xl p-4 mb-4">
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center gap-2">
                    <FileText size={20} color="#2563eb" />
                    <Text className="font-inter text-lg">Document {index + 1}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeDocument(index)}>
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* ✅ field wired — file saves to form state */}
                <Controller
                  control={control}
                  name={`documentFiles.${index}.file`}
                  render={({ field }) => (
                    <FileUploadComponent
                      title="Click to upload document"
                      image={reportImage}
                      label="Upload Document"
                      note="PDF, DOC, DOCX (max. 10MB)"
                      control={control}
                      name={`documentFiles.${index}.file`}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.documentFiles?.[index]?.file?.message as string | undefined}
                      maxSizeMB={10}
                    />
                  )}
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={() => appendDocument({ file: null })}
              className="flex-row gap-2 justify-end mb-6"
            >
              <Plus size={20} color="#2563eb" />
              <Text className="text-blue-600 font-inter">Add document file</Text>
            </TouchableOpacity>
          </View>

       
          <View className="pt-6 pb-8 px-4 space-y-3">
            <GradientButton
              title="Complete Setup"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
            />
            <TouchableOpacity onPress={handleSkip} className="py-4 items-center" disabled={isLoading}>
              <Text className="text-gray-500 font-inter text-base">Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingLayout>
  );
}