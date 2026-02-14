import React, { useState } from "react";
import { View, Text } from "react-native";
import { useFormContext, Controller, useFormState } from "react-hook-form";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import DropdownField from "@/components/Forms/DropDown";
import FormInput from "@/components/Forms/Formnput";
import { camera } from "@/constants/icon";
import { LookupService } from "@/core/services/lookup/LookupService";
import { useQuery } from "@tanstack/react-query";
import MultiSelectDropdownField from "@/components/Forms/MultiSelectForm";

const BasicInfo = () => {
  const { control } = useFormContext();
  const { errors } = useFormState({ control });
  
  const [profilePhotoError, setProfilePhotoError] = useState<string | null>(null);

  const { data: experienceYears, isLoading: isLoadingBudgetRanges } = useQuery({
    queryKey: ["experienceYears"],
    queryFn: async () => {
      const response = await LookupService.getExperienceRanges();
      return response.data.data.items.map((item) => ({
        label: item.label,
        value: item.id,
      }));
    },
  });

  const { data: projectTypesResponse, isLoading: isLoadingProjectTypes } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => {
      const response = await LookupService.getProjectTypes();
      return response.data.data.items;
    },
  });

  const projectTypesData = projectTypesResponse?.map((item) => ({
    label: item.label,
    value: item.id,
    id: item.id,
  })) || [];

  return (
    <View className="flex-1">
      <View>
        <Text className="font-interbold text-2xl">Basic Profile</Text>
        <Text className="font-inter text-base pt-2 text-md text-text_tertiary">
          Tell us about yourself and your business location
        </Text>
      </View>

      <View className="pt-8">
        <FileUploadComponent
          control={control}
          name="profilePhoto"
          label="Profile Photo"
          title="Upload your professional photo"
          note="Builders with photos get 3x more responses (max. 5MB)"
          icon={camera}
          maxSizeMB={5}
          error={profilePhotoError || (errors.profilePhoto?.message as string)}
          onError={(error) => setProfilePhotoError(error || null)}
        />

        <View className="pt-6 gap-4">
          <View>
            <Controller
              control={control}
              name="businessName"
              render={({ field }) => (
                <FormInput
                  placeholder="Business Name"
                  label="Business Name"
                  value={field.value}
                  hasError={!!errors.businessName}
                  onChangeText={field.onChange}
                />
              )}
            />
            {errors.businessName && (
              <Text className="text-red-500 font-inter text-sm mt-1">
                {errors.businessName.message as string}
              </Text>
            )}
          </View>

          <View>
            <Controller
              control={control}
              name="location"
              render={({ field }) => (
                <FormInput
                  placeholder="Location"
                  label="Location"
                  value={field.value}
                  hasError={!!errors.location}
                  onChangeText={field.onChange}
                />
              )}
            />
            {errors.location && (
              <Text className="text-red-500 font-inter text-sm mt-1">
                {errors.location.message as string}
              </Text>
            )}
          </View>

          <DropdownField
            name="experienceRangeId"
            control={control}
            label="Years of Experience"
            placeholder="Select years of experience"
            data={experienceYears || []}
            error={errors.experienceRangeId?.message as string}
          />

          <MultiSelectDropdownField
            name="projectTypes"
            control={control}
            label="Select Project Types"
            placeholder="Choose Project Types"
            data={projectTypesData}
            error={errors.projectTypes?.message}
          />
        </View>
      </View>
    </View>
  );
};

export default BasicInfo;