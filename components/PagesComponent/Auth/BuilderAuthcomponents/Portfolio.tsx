import DropdownField from "@/components/Forms/DropDown";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import MultiSelectDropdownField from "@/components/Forms/MultiSelectForm";
import TimePicker from "@/components/Forms/TimePicker";
import { camera } from "@/constants/icon";
import { LookupService } from "@/core/services/lookup/LookupService";
import { daysOfWeek } from "@/core/utils/data";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Controller, useFormContext, useFormState } from "react-hook-form";
import { Text, View } from "react-native";

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
        {/* Start Time */}
        <View className="flex-1">
          <Controller
            control={control}
            name="startTime"
            render={({ field }) => (
              <TimePicker
                label="Start time"
                placeholder="e.g 08:00"
                value={field.value}
                onChange={field.onChange}
                hasError={!!errors.startTime}
                errorMessage={errors.startTime?.message as string}
              />
            )}
          />
        </View>

        {/* End Time */}
        <View className="flex-1">
          <Controller
            control={control}
            name="endTime"
            render={({ field }) => (
              <TimePicker
                label="End time"
                placeholder="e.g 17:00"
                value={field.value}
                onChange={field.onChange}
                hasError={!!errors.endTime}
                errorMessage={errors.endTime?.message as string}
              />
            )}
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