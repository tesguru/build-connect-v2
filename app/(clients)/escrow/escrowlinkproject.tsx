import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormInput from "@/components/Forms/Formnput";
import DropdownField from "@/components/Forms/DropDown";
import GradientButton from "@/components/Buttons/GradientButton";
import AppLayout from "@/components/Layouts/AppLayout";
import colors from "@/constants/colors";
import { useProjects, Project } from "@/core/hooks/useProjects";
import Toast from "react-native-toast-message";
import { Upload } from "lucide-react-native";
import { LinkMortgageInput, linkMortgageSchema } from "@/core/schemas/dashboardschema";

const EscrowLinkProject = () => {
  const [queryParams] = useState({
    page: 1,
    limit: 100,
    includeProgress: true
  });

  const { getAllProjectsQuery } = useProjects();

  const { 
    data: apiResponse, 
    isLoading: isLoadingProjects,
  } = getAllProjectsQuery(queryParams);

  const projectsList: Project[] = apiResponse?.data?.data?.projects || 
                                  apiResponse?.data?.projects || 
                                  apiResponse?.projects || 
                                  [];

  // Transform projects for dropdown
  const projectsData = projectsList.map((project) => ({
    label: project.title,
    value: project.id,
    id: project.id,
  }));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LinkMortgageInput>({
    resolver: zodResolver(linkMortgageSchema),
    defaultValues: {
      projectId: "",
      accountNumber: "",
      bankName: "",
      amountAllocated: "",
      document: null,
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (data: LinkMortgageInput) => {
    try {
      setIsSubmitting(true);
      
      // Your API call here
      console.log("Form Data:", data);
      
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Mortgage linked to project successfully",
      });
      
      setIsSubmitting(false);
    } catch (error: any) {
      setIsSubmitting(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to link mortgage",
      });
    }
  };

  return (
    <AppLayout screenName="Link Project">
      <ScrollView 
        style={{ 
          backgroundColor: colors.background_light,
          flex: 1 
        }}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Select Project Section */}
        <View className="mb-6">
          
          <DropdownField
            name="projectId"
            control={control}
            label=" Select Project"
            placeholder={isLoadingProjects ? "Loading projects..." : "Select project"}
            data={projectsData}
            error={errors.projectId?.message as string}
          />
        </View>

        {/* Mortgage Details Section */}
        <View className="mb-6">
          <Text className="font-interbold text-base mb-4">
            Mortgage Details
          </Text>

          <View className="mb-4">
            <Controller
              control={control}
              name="accountNumber"
              render={({ field }) => (
                <FormInput
                  placeholder="Mortgage account number"
                  label="Account Number"
                  value={field.value}
                  hasError={!!errors.accountNumber}
                  onChangeText={field.onChange}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.accountNumber && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.accountNumber.message}
              </Text>
            )}
          </View>

          {/* Bank Name */}
          <View className="mb-4">
            <Controller
              control={control}
              name="bankName"
              render={({ field }) => (
                <FormInput
                  placeholder="e.g Abbey mortgage bank"
                  label="Bank Name"
                  value={field.value}
                  hasError={!!errors.bankName}
                  onChangeText={field.onChange}
                />
              )}
            />
            {errors.bankName && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.bankName.message}
              </Text>
            )}
          </View>

          {/* Amount Allocated */}
          <View className="mb-4">
            <Controller
              control={control}
              name="amountAllocated"
              render={({ field }) => (
                <FormInput
                  placeholder="Loan amount allocated to project"
                  label="Amount Allocated (Optional)"
                  value={field.value}
                  hasError={!!errors.amountAllocated}
                  onChangeText={field.onChange}
                  keyboardType="numeric"
                  formatNumber={true}
                />
              )}
            />
          </View>
        </View>

        {/* Document Section */}
        <View className="mb-6">
          <Text className="font-interbold text-base mb-4">
            Document
          </Text>

          {/* Upload Document - You'll work on this */}
          <View className="mb-2">
            <Text className="font-inter text-sm text-gray-600 mb-2">
              Upload Document (Optional)
            </Text>
            <TouchableOpacity 
              className="border border-gray-300 rounded-xl p-4 flex-row items-center justify-center bg-gray-50"
              activeOpacity={0.7}
            >
              <Upload size={20} color="#6b7280" />
              <Text className="ml-2 text-gray-600 font-inter">
                Upload Mortgage Agreement
              </Text>
            </TouchableOpacity>
            <Text className="font-inter text-xs text-gray-500 mt-2">
              No file uploaded
            </Text>
          </View>

          {/* Disclaimer */}
          <View className="bg-gray-100 p-4 rounded-xl mt-4">
            <Text className="font-inter text-xs text-gray-600 text-center leading-5">
              By linking your mortgage, you authorize BuildConnect to access payment information for this project. Please ensure all details are accurate
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-6 mb-4">
          <GradientButton 
            loading={isSubmitting} 
            title="Link Mortgage to Project" 
            onPress={handleSubmit(onSubmit)} 
          />
        </View>

        <View className="mb-8">
          <TouchableOpacity 
            className="border-2 border-red-500 rounded-full py-3 px-6"
            activeOpacity={0.7}
          >
            <Text className="text-red-500 font-interbold text-center text-base">
              Unlink Mortgage
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default EscrowLinkProject ;