import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { arrowleft } from "@/constants/icon";
import FormInput from "@/components/Forms/Formnput";
import GradientButton from "@/components/Buttons/GradientButton";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import { ForgotPasswordInput, forgotPasswordSchema } from "@/core/schemas/authschema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/core/hooks/useAuth";

const ForgotPasswordScreen = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/sign_in/signin");
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { forgotPasswordMutation } = useAuth();

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        router.replace({
          pathname: "/password_reset/otp_form",
          params: { email: data.email }
        });
      },
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
          <Text className="font-interbold text-center text-3xl py-8 mx-4">
            Password Recovery
          </Text>
          <Text className="font-inter text-center text-xl py-4">
            Enter the email address or phone number associated with your BuildConnect account. 
          </Text>
        </View>

        <View className="mx-4 space-y-4 pt-5">
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
                  onChangeText={field.onChange}
                />
              )}
            />

            {errors.email && (
              <Text className="font-inter text-xs pt-2 text-red-500">
                {errors.email.message}
              </Text>
            )}
          </View>

          <View className="pt-20">
            <GradientButton 
              loading={forgotPasswordMutation.isPending}
              title="Continue"
              onPress={handleSubmit(onSubmit)} 
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingLayout>
  );
};

export default ForgotPasswordScreen;