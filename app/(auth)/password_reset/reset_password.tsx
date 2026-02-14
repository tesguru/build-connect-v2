import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { arrowleft } from "@/constants/icon";
import GradientButton from "@/components/Buttons/GradientButton";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import { ResetPasswordInput, resetPasswordSchema } from "@/core/schemas/authschema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/core/hooks/useAuth";
import PasswordInput from "@/components/Forms/PasswordInput";

const ResetPasswordScreen = () => {
  const router = useRouter();
  const { email, otp } = useLocalSearchParams<{ 
    email?: string; 
    otp?: string; 
  }>();

  const handleBack = () => {
    router.replace("/sign_in/signin");
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    },
  });
 
  const { ResetPasswordMutation } = useAuth();

  const onSubmit = (data: ResetPasswordInput) => {
    ResetPasswordMutation.mutate({
      email: email || "",
      otp: otp || "",
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmPassword,
    });
  };

  return (
    <KeyboardAvoidingLayout>
      <View>
        <TouchableOpacity className="pt-10 pl-4" onPress={handleBack}>
          <Image
            source={arrowleft}
            resizeMode="contain"
            style={{ width: 25, height: 25 }}
          />
        </TouchableOpacity>

        <View>
          <Text className="font-interbold text-center text-3xl py-8">
            Password Reset
          </Text>
          <Text className="font-inter text-center text-xl py-4">
            Enter your new password to reset your account
          </Text>
        </View>

        <View className="mx-4 space-y-4 pt-10">
          <View className="pb-2">
            <Controller
              control={control}
              name="newPassword"
              render={({ field }) => (
                <PasswordInput
                  placeholder="New Password"
                  label="New Password"
                  value={field.value}
                  onChangeText={field.onChange}
                  hasError={!!errors.newPassword}
                />
              )}
            />
            {errors.newPassword && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.newPassword.message}
              </Text>
            )}
          </View>

          <View className="pb-2">
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <PasswordInput
                  placeholder="Confirm Password"
                  label="Confirm Password"
                  value={field.value}
                  onChangeText={field.onChange}
                  hasError={!!errors.confirmPassword}
                />
              )}
            />
            {errors.confirmPassword && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>

          <View className="pt-8">
            <GradientButton 
              loading={ResetPasswordMutation.isPending} 
              title="Continue" 
              onPress={handleSubmit(onSubmit)} 
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingLayout>
  );
};

export default ResetPasswordScreen;