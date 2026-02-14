import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useLocalSearchParams } from "expo-router";
import OTPInput from "@/components/Forms/OtpInput";
import { arrowleft } from "@/constants/icon";
import { useAuth } from "@/core/hooks/useAuth";
import GradientButton from "@/components/Buttons/GradientButton";
import AuthLink from "@/components/Miscallaneous/AuthLink";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

export default function OTPFormScreen() {

  const { email } = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const { verifyOTPMutation, resendOtpMutation } = useAuth();

  const onSubmit = (data: any) => {
    verifyOTPMutation.mutate(
      { email: email || "", otp: data.otp },
      {
        onSuccess: () => {
          // Navigate to ResetPassword with email and otp
          router.replace({
            pathname: "/password_reset/forgot_password",
            params: { email: email || "", otp: data.otp }
          });
        },
      }
    );
  };
  
  const handleBack = () => {
    router.replace("/forgot-password");
  };

  const resendOtp = () => {
    if (email) {
      resendOtpMutation.mutate({ email });
    }
  };

  return (
    <KeyboardAvoidingLayout>
      <View className="mx-3">
        <TouchableOpacity className="pt-10 pl-4" onPress={handleBack}>
          <Image
            source={arrowleft}
            resizeMode="contain"
            style={{ width: 25, height: 25 }}
          />
        </TouchableOpacity>
        
        <View>
          <Text className="font-interbold text-center text-3xl py-8">
            Enter OTP Code
          </Text>
          <Text className="font-inter text-center text-xl py-4">
            We've sent a 6-digit code to your phone number/email address.
          </Text>
        </View>

        <View className="pt-4">
          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange, value } }) => (
              <OTPInput 
                length={6} 
                value={value} 
                onChange={(text: string) => onChange(text)} 
              />
            )}
          />

          {errors.otp && (
            <Text className="text-red-500 text-center mt-3">
              {errors.otp.message}
            </Text>
          )}
        </View>

        <View className="pt-8">
          <GradientButton
            loading={verifyOTPMutation.isPending}
            title="Continue"
            onPress={handleSubmit(onSubmit)}
          />
        </View>

        <View className="pt-3">
          <AuthLink
            questionText="Didn't get OTP? "
            linkText="Resend OTP"
            onPress={resendOtp}
            className="justify-center"
            questionClassName="text-black text-md"
            linkClassName="text-primary font-interbold"
          />
        </View>
      </View>
    </KeyboardAvoidingLayout>
  );
}