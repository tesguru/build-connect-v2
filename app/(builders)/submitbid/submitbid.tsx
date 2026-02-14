import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react"; 
import { useLocalSearchParams } from "expo-router";
import { SubmitBidInput, submitBidSchema } from "@/core/schemas/dashboardschema";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/Forms/Formnput";
import { FormTextArea } from "@/components/Forms/TextArea";
import { FormDatePicker } from "@/components/Forms/DatePicker";
import { X, Plus, AlertCircle } from "lucide-react-native";
import { reportImage } from "@/constants/icon";
import GradientButton from "@/components/Buttons/GradientButton";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import AppLayout from "@/components/Layouts/AppLayout";
import { useBids } from "@/core/hooks/UseBids";
import { uploadFile } from "@/core/utils/fileUpload";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";

const SubmitBidScreen = () => {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [isUploading, setIsUploading] = useState(false); 
  const [portfolioReferenceError, setPortfolioReferenceError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SubmitBidInput>({
    resolver: zodResolver(submitBidSchema),
    defaultValues: {
      bidAmount: 0,
      proposedTimeline: "",
      proposal: "",
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
      portfolioReferences: null,
    },
  });

  // Watch form values to calculate totals
  const bidAmount = watch("bidAmount");
  const milestones = watch("milestones");

  // Calculate total milestone payments
  const calculateTotalMilestonePayments = () => {
    if (!milestones || milestones.length === 0) return 0;
    return milestones.reduce((total, milestone) => {
      return total + (Number(milestone.paymentAmount) || 0);
    }, 0);
  };

  // Check if milestone payments match bid amount
  const checkPaymentValidation = () => {
    const totalMilestonePayments = calculateTotalMilestonePayments();
    const isValid = totalMilestonePayments === bidAmount;
    
    if (!isValid) {
      setValidationError(`Milestone payments (${totalMilestonePayments}) must equal bid amount (${bidAmount})`);
    } else {
      setValidationError(null);
    }
    
    return isValid;
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

  const { submitBidMutation, submitBidSuccess } = useBids();

  const onSubmit = async (data: SubmitBidInput) => {
    try {
      // Check milestone payments before submitting
      if (!checkPaymentValidation()) {
        return;
      }

      setIsUploading(true);
      setPortfolioReferenceError(null);
      
      const uploadResult = await uploadFile(
        data.portfolioReferences,
        "portfolio", 
        "Portfolio Reference"
      );
      
      const milestonesArray = data.milestones.map((milestone, index) => ({
        milestoneName: milestone.milestoneName,
        description: milestone.description || "",
        completionDate: milestone.completionDate.split('T')[0],
        paymentAmount: Number(milestone.paymentAmount),
        paymentPercentage: milestone.paymentPercentage,
        orderIndex: index,
      }));
      
      const submitData = {
        projectId: projectId || "",
        bidAmount: Number(data.bidAmount),
        proposedTimeline: data.proposedTimeline,
        proposal: data.proposal,
        portfolioReferences: [uploadResult.fileId],
        milestones: milestonesArray,
      };
      
      submitBidMutation.mutate(submitData);
      
    } catch (error: any) {
      let errorMessage = "Failed to submit bid.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setPortfolioReferenceError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Display payment validation summary
  const totalMilestonePayments = calculateTotalMilestonePayments();
  const isPaymentValid = totalMilestonePayments === bidAmount;

  if (submitBidSuccess) {
    return (
      <SuccessScreen
        title="Bid Submitted"
        message="Your bid has been successfully submitted."
        navigateTo="/my-bids"
        buttonTitle="View my Bids"
      />
    );
  }

  return (
    <AppLayout screenName="Submit Bid">
      <Text className="font-inter px-3 pt-4">
        You are submitting a bid
      </Text>

      <View className="px-3">
        {/* Bid Amount */}
        <View>
          <Controller
            control={control}
            name="bidAmount"
            render={({ field }) => (
              <FormInput
                placeholder="Enter bid amount"
                label="Bid Amount"
                value={String(field.value)}
                hasError={!!errors.bidAmount}
                onChangeText={(text) => field.onChange(Number(text))}
                keyboardType="numeric"
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
          <Controller
            control={control}
            name="proposedTimeline"
            render={({ field }) => (
              <FormInput
                placeholder="e.g., 3 months"
                label="Proposed Timeline"
                value={field.value}
                hasError={!!errors.proposedTimeline}
                onChangeText={field.onChange}
              />
            )}
          />
          {errors.proposedTimeline && (
            <Text className="font-inter pt-1 text-red-500 text-sm">
              {errors.proposedTimeline.message}
            </Text>
          )}
        </View>

        {/* Project Proposal */}
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
            <Text className={`font-inter ${isPaymentValid ? 'text-green-600' : 'text-red-600'}`}>
              {isPaymentValid ? '✓ Valid' : '✗ Invalid'}
            </Text>
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="font-inter text-gray-600">Bid Amount:</Text>
            <Text className="font-inter font-medium">${bidAmount || 0}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-inter text-gray-600">Total Milestone Payments:</Text>
            <Text className="font-inter font-medium">${totalMilestonePayments}</Text>
          </View>
          {!isPaymentValid && (
            <View className="flex-row items-center mt-2 p-2 bg-red-50 rounded">
              <AlertCircle size={16} color="#EF4444" className="mr-2" />
              <Text className="text-red-600 text-sm flex-1">
                Milestone payments (${totalMilestonePayments}) must equal bid amount (${bidAmount || 0})
              </Text>
            </View>
          )}
        </View>

        {/* Milestones Section */}
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
            <View key={field.id} className="border border-gray-300 rounded-xl p-4 mb-4 pb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-inter text-xl">Milestone {index + 1}</Text>
                {fields.length > 1 && (
                  <TouchableOpacity onPress={() => remove(index)}>
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>

              <View>
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
              </View>

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
                      height={80}
                    />
                  )}
                />
              </View>

              <View className="mt-4">
                <Controller
                  control={control}
                  name={`milestones.${index}.completionDate`}
                  render={({ field }) => (
                    <FormDatePicker
                      label="Completion Date"
                      value={field.value ? new Date(field.value) : new Date()}
                      onChange={(date) => field.onChange(date.toISOString().split('T')[0])}
                      hasError={!!errors.milestones?.[index]?.completionDate}
                    />
                  )}
                />
              </View>

              <View className="pt-3">
                <Controller
                  control={control}
                  name={`milestones.${index}.paymentAmount`}
                  render={({ field }) => (
                    <FormInput
                      placeholder="Enter amount"
                      label="Payment Amount"
                      value={String(field.value)}
                      hasError={!!errors.milestones?.[index]?.paymentAmount}
                      onChangeText={(text) => field.onChange(Number(text))}
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>

              <View className="pt-3">
                <Controller
                  control={control}
                  name={`milestones.${index}.paymentPercentage`}
                  render={({ field }) => (
                    <FormInput
                      placeholder="Enter percentage"
                      label="Payment Percentage (%)"
                      value={String(field.value)}
                      hasError={!!errors.milestones?.[index]?.paymentPercentage}
                      onChangeText={(text) => field.onChange(Number(text))}
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Portfolio Reference Upload */}
        <View>
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
            onError={(error) => setPortfolioReferenceError(error || null)} 
            containerClassName="pt-10"
          />
        </View>

        {/* Submit Button */}
        <View className="pt-6">
          <GradientButton 
            loading={submitBidMutation.isPending || isUploading} 
            title="Submit Bid" 
            onPress={handleSubmit(onSubmit)} 
            disabled={!isPaymentValid || submitBidMutation.isPending || isUploading}
          />
        </View>
      </View>
    </AppLayout>
  );
};

export default SubmitBidScreen;