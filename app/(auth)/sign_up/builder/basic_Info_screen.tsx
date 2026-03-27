import GradientButton from "@/components/Buttons/GradientButton";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import BasicInfo from "@/components/PagesComponent/Auth/BuilderAuthcomponents/BasicInfo";
import { arrowleft } from "@/constants/icon";
import { useBuilderProfileStore } from "@/store/BuilderProfileStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";

const basicInfoSchema = z.object({
  businessName: z.string().max(100, "Business name is too long"),
  location: z.string().min(1, "Location is required").max(100, "Location is too long"),
  projectTypes: z.array(z.string()).min(1, "Please select at least one project type"),
  experienceRangeId: z.string().min(1, "Years of experience is required"),
  profilePhoto: z
    .object({
      uri: z.string(),
      name: z.string().optional(),
      type: z.string().optional(),
    })
    .nullable()
    .refine((val) => !!val, { message: "Profile photo is required" }),
});

type BasicInfoInput = z.infer<typeof basicInfoSchema>;

export default function BasicInfoScreen() {
  const router = useRouter();
  const { formData, setFormData } = useBuilderProfileStore();


  const { dontShowSkip } = useLocalSearchParams<{ dontShowSkip?: string }>();
  const hideSkip = dontShowSkip === "true";

  const methods = useForm<BasicInfoInput>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onChange",
    defaultValues: {
      businessName: formData.businessName || "",
      location: formData.location || "",
      experienceRangeId: formData.yearOfExperience || "",
      profilePhoto: formData.profilePhoto || null,
      projectTypes: [],
    },
  });

  const { trigger, getValues } = methods;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/sign_in/signin");
    }
  };

  const onSubmit = async (data: BasicInfoInput) => {
    setFormData(data);
    router.push("/sign_up/builder/professional_docs_screen");
  };

  const handleSkipAndContinueLater = () => {
    router.replace("/(tab)");
  };

  const handleContinue = async () => {
    const fields: (keyof BasicInfoInput)[] = [
      "location",
      "experienceRangeId",
      "profilePhoto",
      "projectTypes",
      "businessName",
    ];
    const valid = await trigger(fields);
    if (valid) onSubmit(getValues());
  };

  return (
    <KeyboardAvoidingLayout androidExtraPadding={40}>
      <FormProvider {...methods}>
        <View className="p-4 flex-1">
       
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={handleBack}>
              <Image
                source={arrowleft}
                style={{ width: 25, height: 25 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <View style={{ width: 25 }} />
          </View>

      
          <View className="pt-10 flex-1">
            <BasicInfo />
          </View>

  
          <View className="pb-4 pt-6">
            <GradientButton title="Continue" onPress={handleContinue} />
          </View>
        </View>

   
        {!hideSkip && (
          <TouchableOpacity
            onPress={handleSkipAndContinueLater}
            className="py-4 items-center"
          >
            <Text className="text-gray-500 font-inter text-base">
              Skip and continue later
            </Text>
          </TouchableOpacity>
        )}
      </FormProvider>
    </KeyboardAvoidingLayout>
  );
}