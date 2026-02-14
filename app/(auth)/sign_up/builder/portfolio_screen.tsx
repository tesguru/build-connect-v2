import GradientButton from "@/components/Buttons/GradientButton";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import { arrowleft } from "@/constants/icon";
import { useBuilderProfileStore } from "@/store/BuilderProfileStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";
import Portfolio from "../../../../components/PagesComponent/Auth/BuilderAuthcomponents/Portfolio";
import { uploadFile } from "@/core/utils/fileUpload";
import Toast from "react-native-toast-message";
import { FileUploadResult } from "@/components/Forms/FileUploadComponent";
import { useAuth } from "@/core/hooks/useAuth";

const portfolioSchema = z.object({
  projectPhoto: z
    .object({
      uri: z.string(),
      name: z.string().optional(),
      type: z.string().optional(),
    })
    .nullable()
    .refine((val) => !!val, {
      message: "Project photo is required",
    }),
  startTime: z.string().min(1, "Select start time"),
  endTime: z.string().min(1, "Select end time"),
  availableDays: z.array(z.string()).min(1, "Select available days"),
  availableTime: z.string().min(1, "Available time is required"),
});

type PortfolioInput = z.infer<typeof portfolioSchema>;

export default function PortfolioScreen() {
  const router = useRouter();
  const { formData, setFormData, clearFormData } = useBuilderProfileStore();
  const [isUploading, setIsUploading] = useState(false);
  const { createProfileMutation } = useAuth();

  const methods = useForm<PortfolioInput>({
    resolver: zodResolver(portfolioSchema),
    mode: "onChange",
    defaultValues: {
      projectPhoto: formData.projectPhoto || null,
      startTime: formData.startTime || "",
      endTime: formData.endTime || "",
      availableDays: formData.availableDays || [],
      availableTime: formData.availableTime || "",
    },
  });

  const { handleSubmit, trigger, getValues } = methods;

  const handleBack = () => {
    if (!isUploading) {
      router.back();
    }
  };

  const prepareFileForUpload = async (fileData: any): Promise<FileUploadResult> => {
    // Check if it's already in the correct format
    if ('size' in fileData && 'name' in fileData) {
      return fileData as FileUploadResult;
    }

    // Convert from image picker format
    const response = await fetch(fileData.uri);
    const blob = await response.blob();
    const fileName = fileData.uri.split('/').pop() || 'image.jpg';
    
    return {
      uri: fileData.uri,
      name: fileName,
      type: fileData.type || 'image/jpeg',
      width: fileData.width,
      height: fileData.height,
      size: blob.size,
    };
  };

  const onSubmit = async (data: PortfolioInput) => {
    try {
      setIsUploading(true);

      // Collect all formData
      const allFormData = { ...formData, ...data };
      console.log("Form data before upload:", allFormData);

      // Step 1: Prepare upload promises for all files
      const uploadPromises: Promise<{ key: string; fileId: string | null }>[] = [];

      // Upload profilePhoto (from BasicInfo)
      if (allFormData.profilePhoto) {
        uploadPromises.push(
          prepareFileForUpload(allFormData.profilePhoto)
            .then(fileData => uploadFile(fileData, "profile_picture", "Profile Picture"))
            .then(result => ({ key: 'profilePictureId', fileId: result.fileId }))
        );
      }

      // Upload contractorLicense (from ProfessionalDocumentation)
      if (allFormData.contractorLicense) {
        uploadPromises.push(
          prepareFileForUpload(allFormData.contractorLicense)
            .then(fileData => uploadFile(fileData, "business_license", "Business License"))
            .then(result => ({ key: 'businessLicenseId', fileId: result.fileId }))
        );
      }

      // Upload insuranceDocumentation (from ProfessionalDocumentation)
      if (allFormData.insuranceDocumentation) {
        uploadPromises.push(
          prepareFileForUpload(allFormData.insuranceDocumentation)
            .then(fileData => uploadFile(fileData, "insurance_document", "Insurance Document"))
            .then(result => ({ key: 'insuranceDocumentId', fileId: result.fileId }))
        );
      }

      // Upload additionalInformation (certificationId) (from ProfessionalDocumentation)
      if (allFormData.additionalInformation) {
        uploadPromises.push(
          prepareFileForUpload(allFormData.additionalInformation)
            .then(fileData => uploadFile(fileData, "certification", "Certification"))
            .then(result => ({ key: 'certificationId', fileId: result.fileId }))
        );
      }

      // Upload projectPhoto (workShowcaseIds) (from Portfolio)
      if (allFormData.projectPhoto) {
        uploadPromises.push(
          prepareFileForUpload(allFormData.projectPhoto)
            .then(fileData => uploadFile(fileData, "work_showcase", "Work Showcase"))
            .then(result => ({ key: 'workShowcaseIds', fileId: result.fileId }))
        );
      }

      // Step 2: Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);
      
      // Check if all uploads were successful
      const failedUploads = uploadResults.filter(result => !result.fileId);
      if (failedUploads.length > 0) {
        throw new Error("One or more files failed to upload");
      }

      console.log("Upload results:", uploadResults);

      // Step 3: Build the file IDs object
      const fileIds: Record<string, string | string[]> = {};
      uploadResults.forEach(({ key, fileId }) => {
        if (fileId) {
          if (key === 'workShowcaseIds') {
            // workShowcaseIds should be an array
            fileIds[key] = [fileId];
          } else {
            fileIds[key] = fileId;
          }
        }
      });

      // Step 4: Format the data to match API expectations
      const formatTime = (time: string) => time;

      const formatDays = (days: string[]) => {
        return days.map(day => day.toLowerCase());
      };

      const apiPayload = {
        businessName: allFormData.businessName,
        location: allFormData.location,
        experienceRangeId: allFormData.experienceRangeId,
        projectTypeIds: allFormData.projectTypes || [],
        workingHoursStart: formatTime(allFormData.startTime),
        workingHoursEnd: formatTime(allFormData.endTime),
        availableDays: formatDays(allFormData.availableDays),
        availabilityOptionId: allFormData.availableTime,
        ...fileIds, 
      };

      console.log("API Payload:", apiPayload);

      // Step 5: Submit to mutation
      createProfileMutation.mutate(apiPayload);

    } catch (error: any) {
      console.error("Upload error:", error);
      setIsUploading(false);

      let errorMessage = "Failed to upload files. Please try again.";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: errorMessage,
      });
    }
  };

  const handleComplete = async () => {
    const fields: (keyof PortfolioInput)[] = [
      "startTime",
      "endTime",
      "availableDays",
      "projectPhoto",
      "availableTime",
    ];
    const valid = await trigger(fields);

    if (valid) {
      handleSubmit(onSubmit)();
    }
  };

  // Handle mutation loading state
  const isLoading = isUploading || createProfileMutation.isPending;

  return (
    <KeyboardAvoidingLayout androidExtraPadding={40}>
      <FormProvider {...methods}>
        <View className="p-4 flex-1">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={handleBack} disabled={isLoading}>
              <Image
                source={arrowleft}
                style={{ width: 25, height: 25, opacity: isLoading ? 0.5 : 1 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text className="text-center font-interbold text-xl flex-1">
              Portfolio
            </Text>
            <View style={{ width: 25 }} />
          </View>

          <View className="pt-10 flex-1">
            <Portfolio />
          </View>

          <View className="pb-4 pt-6">
            <GradientButton 
              title="Complete Setup" 
              onPress={handleComplete}
              loading={isLoading}
            />
          </View>
        </View>
      </FormProvider>
    </KeyboardAvoidingLayout>
  );
}