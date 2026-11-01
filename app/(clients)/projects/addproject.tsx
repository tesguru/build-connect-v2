import React from "react";
import { ScrollView, Switch, Text, View } from "react-native";

import GradientButton from "@/components/Buttons/GradientButton";
import DropdownField from "@/components/Forms/DropDown";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import FormInput from "@/components/Forms/Formnput";
import { FormTextArea } from "@/components/Forms/TextArea";
import AppLayout from "@/components/Layouts/AppLayout";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import { reportImage } from "@/constants/icon";
import { useProjects } from "@/core/hooks/useProjects";
import { uploadFile } from "@/core/utils/fileUpload";
import { handleApiError } from "@/core/utils/handleapierror";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Toast from "react-native-toast-message";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA - FROM FIRST FILE (create_project.tsx)
// ─────────────────────────────────────────────────────────────────────────────
const CURRENCY_OPTIONS = [
  { label: "NGN - Nigerian Naira", value: "NGN" },
  { label: "USD - US Dollar", value: "USD" },
  { label: "GBP - British Pound", value: "GBP" },
  { label: "EUR - Euro", value: "EUR" },
  { label: "GHS - Ghanaian Cedi", value: "GHS" },
  { label: "KES - Kenyan Shilling", value: "KES" },
  { label: "ZAR - South African Rand", value: "ZAR" },
];

