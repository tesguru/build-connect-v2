import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import {
  AppleImage,
  BuildConnectImage,
  GoggleImage,
} from "@/constants/image";
import { arrowleft } from "@/constants/icon";
import FormInput from "@/components/Forms/Formnput";
import PasswordInput from "@/components/Forms/PasswordInput";
import GradientButton from "@/components/Buttons/GradientButton";
import DividerWithText from "@/components/Miscallaneous/Divider";
import ButtonWithIcon from "@/components/Buttons/ButtonWithIcon";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import AuthLink from "@/components/Miscallaneous/AuthLink";
import { LoginInput, loginSchema } from "@/core/schemas/authschema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/core/hooks/useAuth";
import { useRouter } from "expo-router";




const SignInScreen = () => {
   const router = useRouter();
  const handleBack = () => {
    router.push("/get_started");
  };

  const forgotPassword = () => {
    router.push("/");
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { loginMutation } = useAuth();

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <KeyboardAvoidingLayout>
      <View>
        <TouchableOpacity className="pt-5 pl-4" onPress={() => handleBack()}>
          <Image
            source={arrowleft}
            resizeMode="contain"
            style={{ width: 25, height: 25 }}
          />
        </TouchableOpacity>
        <View className="flex-row justify-center">
          <Image
            className="w-[280px]"
            source={BuildConnectImage}
            resizeMode="contain"
          />
        </View>
        <View className="mx-4 space-y-2">
          <View>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <FormInput
                  placeholder="user@gmail.com"
                  label="Email Address"
                  value={field.value}
                  hasError={!!errors.email}
                  onChangeText={(text) => field.onChange(text.toLowerCase())}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              )}
            />

            {errors.email && (
              <Text className="font-inter text-xs  pt-2" style={{ color: "red" }}>
                {errors.email.message}
              </Text>
            )}
          </View>

          <View>
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
            <View className="flex-row justify-between items-start">
              {errors.password && (
                <Text className="text-red-500 font-inter pt-2 text-xs flex-1">{errors.password.message}</Text>
              )}

              <TouchableOpacity onPress={forgotPassword} className="pt-2">
                <Text className="text-primary font-inter text-sm">Forgot password?</Text>
              </TouchableOpacity>
            </View>

          </View>
          <View className="pt-8">
            <GradientButton loading={loginMutation.isPending} title="Continue" onPress={handleSubmit(onSubmit)} />
          </View>

          <View>
            <DividerWithText text="or" />
          </View>
          <View className="">
            <View className="pb-6">
              <ButtonWithIcon
                icon={AppleImage}
                onPress={() => { }}
                textColor="black"
                title="Continue With Apple"
              />
            </View>
            <View>
              <ButtonWithIcon
                onPress={() => { }}
                icon={GoggleImage}
                textColor="black"
                title="Continue With Google"
              />
            </View>
            <View className="mt-12">
              <AuthLink
                questionText="Dont have an account? "
                linkText="Signup"
                onPress={() => router.push("/sign_up/sign_up")}
                className="justify-center "
                questionClassName="text-black text-md"
                linkClassName="text-primary "
              />
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingLayout>
  );
};

export default SignInScreen;
