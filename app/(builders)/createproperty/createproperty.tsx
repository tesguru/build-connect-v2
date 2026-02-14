import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

import {
  AddPropertyInput,
  addPropertySchema,
} from "@/core/schemas/dashboardschema";
import { Controller, useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/Forms/Formnput";
import { FormTextArea } from "@/components/Forms/TextArea";
import ImageUploadComponent from "@/components/Forms/ImageForm";
import { reportImage } from "@/constants/icon";
import GradientButton from "@/components/Buttons/GradientButton";
import DropdownField from "@/components/Forms/DropDown";
import { propertyTypes, rooms } from "@/core/utils/data";
import { useProperty } from "@/core/hooks/useProperty";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import AppLayout from "@/components/Layouts/AppLayout";

const CreateProperty = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddPropertyInput>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: {
      price: 0,
      keyfeatures: "",
      propertyTitle: "",
      propertyImage: null,
      location:"",
      propertyType: "",
      bedroom:"",
      bathroom:"",
      description: "",
    },
  });

  const { submitProperty, addPropertySucess } = useProperty();
  const onSubmit = (data: AddPropertyInput) => {
    submitProperty.mutate(data);
  };

  if (addPropertySucess) {
    return (
      <SuccessScreen
        title="Successfully !"
        message="Congratulations! Your Property Has Been Created Successfully"
        navigateTo="Dashboard"
        buttonTitle="Return Home"
      />
    );
  }

  return (
    <AppLayout screenName="Add Property Listing">

      <View className="px-3">
        <View>
          <Controller
            control={control}
            name="propertyTitle"
            render={({ field }) => (
              <FormInput
                placeholder="Enter Property Title"
                label="Property Title"
                value={String(field.value)}
                hasError={!!errors.propertyTitle}
                 onChangeText={field.onChange}
              />
            )}
          />
          {errors.propertyTitle && (
            <Text className="font-inter pt-1 text-red-500 text-sm">
              {errors.propertyTitle.message}
            </Text>
          )}
        </View>

        <View className="flex-row gap-6 pt-4">
          <View className="flex-1">
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <FormInput
                  placeholder="Enter Price"
                  label="Price(#)"
                  value={field.value}
                  hasError={!!errors.price}
                 onChangeText={(text) => field.onChange(Number(text))}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.price && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.price.message}
              </Text>
            )}
          </View>
          <View className="flex-1 pt-3">
            <DropdownField
              name="propertyType"
              control={control}
              label="Project type"
              placeholder="Select project type"
              data={propertyTypes}
              error={errors.propertyType?.message as string}
            />
          </View>
        </View>

        <View className="pt-2">
         <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <FormInput
                placeholder="Enter Location"
                label="Location"
                value={String(field.value)}
                hasError={!!errors.location}
                  onChangeText={field.onChange}
              />
            )}
          />
          {errors.location && (
            <Text className="font-inter pt-1 text-red-500 text-sm">
              {errors.location.message}
            </Text>
          )}
        </View>

           <View className="flex-row gap-6 pt-5">
          <View className="flex-1">
           <DropdownField
              name="bedroom"
              control={control}
              label="Bedrooms"
              placeholder="Select Bedrooms"
              data={rooms}
              error={errors.bedroom?.message as string}
            />
          </View>
          <View className="flex-1">
            <DropdownField
              name="bathroom"
              control={control}
              label="Bathrooms"
              placeholder="Select Bathrooms"
              data={rooms}
              error={errors.bathroom?.message as string}
            />
          </View>
        </View>

          <View className="pt-4">
                  <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <FormTextArea
                        label="Description"
                        placeholder="Describe the property"
                        value={field.value}
                        onChangeText={field.onChange}
                        hasError={!!errors.description}
                        errorMessage={errors.description?.message}
                        width="w-full"
                      />
                    )}
                  />
                </View>

                  <View className="pt-4">
                          <Controller
                            control={control}
                            name="keyfeatures"
                            render={({ field }) => (
                              <FormTextArea
                                label="Key Features"
                                placeholder=""
                                value={field.value}
                                onChangeText={field.onChange}
                                hasError={!!errors.keyfeatures}
                                errorMessage={errors.keyfeatures?.message}
                                width="w-full"
                              />
                            )}
                          />
                        </View>

        <View>
          <Controller
            control={control}
            name="propertyImage"
            render={() => (
              <ImageUploadComponent
                title="click to uplaod or drag and drop"
                image={reportImage}
                label={"Upload Media"}
                note="PNG, JPG, PDF(max. 5MB)"
                control={control}
                name="propertyImage"
                error={errors.propertyImage?.message as string | undefined}
              />
            )}
          />
        </View>

        <View className="pt-6">
          <GradientButton
            loading={submitProperty.isPending}
            title="Publish Listing"
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </AppLayout>
  );
};

export default CreateProperty;
