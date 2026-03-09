import GradientButton from "@/components/Buttons/GradientButton";
import PasswordInput from "@/components/Forms/PasswordInput";
import AuthHeader from "@/components/Miscallaneous/PageHeader";
import { useAuth } from "@/core/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword:    z.string().min(1, "Current password is required"),
  newPassword:        z.string().min(8, "Password must be at least 8 characters"),
  confirmNewPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

const ChangePasswordScreen = () => {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword:    "",
      newPassword:        "",
      confirmNewPassword: "",
    },
  });

  const { changePasswordMutation } = useAuth();

  const onSubmit = (data: ChangePasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/profile");
  };

  const handleCancel = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/profile");
  };

  return (
    <View className="flex-1 bg-white">
      <AuthHeader title="Change Password" onBackPress={handleBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-4 pt-6">

          {/* Current Password */}
          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { onChange, value } }) => (
              <PasswordInput
                label="Current Password"
                value={value}
                onChangeText={onChange}
                placeholder="Enter your current password"
                hasError={!!errors.currentPassword}
              />
            )}
          />
          {errors.currentPassword && (
            <Text className="text-red-500 text-sm mt-1 font-inter">
              {errors.currentPassword.message}
            </Text>
          )}

          {/* New Password */}
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, value } }) => (
              <PasswordInput
                label="New Password"
                value={value}
                onChangeText={onChange}
                placeholder="Enter your new password"
                hasError={!!errors.newPassword}
              />
            )}
          />
          {errors.newPassword && (
            <Text className="text-red-500 text-sm mt-1 font-inter">
              {errors.newPassword.message}
            </Text>
          )}

          {/* ✅ Fixed: name was "confirmPassword", must be "confirmNewPassword" */}
          <Controller
            control={control}
            name="confirmNewPassword"
            render={({ field: { onChange, value } }) => (
              <PasswordInput
                label="Confirm New Password"
                value={value}
                onChangeText={onChange}
                placeholder="Confirm your new password"
                hasError={!!errors.confirmNewPassword}
              />
            )}
          />
          {/* ✅ Fixed: was errors.confirmPassword (undefined), now errors.confirmNewPassword */}
          {errors.confirmNewPassword && (
            <Text className="text-red-500 text-sm mt-1 font-inter">
              {errors.confirmNewPassword.message}
            </Text>
          )}

          <View className="mt-8 gap-4">
            {/* ✅ Fixed: added loading prop */}
            <GradientButton
              loading={changePasswordMutation.isPending}
              title="Update Password"
              onPress={handleSubmit(onSubmit)}
            />
            <TouchableOpacity
              onPress={handleCancel}
              className="bg-white border-2 border-gray-300 rounded-full py-4 items-center"
            >
              <Text className="text-gray-700 font-interbold text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ChangePasswordScreen;