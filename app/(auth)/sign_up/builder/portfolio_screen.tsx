import GradientButton from "@/components/Buttons/GradientButton";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import { arrowleft } from "@/constants/icon";
import { useAuth } from "@/core/hooks/useAuth";
import { uploadFile } from "@/core/utils/fileUpload";
import { useBuilderProfileStore } from "@/store/BuilderProfileStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";
import Portfolio from "../../../../components/PagesComponent/Auth/BuilderAuthcomponents/Portfolio";

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

  const { handleSubmit, trigger } = methods;

  const handleBack = () => {
    if (!isUploading) {
      router.back();
    }
  };

  const onSubmit = async (data: PortfolioInput) => {
    try {
      setIsUploading(true);

      const allFormData = { ...formData, ...data };


      const fileIds: Record<string, string | string[]> = {};

      if (allFormData.profilePhoto) {
        const result = await uploadFile(allFormData.profilePhoto, "profile_picture", "Profile Picture");
        fileIds.profilePictureId = result.id;
      }

      if (allFormData.contractorLicense) {
        const result = await uploadFile(allFormData.contractorLicense, "business_license", "Business License");
        fileIds.businessLicenseId = result.id;
      }

      if (allFormData.insuranceDocumentation) {
        const result = await uploadFile(allFormData.insuranceDocumentation, "insurance_document", "Insurance Document");
        fileIds.insuranceDocumentId = result.id;
      }

      if (allFormData.additionalInformation) {
        const result = await uploadFile(allFormData.additionalInformation, "certification", "Certification");
        fileIds.certificationId = result.id;
      }

      if (allFormData.projectPhoto) {
        const result = await uploadFile(allFormData.projectPhoto, "work_showcase", "Work Showcase");
        fileIds.workShowcaseIds = [result.id]; 
      }

      const apiPayload = {
        businessName: allFormData.businessName,
        location: allFormData.location,
        experienceRangeId: allFormData.experienceRangeId,
        projectTypeIds: allFormData.projectTypes || [],
        workingHoursStart: allFormData.startTime,
        workingHoursEnd: allFormData.endTime,
        availableDays: allFormData.availableDays.map((day: string) => day.toLowerCase()),
        availabilityOptionId: allFormData.availableTime,
        ...fileIds,
      };

      createProfileMutation.mutate(apiPayload);

    } catch (error: any) {
      setIsUploading(false);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: error?.message ?? "Failed to upload files. Please try again.",
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