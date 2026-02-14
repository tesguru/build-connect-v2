import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import GradientButton from "@/components/Buttons/GradientButton";
import { arrowleft } from "@/constants/icon";
import { z } from "zod";

import { useBuilderProfileStore } from "@/store/BuilderProfileStore";
import ProfessionalDocumentation from "@/components/PagesComponent/Auth/BuilderAuthcomponents/ProfessionalDocumentation";

const professionalDocsSchema = z.object({
  contractorLicense: z
    .object({
      uri: z.string(),
      name: z.string().optional(),
      type: z.string().optional(),
    })
    .nullable()
    .refine((val) => !!val, {
      message: "Contractor license is required",
    }),
  insuranceDocumentation: z
    .object({
      uri: z.string(),
      name: z.string().optional(),
      type: z.string().optional(),
    })
    .nullable()
    .refine((val) => !!val, {
      message: "Insurance documentation is required",
    }),
  additionalInformation: z
    .object({
      uri: z.string(),
      name: z.string().optional(),
      type: z.string().optional(),
    })
    .nullable()
    .optional(),
});

type ProfessionalDocsInput = z.infer<typeof professionalDocsSchema>;

export default function ProfessionalDocsScreen() {
  const router = useRouter();
  const { formData, setFormData } = useBuilderProfileStore();

  const methods = useForm<ProfessionalDocsInput>({
    resolver: zodResolver(professionalDocsSchema),
    mode: "onChange",
    defaultValues: {
      contractorLicense: formData.contractorLicense || null,
      insuranceDocumentation: formData.insuranceDocumentation || null,
      additionalInformation: formData.additionalInformation || null,
    },
  });

  const { handleSubmit, trigger, getValues } = methods;

  const handleBack = () => {
    router.back();
  };

  const onSubmit = async (data: ProfessionalDocsInput) => {
    setFormData(data);
    router.push("/sign_up/builder/portfolio_screen");
  };

  const handleContinue = async () => {
    const fields: (keyof ProfessionalDocsInput)[] = ["contractorLicense", "insuranceDocumentation"];
    const valid = await trigger(fields);

    if (valid) {
      onSubmit(getValues());
    }
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
            <ProfessionalDocumentation />
          </View>

          <View className="pb-4 pt-6">
            <GradientButton title="Continue" onPress={handleContinue} />
          </View>
        </View>
      </FormProvider>
    </KeyboardAvoidingLayout>
  );
}