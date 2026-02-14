import { View, Text } from "react-native";
import React from "react";
import ChooseTypeForm from "@/components/Forms/ChooseTypeForm";
import { useFormContext, useFormState } from "react-hook-form";
import { services } from "@/core/utils/data";

const Services = () => {
  const { control } = useFormContext();
  const { errors } = useFormState({ control });

  return (
    <View>
      <ChooseTypeForm
        control={control}
        data={services}
        title="What project are you planning?"
        name="services"
        rules={{ required: true }}
      />
      {errors.services && (
        <Text className="text-red-500 text-center font-inter mt-1">
          {errors.services.message as string}
        </Text>
      )}
    </View>
  );
};

export default Services;

