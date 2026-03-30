import GradientButton from "@/components/Buttons/GradientButton";
import OTPInput from "@/components/Forms/OtpInput";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import AuthLink from "@/components/Miscallaneous/AuthLink";
import { arrowleft } from "@/constants/icon";
import { useAuth } from "@/core/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

export default function VerifyEmailScreen() {

  const { email, role, fromLogin } = useLocalSearchParams<{
    email?: string;
    role?: string;
    fromLogin?: string;
  }>();
  
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
    verifyOTPMutation.mutate({ 
      email: email || "", 
      otp: data.otp, 
      role: role || "builder", 
      fromLogin: fromLogin === "true" 
    });
  };

  const resendOtp = () => {
    resendOtpMutation.mutate({ email: email || "" });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/sign_up/sign_up");
    }
  };

  return (
    <KeyboardAvoidingLayout>
      <View className="mx-3">
        <TouchableOpacity className="pt-10 pl-2" onPress={handleBack}>
          <Image
            source={arrowleft}
            resizeMode="contain"
            style={{ width: 25, height: 25 }}
          />
        </TouchableOpacity>
        
        <View>
          <Text className="font-interbold text-center text-2xl py-8">
            Verify Your Email
          </Text>
          <Text className="font-inter text-center text-md py-4">
            A 6-digit code was sent to your registered email address.
          </Text>
        </View>

        <View className="pt-10">
          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange, value } }) => (
              <OTPInput length={6} value={value} onChange={onChange} />
            )}
          />

          {errors.otp && (
            <Text className="text-red-500 text-center mt-3">
              {errors.otp.message}
            </Text>
          )}
        </View>

        <View className="pt-20">
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