const createProjectSchema = z.object({
  projectName: z.string().trim().min(1, "Project name is required"),
  location: z.string().trim().min(1, "Location is required"),
  description: z.string().trim().min(1, "Description is required"),
  currency: z.string().min(1, "Currency is required"),
  budgetMin: z.string().min(1, "Budget min is required"),
  budgetMax: z.string().min(1, "Budget max is required"),
  durationMin: z.string().min(1, "Duration min is required"),
  durationMax: z.string().min(1, "Duration max is required"),
  hasApprovedDrawings: z.boolean().default(false),
  drawingFile: z.any().nullable().optional(),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const AddProject = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const { submitBidMutation } = useProjects();

  // ── Form - USING FIRST FILE'S SCHEMA ─────────────────────────────────────
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      projectName: "",
      location: "",
      description: "",
      currency: "NGN",
      budgetMin: "",
      budgetMax: "",
      durationMin: "",
      durationMax: "",
      hasApprovedDrawings: false,
      drawingFile: null,
    },
  });

  const hasApprovedDrawings = watch("hasApprovedDrawings");

  // ── Helpers from first file ──────────────────────────────────────────────
  const showError = (message: string) => {
    Toast.show({ type: "error", text1: "Validation Error", text2: message });
  };

  // ── Submit - EXACTLY FROM FIRST FILE ─────────────────────────────────────
  const onSubmit = async (data: CreateProjectFormValues) => {
    setIsSubmitting(true);
    try {
      const budgetMin = parseFloat(String(data.budgetMin).replace(/,/g, ""));
      const budgetMax = parseFloat(String(data.budgetMax).replace(/,/g, ""));
      const durationMin = parseInt(
        String(data.durationMin).replace(/,/g, ""),
        10,
      );
      const durationMax = parseInt(
        String(data.durationMax).replace(/,/g, ""),
        10,
      );

      if (!Number.isFinite(budgetMin) || budgetMin <= 0) {
        showError("Please enter a valid minimum budget");
        setIsSubmitting(false);
        return;
      }
      if (!Number.isFinite(budgetMax) || budgetMax <= 0) {
        showError("Please enter a valid maximum budget");
        setIsSubmitting(false);
        return;
      }
      if (budgetMax <= budgetMin) {
        showError("Budget max must be greater than budget min");
        setIsSubmitting(false);
        return;
      }
      if (!Number.isFinite(durationMin) || durationMin <= 0) {
        showError("Please enter a valid minimum duration");
        setIsSubmitting(false);
        return;
      }
      if (!Number.isFinite(durationMax) || durationMax <= 0) {
        showError("Please enter a valid maximum duration");
        setIsSubmitting(false);
        return;
      }
      if (durationMax <= durationMin) {
        showError("Duration max must be greater than duration min");
        setIsSubmitting(false);
        return;
      }

      let drawingFileId: string | undefined;
      if (data.hasApprovedDrawings && data.drawingFile) {
        const uploaded = await uploadFile(
          data.drawingFile,
          "work_showcase",
          "Building Drawing",
        );
        drawingFileId = uploaded.id;
      }

      const payload = {
        name: data.projectName,
        location: data.location,
        description: data.description,
        budgetMinimum: budgetMin,
        budgetMaximum: budgetMax,
        currency: data.currency,
        durationMinimum: durationMin,
        durationMaximum: durationMax,
        isApprovedBuildingDrawings: data.hasApprovedDrawings,
        metadata: drawingFileId ? { fileIds: [drawingFileId] } : {},
      };

      submitBidMutation.mutate(payload, {
        onSuccess: () => {
          setShowSuccess(true);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
        onError: (err: any) => {
          handleApiError(err, "Something went wrong. Please try again.", {
            title: "Submission Failed",
            fallbackMessage: "Something went wrong. Please try again.",
          });
        },
      });
    } catch (err: any) {
      setIsSubmitting(false);
      handleApiError(err, "Failed to upload file. Please try again.", {
        title: "Upload Failed",
        fallbackMessage: "Failed to upload file. Please try again.",
      });
    }
  };

  const isLoading = isSubmitting || submitBidMutation.isPending;

  if (showSuccess) {
    return (
      <SuccessScreen
        title="Project Posted Successfully"
        message="Your project has been posted. Builders will start submitting bids soon"
        buttonTitle="View my Projects"
        navigateTo="/(tab)/mybids"
      />
    );
  }

  // ── RENDER - UI FROM THIRD FILE (COMPLETELY UNTOUCHED) ──────────────────
  return (
    <AppLayout screenName="Add Project">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-1 flex-1">
          {/* Project Name - FROM FIRST FILE */}
          <View className="px-4 pt-4">
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
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.projectName.message}
              </Text>
            )}
          </View>

          {/* Location - FROM FIRST FILE */}
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
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.location.message}
              </Text>
            )}
          </View>

          {/* Description - FROM FIRST FILE */}
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

          {/* Currency - FROM FIRST FILE */}
          <View className="px-4 pt-3">
            <DropdownField
              name="currency"
              control={control}
              label="Currency"
              placeholder="Select currency"
              data={CURRENCY_OPTIONS}
              error={errors.currency?.message as string}
            />
          </View>

          {/* Budget Min & Max - FROM FIRST FILE */}
          <View className="flex-row gap-4 px-4 pt-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="budgetMin"
                render={({ field }) => (
                  <FormInput
                    label="Budget Min"
                    placeholder="100,000"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    keyboardType="numeric"
                    formatNumber
                    hasError={!!errors.budgetMin}
                  />
                )}
              />
              {errors.budgetMin && (
                <Text className="font-inter pt-1 text-red-500 text-sm">
                  {errors.budgetMin.message}
                </Text>
              )}
            </View>

            <View className="flex-1">
              <Controller
                control={control}
                name="budgetMax"
                render={({ field }) => (
                  <FormInput
                    label="Budget Max"
                    placeholder="300,000"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    keyboardType="numeric"
                    formatNumber
                    hasError={!!errors.budgetMax}
                  />
                )}
              />
              {errors.budgetMax && (
                <Text className="font-inter pt-1 text-red-500 text-sm">
                  {errors.budgetMax.message}
                </Text>
              )}
            </View>
          </View>

          {/* Duration Min & Max - FROM FIRST FILE */}
          <View className="flex-row gap-4 px-4 pt-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="durationMin"
                render={({ field }) => (
                  <FormInput
                    label="Duration Min (mo)"
                    placeholder="3"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    keyboardType="numeric"
                    hasError={!!errors.durationMin}
                  />
                )}
              />
              {errors.durationMin && (
                <Text className="font-inter pt-1 text-red-500 text-sm">
                  {errors.durationMin.message}
                </Text>
              )}
            </View>

            <View className="flex-1">
              <Controller
                control={control}
                name="durationMax"
                render={({ field }) => (
                  <FormInput
                    label="Duration Max (mo)"
                    placeholder="12"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    keyboardType="numeric"
                    hasError={!!errors.durationMax}
                  />
                )}
              />
              {errors.durationMax && (
                <Text className="font-inter pt-1 text-red-500 text-sm">
                  {errors.durationMax.message}
                </Text>
              )}
            </View>
          </View>

          {/* Has Approved Drawings - FROM FIRST FILE */}
          <View className="px-4 pt-6">
            <View className="flex-row justify-between items-center">
              <Text className="font-worksanssemibold text-base text-gray-800">
                Approved Building Drawings?
              </Text>
              <Controller
                control={control}
                name="hasApprovedDrawings"
                render={({ field }) => (
                  <Switch
                    value={field.value}
                    onValueChange={field.onChange}
                    trackColor={{ false: "#d1d5db", true: "#6366f1" }}
                    thumbColor="#ffffff"
                  />
                )}
              />
            </View>

            {hasApprovedDrawings ? (
              <View className="mt-4">
                <Controller
                  control={control}
                  name="drawingFile"
                  render={({ field }) => (
                    <FileUploadComponent
                      title="Click to upload documents"
                      image={reportImage}
                      label="Upload Drawing"
                      note="PDF, DWG, images (max. 20MB)"
                      control={control}
                      name="drawingFile"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.drawingFile?.message as string | undefined}
                      maxSizeMB={20}
                    />
                  )}
                />
              </View>
            ) : (
              <View className="mt-4 border border-dashed border-gray-300 rounded-xl p-6 items-center justify-center">
                <Text className="font-inter text-gray-400 text-base">
                  Tap to upload documents
                </Text>
                <Text className="font-inter text-gray-400 text-sm mt-1">
                  PDF, DWG, images
                </Text>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View className="pt-6 pb-8 px-4">
            <GradientButton
              title="Add Project"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default AddProject;
