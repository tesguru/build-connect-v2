import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { X, Plus } from "lucide-react-native";
import GradientButton from "@/components/Buttons/GradientButton";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import DropdownField from "@/components/Forms/DropDown";
import { FormTextArea } from "@/components/Forms/TextArea";
import { FormDatePicker } from "@/components/Forms/DatePicker";
import FormInput from "@/components/Forms/Formnput";
import ImageUploadComponent from "@/components/Forms/ImageForm";
import PageHeader from "@/components/Miscallaneous/PageHeader";
import { LookupService } from "@/core/services/lookup/LookupService";
import { useProjects } from "@/core/hooks/useProjects";
import Toast from "react-native-toast-message";
import { AddProjectInput, addProjectSchema } from "@/core/schemas/dashboardschema";
import { uploadFile } from "@/core/utils/fileUpload";
import { FileUploadResult } from "@/components/Forms/FileUploadComponent";
import { reportImage } from "@/constants/icon";

export default function CreateProjectScreen() {
  const router = useRouter();
  const [openDatePicker, setOpenDatePicker] = React.useState<'start' | 'end' | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const { submitBidMutation, submitBidSuccess } = useProjects();

  
  const { data: projectTypesResponse, isLoading: isLoadingProjectTypes } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => {
      const response = await LookupService.getProjectTypes();
      return response.data.data.items;
    },
  });

  const projectTypesData = projectTypesResponse?.map((item) => ({
    label: item.label,
    value: item.value,
    id: item.id,
  })) || [];

 
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddProjectInput>({
    resolver: zodResolver(addProjectSchema),
    defaultValues: {
      projectName: "",
      projectType: "",
      location: "",
      budget: "",
      startDate: "",
      endDate: "",
      description: "",
      milestones: [
        {
          milestoneName: "",
          completionDate: "",
          paymentAmount: 0,
        },
      ],
      projectMedia: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

 
  const onSubmit = async (data: AddProjectInput) => {
    try {
      setIsUploading(true);

      let mediaFileId: string | null = null;
      if (data.projectMedia) {
        let fileData: FileUploadResult;

        if ('size' in data.projectMedia && 'name' in data.projectMedia) {
          fileData = data.projectMedia as FileUploadResult;
        } else {
          const response = await fetch(data.projectMedia.uri);
          const blob = await response.blob();
          const fileName = data.projectMedia.uri.split('/').pop() || 'image.jpg';
          const mediaData = data.projectMedia as any;

          fileData = {
            uri: data.projectMedia.uri,
            name: fileName,
            type: mediaData.type || 'image/jpeg',
            width: mediaData.width,
            height: mediaData.height,
            size: blob.size,
          };
        }

        const uploadResult = await uploadFile(fileData, "portfolio", "portfolio");
        mediaFileId = uploadResult.fileId;
      }

      setIsUploading(false);

      const selectedProjectType = projectTypesResponse?.find(
        (item) => item.value === data.projectType
      );
      const budgetStr = String(data.budget ?? "").replace(/,/g, "");
      const budgetNum = budgetStr ? parseFloat(budgetStr) : NaN;

      if (!selectedProjectType) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please select a valid project type",
        });
        return;
      }
      if (!Number.isFinite(budgetNum) || budgetNum <= 0) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please enter a valid budget amount",
        });
        return;
      }

      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const apiPayload = {
        title: data.projectName,
        description: data.description,
        location: data.location,
        projectTypeId: selectedProjectType.id,
        exactBudget: budgetStr,
        timelineId: "1c597cb4-185c-4a37-8192-c41227a56ca0",
        startDate: formatDate(data.startDate),
        endDate: formatDate(data.endDate),
        milestones: data.milestones.map((milestone) => ({
          name: milestone.milestoneName,
          description: milestone.milestoneName,
          completionDate: formatDate(milestone.completionDate),
          amount: milestone.paymentAmount,
        })),
        mediaFileIds: mediaFileId ? [mediaFileId] : [],
        fileIds: [],
        metadata: {},
      };

      submitBidMutation.mutate(apiPayload);

    } catch (error: any) {
      setIsUploading(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to process project data",
      });
    }
  };

  const handleSkip = () => {
    router.replace("/sign_up/client/account_success");
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/sign_up/client/verify_identity");
    }
  };

 
  if (submitBidSuccess) {
    router.push("/sign_up/client/account_success");
  }

 
  return (
    <KeyboardAvoidingLayout>
      <View className="px-4 flex-1">
        <PageHeader title="Tell us About Your Project" onBackPress={handleBack} />

        <Text className="font-interbold text-lg px-4 pt-4">Project Details</Text>

        {/* Project Name */}
        <View className="px-4 pt-4">
          <Controller
            control={control}
            name="projectName"
            render={({ field }) => (
              <FormInput
                placeholder="e.g Modern Bungalow Construction"
                label="Project Name"
                value={String(field.value)}
                hasError={!!errors.projectName}
                onChangeText={field.onChange}
              />
            )}
          />
          {errors.projectName && (
            <Text className="font-inter pt-1 text-red-500 text-sm">
              {errors.projectName.message}
            </Text>
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

        {/* Location */}
        <View className="px-4 pt-3">
          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <FormInput
                placeholder="e.g Lagos, Nigeria"
                label="Location"
                value={field.value}
                hasError={!!errors.location}
                onChangeText={field.onChange}
              />
            )}
          />
          {errors.location && (
            <Text className="font-inter pt-1 text-red-500 text-sm">
              {errors.location.message}
            </Text>
          )}
        </View>

        {/* Budget */}
        <View className="px-4 pt-3">
          <Controller
            control={control}
            name="budget"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Budget (₦)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="0"
                keyboardType="numeric"
                formatNumber
                hasError={!!errors.budget}
              />
            )}
          />
          {errors.budget && (
            <Text className="font-inter pt-1 text-red-500 text-sm">
              {errors.budget.message}
            </Text>
          )}
        </View>

        {/* Start & End Date */}
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
                  isOpen={openDatePicker === 'start'}
                  onOpen={() => setOpenDatePicker('start')}
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
                  isOpen={openDatePicker === 'end'}
                  onOpen={() => setOpenDatePicker('end')}
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

        {/* Milestones */}
        <View className="px-4 mt-4">
          <Text className="font-worksanssemibold text-xl mb-4">Milestones</Text>

          {fields.map((field, index) => (
            <View key={field.id} className="border border-gray-300 rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-inter text-xl">Milestone {index + 1}</Text>
                {fields.length > 1 && (
                  <TouchableOpacity onPress={() => remove(index)}>
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>

              <Controller
                control={control}
                name={`milestones.${index}.milestoneName`}
                render={({ field }) => (
                  <FormInput
                    placeholder="Foundation"
                    label="Milestone Name"
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

              <View className="flex-row gap-2 justify-between">
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
                <View className="pt-3 flex-1">
                  <Controller
                    control={control}
                    name={`milestones.${index}.paymentAmount`}
                    render={({ field }) => (
                      <FormInput
                        placeholder="Enter amount"
                        label="Amount"
                        value={String(field.value)}
                        hasError={!!errors.milestones?.[index]?.paymentAmount}
                        onChangeText={(text) => field.onChange(Number(text))}
                        keyboardType="numeric"
                        formatNumber={true}
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
            onPress={() => append({ milestoneName: "", completionDate: "", paymentAmount: 0 })}
            className="flex-row gap-2 justify-end mb-4"
          >
            <Plus size={20} color="#2563eb" />
            <Text className="text-blue-600 font-inter">Add milestone</Text>
          </TouchableOpacity>
        </View>

        {/* Project Media */}
        <View className="px-4">
          <Controller
            control={control}
            name="projectMedia"
            render={() => (
              <ImageUploadComponent
                title="Click to upload or drag and drop"
                image={reportImage}
                label="Project Media (Optional)"
                note="PNG, JPG, PDF (max. 5MB)"
                control={control}
                name="projectMedia"
                error={errors.projectMedia?.message as string | undefined}
              />
            )}
          />
        </View>

        {/* Buttons */}
        <View className="pt-6 pb-4 px-4 space-y-3">
          <GradientButton
            title="Complete Setup"
            onPress={handleSubmit(onSubmit)}
            loading={isUploading || submitBidMutation.isPending}
            disabled={isUploading || submitBidMutation.isPending}
          />
          <TouchableOpacity
            onPress={handleSkip}
            className="py-4 items-center"
            disabled={isUploading || submitBidMutation.isPending}
          >
            <Text className="text-gray-500 font-inter text-base">Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingLayout>
  );
}