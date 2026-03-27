import GradientButton from "@/components/Buttons/GradientButton";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import PageHeader from "@/components/Miscallaneous/PageHeader";
import { reportImage } from "@/constants/icon";
import { uploadFile } from "@/core/utils/fileUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

const verifyIdentitySchema = z.object({
  idDocument: z.any().refine((val) => val !== null, {
    message: "ID document is required",
  }),
  incomeVerification: z.any().refine((val) => val !== null, {
    message: "Income verification is required",
  }),
});

export default function VerifyIdentityScreen() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [idDocumentError, setIdDocumentError] = useState<string | null>(null);
  const [incomeVerificationError, setIncomeVerificationError] = useState<string | null>(null);
  const { dontShowSkip } = useLocalSearchParams<{ dontShowSkip?: string }>();
  const hideSkip = dontShowSkip === "true";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyIdentitySchema),
    defaultValues: {
      idDocument: null,
      incomeVerification: null,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsUploading(true);


      await uploadFile(data.idDocument, "id_document", "ID Document");
      await uploadFile(data.incomeVerification, "income_verification", "Income Verification");

      Toast.show({
        type: "success",
        text1: "Upload Successful",
        text2: "Your documents have been uploaded successfully",
      });

      if (hideSkip) {
        router.replace("/(tab)");
        return;
      }
      router.replace("/sign_up/client/create_project");

    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: error?.message ?? "Failed to upload documents. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/sign_up/verify_email");
    }
  };

  return (
    <KeyboardAvoidingLayout>
      <View className="px-4 flex-1">
        <PageHeader title="Verify Your Identity" onBackPress={handleBack} />

        <View className="space-y-6">
          <FileUploadComponent
            control={control}
            name="idDocument"
            label="ID Documents"
            title="Upload ID Document"
            note="PNG, JPG, PDF (max. 5MB)"
            icon={reportImage}
            maxSizeMB={5}
            error={idDocumentError || (errors.idDocument?.message as string)}
            onError={(error) => setIdDocumentError(error || null)}
          />

          <FileUploadComponent
            control={control}
            name="incomeVerification"
            label="Income Verification*"
            title="Upload Income Verification"
            note="PNG, JPG, PDF (max. 5MB)"
            icon={reportImage}
            maxSizeMB={5}
            error={incomeVerificationError || (errors.incomeVerification?.message as string)}
            onError={(error) => setIncomeVerificationError(error || null)}
            containerClassName="pt-10"
          />
        </View>

        <View className="pt-20 pb-4">
          <GradientButton
            title="Continue"
            loading={isUploading}
            onPress={handleSubmit(onSubmit)}
          />

          {!hideSkip && (
            <TouchableOpacity
              onPress={() => router.replace("/sign_up/client/create_project")}
              className="py-4 items-center"
              disabled={isUploading}
            >
              <Text className="text-gray-500 font-inter text-base">
                Skip and continue later
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingLayout>
  );
}