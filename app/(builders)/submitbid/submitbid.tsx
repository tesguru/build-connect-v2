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
import { LookupService } from "@/core/services/lookup/LookupService";
import { uploadFile } from "@/core/utils/fileUpload";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircle, Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

const milestoneSchema = z.object({
  milestoneName: z.string().trim().min(1, "Milestone name is required"),
  description: z.string().trim().min(1, "Description is required"),
  completionDate: z.string().min(1, "Completion date is required"),
  paymentAmount: z.number().positive("Payment amount must be greater than 0"),
  paymentPercentage: z.number().default(100),
  orderIndex: z.number().optional(),
});

const submitBidSchema = z.object({
  bidAmount: z.number().positive("Bid amount is required"),
  proposedTimeline: z.string().min(1, "Proposed timeline is required"),
  proposal: z.string().trim().min(1, "Proposal is required"),
  portfolioReferences: z.any().nullable().optional(),
  milestones: z
    .array(milestoneSchema)
    .min(1, "At least one milestone is required"),
});

type MilestoneInput = {
  milestoneName: string;
  description: string;
  completionDate: string;
  paymentAmount: number;
  paymentPercentage: number;
  orderIndex?: number;
};

type SubmitBidFormValues = z.infer<typeof submitBidSchema>;

export default function SubmitBidScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { projectId, currency } = useLocalSearchParams<{
    projectId: string;
    currency?: string;
  }>();
  const { setCurrency, currencySymbol } = useCurrencyStore();

  React.useEffect(() => {
    if (currency) {
      setCurrency(currency);
    }
  }, [currency]);

  const formatCurrency = (value: number | null) =>
    `${currencySymbol}${value != null ? value.toLocaleString() : 0}`;

  const { data: timelinesRaw, isLoading: timelinesLoading } = useQuery({
    queryKey: ["getTimeline"],
    queryFn: async () => {
      const res = await LookupService.getTimelines();
      return res.data.data.items;
    },
  });

  const timelineOptions = (timelinesRaw || []).map((t: any) => ({
    label: t.label,
    value: t.value,
    id: t.id,
  }));

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SubmitBidFormValues>({
    resolver: zodResolver(submitBidSchema),
    defaultValues: {
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

  const milestones = watch("milestones");
  const bidAmount = watch("bidAmount");
  const milestonesTotal = (milestones || []).reduce(
    (sum, m) => sum + (Number(m.paymentAmount) || 0),
    0,
  );
  const amountsMatch = milestonesTotal === Number(bidAmount);

  const { submitBidMutation, submitBidSuccess } = useBids();

  const showError = (message: string) => {
    Toast.show({ type: "error", text1: "Validation Error", text2: message });
  };

  const onSubmit = async (data: SubmitBidFormValues) => {
    setIsSubmitting(true);
    try {
      if (milestonesTotal !== Number(data.bidAmount)) {
        showError(
          `Milestone payments (${milestonesTotal}) must equal bid amount (${data.bidAmount})`,
        );
        setIsSubmitting(false);
        return;
      }

      let portfolioReferenceId: string | undefined;
      if (data.portfolioReferences) {
        const uploaded = await uploadFile(
          data.portfolioReferences,
          "portfolio",
          "Portfolio Reference",
        );
        portfolioReferenceId = uploaded.id;
      }

      const selectedTimeline = timelineOptions.find(
        (t: any) => t.value === data.proposedTimeline,
      );

      const payload = {
        projectId,
        bidAmount: Number(data.bidAmount),
        proposedTimeline: selectedTimeline?.label ?? data.proposedTimeline,
        proposal: data.proposal,
        portfolioReferences: portfolioReferenceId ? [portfolioReferenceId] : [],
        milestones: data.milestones.map((m, index) => ({
          milestoneName: m.milestoneName,
          description: m.description || "",
          completionDate: m.completionDate.split("T")[0],
          paymentAmount: Number(m.paymentAmount),
          paymentPercentage: m.paymentPercentage || 100,
          orderIndex: index + 1,
        })),
      };

      submitBidMutation.mutate(payload, {
        onSuccess: () => {
          // Success handled by submitBidSuccess check
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to submit bid.";
          Toast.show({
            type: "error",
            text1: "Submission Failed",
            text2: message,
          });
        },
      });
    } catch (err: any) {
      setIsSubmitting(false);
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: err?.message || "Failed to submit bid.",
      });
    }
  };

  const isLoading = isSubmitting || submitBidMutation.isPending;

  // ── Success Screen ────────────────────────────────────────────────────────
  if (submitBidSuccess) {
    return (
      <SuccessScreen
        title="Bid Submitted"
        message="Your bid has been submitted successfully. The client will review it shortly."
        buttonTitle="Return home"
        navigateTo="/(tab)"
      />
    );
  }

  return (
    <AppLayout screenName="Submit Bid">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 flex-1 pb-8">
          {/* Bid Amount */}
          <View className="pt-4">
            <Controller
              control={control}
              name="bidAmount"
              render={({ field }) => (
                <FormInput
                  label={`Bid Amount (${currencySymbol})`}
                  placeholder="Enter bid amount"
                  value={field.value !== 0 ? String(field.value) : ""}
                  onChangeText={(text: string) =>
                    field.onChange(Number(text.replace(/,/g, "")) || 0)
                  }
                  hasError={!!errors.bidAmount}
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

          <View className="pt-4">
            <DropdownField
              name="proposedTimeline"
              control={control}
              label="Proposed Timeline"
              placeholder={timelinesLoading ? "Loading..." : "Select timeline"}
              data={timelineOptions}
              error={errors.proposedTimeline?.message as string}
            />
          </View>

          <View className="pt-4">
            <Controller
              control={control}
              name="proposal"
              render={({ field }) => (
                <FormTextArea
                  label="Project Proposal"
                  placeholder="Briefly introduce yourself and why you're the best fit..."
                  value={field.value}
                  onChangeText={field.onChange}
                  hasError={!!errors.proposal}
                  errorMessage={errors.proposal?.message}
                  width="w-full"
                />
              )}
            />
          </View>

          <View className="mt-4 p-3 bg-blue-50 rounded-lg">
            <View className="flex-row justify-between items-center">
              <Text className="font-inter font-medium">Payment Summary</Text>
              <Text
                className={`font-inter ${amountsMatch ? "text-green-600" : "text-red-600"}`}
              >
                {amountsMatch ? "✓ Valid" : "✗ Invalid"}
              </Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="font-inter text-gray-600">Bid Amount:</Text>
              <Text className="font-inter font-medium">
                {formatCurrency(Number(bidAmount))}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="font-inter text-gray-600">
                Total Milestone Payments:
              </Text>
              <Text className="font-inter font-medium">
                {formatCurrency(milestonesTotal)}
              </Text>
            </View>
            {!amountsMatch && (
              <View className="flex-row items-center mt-2 p-2 bg-red-50 rounded">
                <AlertCircle size={16} color="#EF4444" />
                <Text className="text-red-600 text-sm flex-1 ml-2">
                  Milestone payments ({milestonesTotal}) must equal bid amount (
                  {bidAmount})
                </Text>
              </View>
            )}
          </View>

          <View className="mt-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-worksanssemibold text-xl">Milestones</Text>
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

                <Controller
                  control={control}
                  name={`milestones.${index}.milestoneName`}
                  render={({ field: f }) => (
                    <FormInput
                      label="Milestone Name"
                      placeholder="e.g Foundation"
                      value={f.value}
                      onChangeText={f.onChange}
                      hasError={!!errors.milestones?.[index]?.milestoneName}
                    />
                  )}
                />
                {errors.milestones?.[index]?.milestoneName && (
                  <Text className="font-inter pt-1 text-red-500 text-sm">
                    {errors.milestones[index]?.milestoneName?.message}
                  </Text>
                )}

                <View className="py-4">
                  <Controller
                    control={control}
                    name={`milestones.${index}.description`}
                    render={({ field: f }) => (
                      <FormTextArea
                        label="Description"
                        placeholder="Describe this milestone..."
                        value={f.value}
                        onChangeText={f.onChange}
                        hasError={!!errors.milestones?.[index]?.description}
                        errorMessage={
                          errors.milestones?.[index]?.description?.message
                        }
                        width="w-full"
                      />
                    )}
                  />
                </View>

                <Controller
                  control={control}
                  name={`milestones.${index}.completionDate`}
                  render={({ field: f }) => (
                    <FormDatePicker
                      label="Completion Date"
                      value={f.value ? new Date(f.value) : new Date()}
                      onChange={(date: Date) =>
                        f.onChange(date.toISOString().split("T")[0])
                      }
                      hasError={!!errors.milestones?.[index]?.completionDate}
                      errorMessage={
                        errors.milestones?.[index]?.completionDate?.message
                      }
                    />
                  )}
                />

                <View className="pt-3">
                  <Controller
                    control={control}
                    name={`milestones.${index}.paymentAmount`}
                    render={({ field: f }) => (
                      <FormInput
                        label="Payment Amount"
                        value={f.value !== 0 ? String(f.value) : ""}
                        onChangeText={(text: string) =>
                          f.onChange(Number(text.replace(/,/g, "")) || 0)
                        }
                        keyboardType="numeric"
                        formatNumber
                        hasError={!!errors.milestones?.[index]?.paymentAmount}
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
            ))}

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
              className="flex-row gap-2 mt-4 items-center"
            >
              <Plus size={20} color="#2563eb" />
              <Text className="text-blue-600 font-inter">Add milestone</Text>
            </TouchableOpacity>
          </View>

          <View className="pt-4">
            <Controller
              control={control}
              name="portfolioReferences"
              render={({ field }) => (
                <FileUploadComponent
                  control={control}
                  name="portfolioReferences"
                  label="Portfolio Reference"
                  title="Upload Portfolio Reference"
                  note="PNG, JPG, PDF (max. 5MB)"
                  image={reportImage}
                  maxSizeMB={5}
                  value={field.value}
                  onChange={field.onChange}
                  error={
                    errors.portfolioReferences?.message as string | undefined
                  }
                />
              )}
            />
          </View>

          <View className="pt-6 pb-10">
            <GradientButton
              title="Submit Bid"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={!amountsMatch || isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </AppLayout>
  );
}
