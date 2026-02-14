import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import GradientButton from "@/components/Buttons/GradientButton";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import { reportImage } from "@/constants/icon";
import PageHeader from "@/components/Miscallaneous/PageHeader";
import Toast from "react-native-toast-message";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import { uploadFile } from "@/core/utils/fileUpload";

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
  const [idDocumentError, setIdDocumentError] = useState<string | null>(null);
  const [incomeVerificationError, setIncomeVerificationError] = useState<string | null>(null);

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

  const [isUploading, setIsUploading] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      setIsUploading(true);

      // Upload both files in parallel
      const uploadPromises = [
        uploadFile(data.idDocument, "id_document", "ID Document"),
        uploadFile(
          data.incomeVerification,
          "income_verification",
          "Income Verification"
        ),
      ];

      const results = await Promise.all(uploadPromises);
      const allSuccessful = results.every((result) => result.success);
      if (allSuccessful) {
        Toast.show({
          type: "success",
          text1: "Upload Successful",
          text2: "Your documents have been uploaded successfully",
        });
        router.replace("/sign_up/client/create_project");
      } else {
        throw new Error("One or more files failed to upload");
      }
    } catch (error: any) {
      console.error("Upload error:", error);

      // Extract error message
      let errorMessage = "Failed to upload documents. Please try again.";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.data?.message) {
        errorMessage = error.response.data.data.message;
      }

      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: errorMessage,
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

  const handleSkipAndContinueLater = () => {
    router.replace("/sign_up/client/create_project");
  };

  return (
    <KeyboardAvoidingLayout>
      <View className="px-4 flex-1">
        <PageHeader title="Verify Your Identity" onBackPress={handleBack} />

        <View className="space-y-6">
          {/* ID Documents */}
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

          {/* Income Verification */}
          <FileUploadComponent
            control={control}
            name="incomeVerification"
            label="Income Verification*"
            title="Upload Income Verification"
            note="PNG, JPG, PDF (max. 5MB)"
            icon={reportImage}
            maxSizeMB={5}
            error={
              incomeVerificationError ||
              (errors.incomeVerification?.message as string)
            }
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
          <TouchableOpacity
            onPress={handleSkipAndContinueLater}
            className="py-4 items-center"
            disabled={isUploading}
          >
            <Text className="text-gray-500 font-inter text-base">
              Skip and continue later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingLayout>
  );
}