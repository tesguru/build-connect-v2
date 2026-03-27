import GradientButton from "@/components/Buttons/GradientButton";
import { FormDatePicker } from "@/components/Forms/DatePicker";
import FormInput from "@/components/Forms/Formnput";
import AppLayout from "@/components/Layouts/AppLayout";
import { arrowleft } from "@/constants/icon";
import { useMortgageStore } from "@/store/MortgageStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  emailAddress: z.string().email("Enter a valid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  currentAddress: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

type PersonalInfoInput = z.infer<typeof personalInfoSchema>;

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { id: propertyId } = useLocalSearchParams<{ id: string }>();
  const { formData, setFormData } = useMortgageStore();
  const [openDatePicker, setOpenDatePicker] = useState<string | null>(null);

  const methods = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
     mode: "onChange",
    defaultValues: {
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      dateOfBirth: formData.dateOfBirth || "",
      emailAddress: formData.emailAddress || "",
      phoneNumber: formData.phoneNumber || "",
      currentAddress: formData.currentAddress || "",
      city: formData.city || "",
      state: formData.state || "",
      postalCode: formData.postalCode || "",
    },
  });

  const { control, trigger, getValues, formState: { errors } } = methods;

  const handleBack = () => router.back();

  const handleContinue = async () => {
    const valid = await trigger();
    if (valid) {
      setFormData({ ...getValues(), propertyId });
      router.push("/mortgage/createmortgage/employment_info");
    }
  };

  return (
    <AppLayout screenName="Personal Info">
      <FormProvider {...methods}>
        <View className="p-4 flex-1">

          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={handleBack}>
              <Image source={arrowleft} style={{ width: 25, height: 25 }} resizeMode="contain" />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <View style={{ width: 25 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Text className="font-interbold text-2xl text-gray-900">Personal Information</Text>
            <Text className="font-inter text-gray-500 text-sm mt-1 mb-6">
              Tell us a bit about yourself
            </Text>

            {/* First + Last name */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field }) => (
                    <FormInput
                      label="First Name"
                      placeholder="John"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      hasError={!!errors.firstName}
                    />
                  )}
                />
                {errors.firstName && (
                  <Text className="text-red-500 text-xs mt-1 font-inter">{errors.firstName.message}</Text>
                )}
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field }) => (
                    <FormInput
                      label="Last Name"
                      placeholder="Doe"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      hasError={!!errors.lastName}
                    />
                  )}
                />
                {errors.lastName && (
                  <Text className="text-red-500 text-xs mt-1 font-inter">{errors.lastName.message}</Text>
                )}
              </View>
            </View>

            {/* Date of Birth */}
            <View className="mt-4">
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormDatePicker
                    label="Date of Birth"
                    value={field.value ? new Date(field.value) : new Date()}
                    onChange={(date) => field.onChange(date.toISOString())}
                    hasError={!!errors.dateOfBirth}
                    errorMessage={errors.dateOfBirth?.message}
                    isOpen={openDatePicker === "dob"}
                    onOpen={() => setOpenDatePicker("dob")}
                    onClose={() => setOpenDatePicker(null)}
                    maximumDate={new Date()}
                  />
                )}
              />
            </View>

            {/* Email */}
            <View className="mt-4">
              <Controller
                control={control}
                name="emailAddress"
                render={({ field }) => (
                  <FormInput
                    label="Email Address"
                    placeholder="john@example.com"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    hasError={!!errors.emailAddress}
                  />
                )}
              />
              {errors.emailAddress && (
                <Text className="text-red-500 text-xs mt-1 font-inter">{errors.emailAddress.message}</Text>
              )}
            </View>

            {/* Phone */}
            <View className="mt-4">
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormInput
                    label="Phone Number"
                    placeholder="+234 800 000 0000"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    keyboardType="phone-pad"
                    hasError={!!errors.phoneNumber}
                  />
                )}
              />
              {errors.phoneNumber && (
                <Text className="text-red-500 text-xs mt-1 font-inter">{errors.phoneNumber.message}</Text>
              )}
            </View>

            {/* Address */}
            <View className="mt-4">
              <Controller
                control={control}
                name="currentAddress"
                render={({ field }) => (
                  <FormInput
                    label="Current Address"
                    placeholder="12 Example Street"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    hasError={!!errors.currentAddress}
                  />
                )}
              />
              {errors.currentAddress && (
                <Text className="text-red-500 text-xs mt-1 font-inter">{errors.currentAddress.message}</Text>
              )}
            </View>

            {/* City + State */}
            <View className="flex-row gap-4 mt-4">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <FormInput
                      label="City"
                      placeholder="Lagos"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      hasError={!!errors.city}
                    />
                  )}
                />
                {errors.city && (
                  <Text className="text-red-500 text-xs mt-1 font-inter">{errors.city.message}</Text>
                )}
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="state"
                  render={({ field }) => (
                    <FormInput
                      label="State"
                      placeholder="Lagos"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      hasError={!!errors.state}
                    />
                  )}
                />
                {errors.state && (
                  <Text className="text-red-500 text-xs mt-1 font-inter">{errors.state.message}</Text>
                )}
              </View>
            </View>

            {/* Postal Code */}
            <View className="mt-4">
              <Controller
                control={control}
                name="postalCode"
                render={({ field }) => (
                  <FormInput
                    label="Postal Code"
                    placeholder="100001"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    keyboardType="numeric"
                    hasError={!!errors.postalCode}
                  />
                )}
              />
              {errors.postalCode && (
                <Text className="text-red-500 text-xs mt-1 font-inter">{errors.postalCode.message}</Text>
              )}
            </View>
          </ScrollView>

          <View className="pb-4 pt-6">
            <GradientButton title="Continue" onPress={handleContinue} />
          </View>
        </View>
      </FormProvider>
    </AppLayout>
  );
}