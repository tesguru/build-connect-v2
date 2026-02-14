import { View, Text } from "react-native";
import React, { useState } from "react";
import { Controller, useFormContext, useFormState } from "react-hook-form";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import { camera } from "@/constants/icon";
import DropdownField from "@/components/Forms/DropDown";
import { daysOfWeek, timeSlots } from "@/core/utils/data";
import { LookupService } from "@/core/services/lookup/LookupService";
import { useQuery } from "@tanstack/react-query";
import MultiSelectDropdownField from "@/components/Forms/MultiSelectForm";

const Portfolio = () => {
  const { control } = useFormContext();
  const { errors } = useFormState({ control });
  
  const [projectPhotoError, setProjectPhotoError] = useState<string | null>(null);

  const { data: availabilityOptions, isLoading: isLoadingBudgetRanges } = useQuery({
    queryKey: ["availabilityOptions"],
    queryFn: async () => {
      const response = await LookupService.getAvailabilityOptions();
      return response.data.data.items.map((item) => ({
        label: item.label,
        value: item.id,
      }));
    },
  });

  return (
    <View>
      <Text className="font-interbold text-2xl">Showcase Your Work</Text>
      <Text className="font-inter text-base pt-2 text-md">
        Add photo of your best projects here
      </Text>
      
      <View>
        <FileUploadComponent
          control={control}
          name="projectPhoto"
          label="Project Photos"
          title="Add photo of your work"
          note="PNG, JPG, PDF (max. 5MB)"
          icon={camera}
          maxSizeMB={5}
          error={projectPhotoError || (errors.projectPhoto?.message as string)}
          onError={(error) => setProjectPhotoError(error || null)}
        />
      </View>

      <View className="my-4">
        <Text className="text-xl font-interbold">Working hours</Text>
      </View>
      
      <View className="flex-row gap-6 pt-4">
        <View className="flex-1">
          <DropdownField
            name="startTime"
            control={control}
            label="Start time"
            placeholder="Select start time"
            data={timeSlots}
            error={errors.startTime?.message as string}
          />
        </View>
        <View className="flex-1">
          <DropdownField
            name="endTime"
            control={control}
            label="End time"
            placeholder="Select end time"
            data={timeSlots}
            error={errors.endTime?.message as string}
          />
        </View>
      </View>

      <View className="mt-5">
        <MultiSelectDropdownField
          name="availableDays"
          control={control}
          label="Available Days"
          placeholder="Choose Available days"
          data={daysOfWeek}
          error={errors.availableDays?.message}
        />
      </View>

      <View className="my-4">
        <Text className="text-xl font-interbold">Current Availability</Text>
      </View>

      <View>
        <DropdownField
          name="availableTime"
          control={control}
          label="Available Time"
          placeholder="Select available time"
          data={availabilityOptions || []}
          error={errors.availableTime?.message as string}
        />
      </View>
    </View>
  );
};

export default Portfolio;