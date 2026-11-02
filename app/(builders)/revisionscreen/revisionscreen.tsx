import GradientButton from "@/components/Buttons/GradientButton";
import { FormDatePicker } from "@/components/Forms/DatePicker";
import DropdownField from "@/components/Forms/DropDown";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import FormInput from "@/components/Forms/Formnput";
import { FormTextArea } from "@/components/Forms/TextArea";
import AppLayout from "@/components/Layouts/AppLayout";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import { reportImage } from "@/constants/icon";
import { useBids } from "@/core/hooks/UseBids";
import {
  BuilderRevisionInput,
  builderrevisionSchema,
} from "@/core/schemas/dashboardschema";
import { LookupService } from "@/core/services/lookup/LookupService";
import { uploadFile } from "@/core/utils/fileUpload";
import { handleApiError } from "@/core/utils/handleapierror";
import { useCurrencyStore } from "@/store/useCurrencyStore"; // ✅ Added
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { AlertCircle, Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

const Revisionscreen = () => {
  const { bidId, companyName, projectTitle } = useLocalSearchParams<{
    bidId: string;
    companyName: string;
    projectTitle: string;
  }>();

  const [isUploading, setIsUploading] = useState(false);
  const [portfolioReferenceError, setPortfolioReferenceError] = useState<
    string | null
  >(null);

  const { builderBidRevisionMutation, revisionSuccess } = useBids();
  const { currencySymbol } = useCurrencyStore(); // ✅ Added

  // ── Timeline Lookup ────────────────────────────────────────────────────────
  const { data: getTimelineResponse, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ["getTimeline"],
    queryFn: async () => {
      const res = await LookupService.getTimelines();
      return res.data.data.items;
    },
  });

  const timelineData =
    getTimelineResponse?.map((item) => ({
      label: item.label,
      value: item.value,
      id: item.id,
    })) ?? [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BuilderRevisionInput>({
    resolver: zodResolver(builderrevisionSchema),
    defaultValues: {
      message: "",
      bidAmount: 0,
      proposedTimeline: "",
      proposal: "",
      portfolioReferences: null,
      milestones: [
        {
          milestoneName: "",
          description: "",
          completionDate: "",
          paymentAmount: 0,
          paymentPercentage: 100,
          orderIndex: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

  const bidAmount = watch("bidAmount");
  const milestones = watch("milestones");

  const totalMilestonePayments =
    milestones?.reduce(
      (total, m) => total + (Number(m.paymentAmount) || 0),
      0,
    ) ?? 0;
  const isPaymentValid = totalMilestonePayments === bidAmount;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data: BuilderRevisionInput) => {
    try {
      const total = data.milestones.reduce(
        (sum, m) => sum + (Number(m.paymentAmount) || 0),
        0,
      );
      if (total !== Number(data.bidAmount)) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: `Milestone payments (${total}) must equal bid amount (${data.bidAmount})`,
        });
        return;
      }

      setIsUploading(true);
      setPortfolioReferenceError(null);

      let portfolioFileId: string | undefined;
      if (data.portfolioReferences) {
        const uploadResult = await uploadFile(
          data.portfolioReferences,
          "portfolio",
          "Portfolio Reference",
        );
        portfolioFileId = uploadResult.id;
      }

      const selectedTimeline = getTimelineResponse?.find(
        (i) => i.value === data.proposedTimeline,
      );

      const apiPayload = {
        bidId,
        message: data.message,
        bidAmount: Number(data.bidAmount),
        proposedTimeline: selectedTimeline?.label ?? data.proposedTimeline,
        proposal: data.proposal,
        portfolioReferences: portfolioFileId ? [portfolioFileId] : [],
        milestones: data.milestones.map((m, index) => ({
          milestoneName: m.milestoneName,
          description: m.description || "",
          completionDate: m.completionDate.split("T")[0],
          paymentAmount: Number(m.paymentAmount),
          paymentPercentage: m.paymentPercentage,
          orderIndex: index + 1,
        })),
      };

      builderBidRevisionMutation.mutate(apiPayload, {
        onSettled: () => setIsUploading(false),
        onError: (error: any) => {
          const { message } = handleApiError(
            error,
            "Failed to submit revision.",
            {
              title: "Revision Failed",
              fallbackMessage: "Failed to submit revision.",
            },
          );
          setPortfolioReferenceError(message);
        },
      });
    } catch (error: any) {
      setIsUploading(false);
      const { message } = handleApiError(
        error,
        "Failed to submit revision.",
        {
          title: "Revision Failed",
          fallbackMessage: "Failed to submit revision.",
        },
      );
      setPortfolioReferenceError(message);
    }
  };

  const isLoading = isUploading || builderBidRevisionMutation.isPending;

  // ── Success ────────────────────────────────────────────────────────────────
  if (revisionSuccess) {
    return (
      <SuccessScreen
        title="Request Revision Sent"
        message="Your revision request has been sent to the client. They have been notified and will review your request shortly."
        buttonTitle="Return Bids"
        navigateTo="/(tab)/mybids"
        params={{ bidId }}
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout screenName="Request Revision">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="font-inter px-3 pt-4 text-gray-500">
          Describe your changes and update the bid details below
        </Text>

        <View className="px-3">
          {/* Revision Message */}
          <View className="pt-4">
            <Controller
              control={control}
              name="message"
              render={({ field }) => (
                <FormTextArea
                  label="Revision Message"
                  placeholder="Describe your requests and feedback..."
                  value={field.value}
                  onChangeText={field.onChange}
                  hasError={!!errors.message}
                  errorMessage={errors.message?.message}
                  width="w-full"
                />
              )}
            />
          </View>

          {/* Bid Amount */}
          <View className="pt-4">
            <Controller
              control={control}
              name="bidAmount"
              render={({ field }) => (
                <FormInput
                  label={`Bid Amount (${currencySymbol})`}
                  placeholder="Enter bid amount"
                  value={field.value === 0 ? "" : String(field.value)}
                  hasError={!!errors.bidAmount}
                  onChangeText={(text) =>
                    field.onChange(Number(text.replace(/,/g, "")) || 0)
                  }
                  keyboardType="numeric"
                  formatNumber
                />
              )}
            />
            {errors.bidAmount && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.bidAmount.message}
              </Text>
            )}
          </View>

          {/* Proposed Timeline */}
          <View className="pt-4">
            <DropdownField
              name="proposedTimeline"
              control={control}
              label="Proposed Timeline"
              placeholder={isLoadingTimeline ? "Loading..." : "Select timeline"}
              data={timelineData}
              error={errors.proposedTimeline?.message as string}
            />
          </View>

          {/* Proposal */}
          <View className="pt-4">
            <Controller
              control={control}
              name="proposal"
              render={({ field }) => (
                <FormTextArea
                  label="Project Proposal"
                  placeholder="Briefly introduce yourself..."
                  value={field.value}
                  onChangeText={field.onChange}
                  hasError={!!errors.proposal}
                  errorMessage={errors.proposal?.message}
                  width="w-full"
                />
              )}
            />
          </View>

          {/* Payment Summary */}
          <View className="mt-4 p-3 bg-blue-50 rounded-lg">
            <View className="flex-row justify-between items-center">
              <Text className="font-inter font-medium">Payment Summary</Text>
              <Text
                className={`font-inter ${isPaymentValid ? "text-green-600" : "text-red-600"}`}
              >
                {isPaymentValid ? "✓ Valid" : "✗ Invalid"}
              </Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="font-inter text-gray-600">Bid Amount:</Text>
              <Text className="font-inter font-medium">
                {currencySymbol}
                {bidAmount?.toLocaleString() || 0}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="font-inter text-gray-600">
                Total Milestone Payments:
              </Text>
              <Text className="font-inter font-medium">
                {currencySymbol}
                {totalMilestonePayments?.toLocaleString()}
              </Text>
            </View>
            {!isPaymentValid && (
              <View className="flex-row items-center mt-2 p-2 bg-red-50 rounded">
                <AlertCircle size={16} color="#EF4444" />
                <Text className="text-red-600 text-sm flex-1 ml-2">
                  Milestone payments ({currencySymbol}
                  {totalMilestonePayments?.toLocaleString()}) must equal bid
                  amount ({currencySymbol}
                  {bidAmount?.toLocaleString() || 0})
                </Text>
              </View>
            )}
          </View>

          {/* Milestones */}
          <View className="mt-4 mx-2">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-worksanssemibold text-xl">Milestones</Text>
              <TouchableOpacity
                onPress={() =>
                  append({
                    milestoneName: "",
                    description: "",
                    completionDate: "",
                    paymentAmount: 0,
                    paymentPercentage: 100,
                    orderIndex: fields.length,
                  })
                }
                className="flex-row gap-2 items-center"
              >
                <Plus size={20} color="#2563eb" />
                <Text className="text-blue-600 font-inter">Add milestone</Text>
              </TouchableOpacity>
            </View>

            {fields.map((field, index) => (
              <View
                key={field.id}
                className="border border-gray-300 rounded-xl p-4 mb-4"
              >
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="font-inter text-xl">
                    Milestone {index + 1}
                  </Text>
                  {fields.length > 1 && (
                    <TouchableOpacity onPress={() => remove(index)}>
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

                {/* Description */}
                <View className="py-4">
                  <Controller
                    control={control}
                    name={`milestones.${index}.description`}
                    render={({ field }) => (
                      <FormTextArea
                        label="Description"
                        placeholder="Describe this milestone..."
                        value={field.value}
                        onChangeText={field.onChange}
                        hasError={!!errors.milestones?.[index]?.description}
                        width="w-full"
                        minHeight={80}
                      />
                    )}
                  />
                </View>

                {/* Completion Date */}
                <View className="mt-4">
                  <Controller
                    control={control}
                    name={`milestones.${index}.completionDate`}
                    render={({ field }) => (
                      <FormDatePicker
                        label="Completion Date"
                        value={field.value ? new Date(field.value) : new Date()}
                        onChange={(date) =>
                          field.onChange(date.toISOString().split("T")[0])
                        }
                        hasError={!!errors.milestones?.[index]?.completionDate}
                      />
                    )}
                  />
                </View>

                {/* Payment Amount */}
                <View className="pt-3">
                  <Controller
                    control={control}
                    name={`milestones.${index}.paymentAmount`}
                    render={({ field }) => (
                      <FormInput
                        label={`Payment Amount (${currencySymbol})`}
                        placeholder="Enter amount"
                        value={field.value === 0 ? "" : String(field.value)}
                        hasError={!!errors.milestones?.[index]?.paymentAmount}
                        onChangeText={(text) =>
                          field.onChange(Number(text.replace(/,/g, "")) || 0)
                        }
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

                {/* Payment Percentage */}
                <View className="pt-3">
                  <Controller
                    control={control}
                    name={`milestones.${index}.paymentPercentage`}
                    render={({ field }) => (
                      <FormInput
                        label="Payment Percentage (%)"
                        placeholder="Enter percentage"
                        value={field.value === 0 ? "" : String(field.value)}
                        hasError={
                          !!errors.milestones?.[index]?.paymentPercentage
                        }
                        onChangeText={(text) =>
                          field.onChange(Number(text.replace(/,/g, "")) || 0)
                        }
                        keyboardType="numeric"
                      />
                    )}
                  />
                  {errors.milestones?.[index]?.paymentPercentage && (
                    <Text className="font-inter pt-1 text-red-500 text-sm">
                      {errors.milestones[index]?.paymentPercentage?.message}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Portfolio Reference */}
          <View className="pt-4">
            <Controller
              control={control}
              name="portfolioReferences"
              render={() => (
                <FileUploadComponent
                  control={control}
                  name="portfolioReferences"
                  label="Portfolio Reference"
                  title="Upload Portfolio Reference"
                  note="PNG, JPG, PDF (max. 5MB)"
                  icon={reportImage}
                  maxSizeMB={5}
                  error={
                    portfolioReferenceError ||
                    (errors.portfolioReferences?.message as string)
                  }
                />
              )}
            />
          </View>

          {/* Submit */}
          <View className="pt-6 pb-10">
            <GradientButton
              title="Submit Revision"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              loadingText="Uploading..."
              disabled={!isPaymentValid || isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default Revisionscreen;
