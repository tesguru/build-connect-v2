import GradientButton from "@/components/Buttons/GradientButton";
import TermsAgreement from "@/components/Forms/CheckBox";
import FormInput from "@/components/Forms/Formnput";
import PasswordInput from "@/components/Forms/PasswordInput";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import AuthLink from "@/components/Miscallaneous/AuthLink";
import { arrowleft } from "@/constants/icon";
import { BuildConnectImage } from "@/constants/image";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import PhoneFormInput from "@/components/Forms/PhoneNumberInput";
import colors from "@/constants/colors";
import { useAuth } from "@/core/hooks/useAuth";
import { SignUpInput, userSchema } from "@/core/schemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

const SignUpScreen = () => {
  // Get params from Expo Router
  const { selectedRole } = useLocalSearchParams<{ selectedRole?: string }>();
  const router = useRouter();

  const handleBack = () => {
    router.push("/get_started");
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      password: "",
      termsAccepted: false,
      role:
        selectedRole?.trim().toLowerCase() === "client" ? "client" : "builder",
    },
  });

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState<string>("");
  const { registerMutation } = useAuth();

  const onSubmit = (data: SignUpInput) => {
    const submitData = {
      ...data,
      mobileNumber: formattedPhoneNumber || data.mobileNumber,
    };

    registerMutation.mutate(submitData, {
      onSuccess: () => {
        router.replace({
          pathname: "/sign_up/verify_email",
          params: {
            email: data.email,
            role: data.role,
          },
        });
      },
    });
  };

  return (
    <KeyboardAvoidingLayout androidExtraPadding={75}>
      <View className="px-4 flex-1">
        <TouchableOpacity className="pt-10" onPress={handleBack}>
          <Image
            source={arrowleft}
            resizeMode="contain"
            style={{ width: 28, height: 28 }}
          />
        </TouchableOpacity>

        <View className="items-center pt-8">
          <Image
            className="w-[240px] h-[80px]"
            source={BuildConnectImage}
            resizeMode="contain"
          />
        </View>

        <View className="mt-6">
          <Text className="font-work-sans text-black text-center pb-6 text-3xl">
            {selectedRole === "client"
              ? "Sign up to hire builder"
              : "Sign up to find work"}
          </Text>

          {/* <View className="pb-4">
            <ButtonWithIcon
              icon={AppleImage}
              textColor="black"
              title="Continue With Apple"
              onPress={() => {}}
            />
          </View> */}
        </View>

        {/* <View className="mt-8 mb-4">
          <DividerWithText text="or" />
        </View> */}

        <View className="space-y-4">
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <FormInput
                    placeholder="Enter first name"
                    label="First Name"
                    value={field.value}
                    hasError={!!errors.firstName}
                    onChangeText={field.onChange}
                  />
                )}
              />
              {errors.firstName && (
                <Text className="font-inter pt-1 text-red-500 text-sm">
                  {errors.firstName.message}
                </Text>
              )}
            </View>

            <View className="flex-1">
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <FormInput
                    placeholder="Enter last name"
                    label="Last Name"
                    value={field.value}
                    hasError={!!errors.lastName}
                    onChangeText={field.onChange}
                  />
                )}
              />
              {errors.lastName && (
                <Text className="font-inter pt-1 text-red-500 text-sm">
                  {errors.lastName.message}
                </Text>
              )}
            </View>
          </View>

          <View>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <FormInput
                  placeholder="user@gmail.com"
                  label="Email"
                  value={field.value}
                  hasError={!!errors.email}
                  onChangeText={(text) => field.onChange(text.toLowerCase())}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              )}
            />
            {errors.email && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.email.message}
              </Text>
            )}
          </View>

          <View>
            <Controller
              control={control}
              name="mobileNumber"
              render={({ field }) => (
                <PhoneFormInput
                  placeholder="Enter phone number"
                  label="Mobile Number"
                  value={field.value}
                  selectedCountry={selectedCountry}
                  onChangeCountry={setSelectedCountry}
                  onChangeText={field.onChange}
                  onChangeFormattedText={setFormattedPhoneNumber}
                  hasError={!!errors.mobileNumber}
                  onBlur={field.onBlur}
                  defaultCountry="NG"
                />
              )}
            />
            {errors.mobileNumber && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.mobileNumber.message}
              </Text>
            )}
          </View>

          <View className="pb-2">
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <PasswordInput
                  placeholder="Password (8 or more characters)"
                  label="Password"
                  value={field.value}
                  onChangeText={field.onChange}
                  hasError={!!errors.password}
                />
              )}
            />
            {errors.password && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.password.message}
              </Text>
            )}
          </View>

          <Controller
            control={control}
            name="termsAccepted"
            render={({ field: { value, onChange } }) => (
              <TermsAgreement
                checkedColor={colors.primary_color}
                uncheckedColor="#d1d5db"
                isChecked={value}
                onCheckedChange={onChange}
              />
            )}
          />
          {errors.termsAccepted && (
            <Text className="text-red-500 text-sm pt-1">
              {errors.termsAccepted.message}
            </Text>
          )}

          <View className="pt-6">
            <GradientButton
              onPress={handleSubmit(onSubmit)}
              loading={registerMutation.isPending}
              title="Create Account"
            />
          </View>

          <View className="mt-8 mb-10">
            <AuthLink
              questionText="Already have an account? "
              linkText="Sign in"
              onPress={() => router.push("/sign_in/signin")}
              className="justify-center"
              questionClassName="text-black text-md"
              linkClassName="text-primary"
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingLayout>
  );
};

export default SignUpScreen;
