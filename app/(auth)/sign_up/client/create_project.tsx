import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

import GradientButton from "@/components/Buttons/GradientButton";
import DropdownField from "@/components/Forms/DropDown";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import FormInput from "@/components/Forms/Formnput";
import { FormTextArea } from "@/components/Forms/TextArea";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import PageHeader from "@/components/Miscallaneous/PageHeader";
import { reportImage } from "@/constants/icon";
import { useProjects } from "@/core/hooks/useProjects";
import { uploadFile } from "@/core/utils/fileUpload";
import { handleApiError } from "@/core/utils/handleapierror";

// ─────────────────────────────────────────────────────────────────────────────
// Schema - from first file
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
// Screen - Using second file's LAYOUT with first file's LOGIC
// ─────────────────────────────────────────────────────────────────────────────
export default function CreateProjectScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitBidMutation, submitBidSuccess } = useProjects();

  // ── Form - using FormProvider pattern ────────────────────────────────────
  const methods = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    mode: "onChange",
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

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = methods;
  const hasApprovedDrawings = watch("hasApprovedDrawings");

  // ── Helpers from first file ──────────────────────────────────────────────
  const showError = (message: string) => {
    Toast.show({ type: "error", text1: "Validation Error", text2: message });
  };

  // ── Submit - exactly from first file ─────────────────────────────────────
  const onSubmit = async (data: CreateProjectFormValues) => {
    try {
      setIsSubmitting(true);

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

      // ── File upload - using PortfolioScreen pattern ──────────────────────
      const fileIds: Record<string, string | string[]> = {};

      if (data.hasApprovedDrawings && data.drawingFile) {
        const result = await uploadFile(
          data.drawingFile,
          "work_showcase",
          "Building Drawing",
        );
        fileIds.fileIds = [result.id];
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
        metadata: fileIds,
      };

      submitBidMutation.mutate(payload, {
        onSuccess: () => {
          router.push("/sign_up/client/account_success");
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
    } catch (error: any) {
      setIsSubmitting(false);
      handleApiError(error, "Failed to upload files. Please try again.", {
        title: "Upload Failed",
        fallbackMessage: "Failed to upload files. Please try again.",
      });
    }
  };

  // ── Handle Complete - using PortfolioScreen pattern ──────────────────────
  const handleComplete = async () => {
    const fields: (keyof CreateProjectFormValues)[] = [
      "projectName",
      "location",
      "description",
      "currency",
      "budgetMin",
      "budgetMax",
      "durationMin",
      "durationMax",
    ];
    const valid = await trigger(fields);
    if (valid) {
      handleSubmit(onSubmit)();
    }
  };

  const handleBack = () => {
    if (!isSubmitting) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push("/sign_up/client/verify_identity");
      }
    }
  };

  const handleSkip = () => router.replace("/sign_up/client/account_success");

  const isLoading = isSubmitting || submitBidMutation.isPending;

  // ── Render - Using SECOND FILE'S LAYOUT ──────────────────────────────────
  return (
    <KeyboardAvoidingLayout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 flex-1 pb-8">
          {/* PageHeader - from second file */}
          <PageHeader
            title="Tell us About Your Project"
            onBackPress={handleBack}
          />

          <View className="pt-4">
            {/* Project Name */}
            <Controller
              control={control}
              name="projectName"
              render={({ field }) => (
                <FormInput
                  label="Project Name"
                  placeholder="e.g. Modern Family Home"
                  value={field.value}
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

          {/* Location */}
          <View className="pt-4">
            <Controller
              control={control}
              name="location"
              render={({ field }) => (
                <FormInput
                  label="Location"
                  placeholder="Project address"
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

          {/* Description */}
          <View className="pt-4">
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <FormTextArea
                  label="Description & Scope"
                  placeholder="Describe your project..."
                  value={field.value}
                  onChangeText={field.onChange}
                  hasError={!!errors.description}
                  errorMessage={errors.description?.message}
                  width="w-full"
                />
              )}
            />
          </View>

          {/* Currency */}
          <View className="pt-4">
            <DropdownField
              name="currency"
              control={control}
              label="Currency"
              placeholder="Select currency"
              data={CURRENCY_OPTIONS}
              error={errors.currency?.message as string}
            />
          </View>

          {/* Budget Min & Max */}
          <View className="flex-row gap-4 pt-4">
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

          {/* Duration Min & Max */}
          <View className="flex-row gap-4 pt-4">
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

          {/* Approved Building Drawings */}
          <View className="pt-6">
            <View className="flex-row justify-between items-center">
              <Text className="font-inter text-base font-medium text-gray-800">
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
                      title="Tap to upload documents"
                      image={reportImage}
                      label="Upload Drawing"
                      note="PDF, DWG, images"
                      control={control}
                      name="drawingFile"
                      value={field.value}
                      onChange={field.onChange}
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

          {/* Buttons */}
          <View className="pt-8 space-y-3">
            <GradientButton
              title="Complete Setup"
              onPress={handleComplete}
              loading={isLoading}
              disabled={isLoading}
            />
            <TouchableOpacity
              onPress={handleSkip}
              className="py-4 items-center"
              disabled={isLoading}
            >
              <Text className="text-gray-500 font-inter text-base">Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingLayout>
  );
}
