import GradientButton from "@/components/Buttons/GradientButton";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import AppLayout from "@/components/Layouts/AppLayout";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import { reportImage } from "@/constants/icon";
import { useProperty } from "@/core/hooks/useProperty";
import { uploadFile } from "@/core/utils/fileUpload";
import { handleApiError } from "@/core/utils/handleapierror";
import { useMortgageStore } from "@/store/MortgageStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────
const documentsSchema = z.object({
  idDocumentFile: z
    .any()
    .nullable()
    .refine((val) => !!val, { message: "ID document is required" }),
  proofOfIncomeFile: z
    .any()
    .nullable()
    .refine((val) => !!val, { message: "Proof of income is required" }),
  bankStatementFile: z
    .any()
    .nullable()
    .refine((val) => !!val, { message: "Bank statement is required" }),
});

type DocumentsInput = z.infer<typeof documentsSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function DocumentsScreen() {
  const router = useRouter();
  const { formData, clearFormData } = useMortgageStore();
  const [isUploading, setIsUploading] = useState(false);
  const { createMortgageMutation, mortgageSuccess } = useProperty();

  // ── Form ───────────────────────────────────────────────────────────────────
  const methods = useForm<DocumentsInput>({
    resolver: zodResolver(documentsSchema),
    mode: "onChange",
    defaultValues: {
      idDocumentFile: formData.idDocumentFile || null,
      proofOfIncomeFile: formData.proofOfIncomeFile || null,
      bankStatementFile: formData.bankStatementFile || null,
    },
  });

  const {
    control,
    trigger,
    handleSubmit,
    formState: { errors },
  } = methods;

  const handleBack = useCallback(() => {
    if (!isUploading) router.back();
  }, [isUploading, router]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = useCallback(async (data: DocumentsInput) => {
    try {
      setIsUploading(true);

      // ✅ Upload all three files in parallel
      const [idResult, incomeResult, bankResult] = await Promise.allSettled([
        uploadFile(data.idDocumentFile, "id_document", "ID Document"),
        uploadFile(data.proofOfIncomeFile, "proof_of_income", "Proof of Income"),
        uploadFile(data.bankStatementFile, "bank_statement", "Bank Statement"),
      ]);

      // ✅ Check for any failures
      const failures: string[] = [];
      if (idResult.status === "rejected") failures.push("ID Document");
      if (incomeResult.status === "rejected") failures.push("Proof of Income");
      if (bankResult.status === "rejected") failures.push("Bank Statement");

      if (failures.length > 0) {
        Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2: `Failed to upload: ${failures.join(", ")}. Please retry.`,
        });
        setIsUploading(false);
        return;
      }

      // ✅ Safe to extract — all succeeded at this point
      const idDocumentFileId = (idResult as PromiseFulfilledResult<any>).value.id;
      const proofOfIncomeFileId = (incomeResult as PromiseFulfilledResult<any>).value.id;
      const bankStatementFileId = (bankResult as PromiseFulfilledResult<any>).value.id;

      // ── Build payload ──────────────────────────────────────────────────────
      const apiPayload = {
        propertyId: formData.propertyId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
          : undefined,
        emailAddress: formData.emailAddress,
        phoneNumber: formData.phoneNumber,
        currentAddress: formData.currentAddress,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        employmentStatusId: formData.employmentStatusId,
        occupation: formData.occupation,
        employerName: formData.employerName,
        annualGrossIncome: formData.annualGrossIncome,
        savingsAccountBalance: formData.savingsAccountBalance,
        checkingAccountBalance: formData.checkingAccountBalance,
        investments: formData.investments,
        creditCardDebits: formData.creditCardDebits,
        otherLoans: formData.otherLoans,
        idDocumentFileId,
        proofOfIncomeFileId,
        bankStatementFileId,
      };

      createMortgageMutation.mutate(apiPayload, {
        onSettled: () => setIsUploading(false),
        onError: (error: any) => {
          handleApiError(error, "Something went wrong.", {
            title: "Submission Failed",
            fallbackMessage: "Something went wrong.",
          });
        },
      });
    } catch (error: any) {
      setIsUploading(false);
      handleApiError(error, "Failed to upload documents. Please try again.", {
        title: "Upload Failed",
        fallbackMessage: "Failed to upload documents. Please try again.",
      });
    }
  }, [formData, createMortgageMutation]);

  const handleComplete = useCallback(async () => {
    const valid = await trigger();
    if (valid) {
      handleSubmit(onSubmit)();
    }
  }, [trigger, handleSubmit, onSubmit]);

  const isLoading = isUploading || createMortgageMutation.isPending;


 useEffect(() => {
  if (mortgageSuccess) {
    clearFormData();
  }
}, [mortgageSuccess]);


if (mortgageSuccess) {
  return (
    <SuccessScreen
      title="Application Submitted!"
      message="Your mortgage application has been submitted successfully. We'll be in touch shortly."
      navigateTo="/(tab)"
    />
  );
}

  
  return (
    <AppLayout screenName="Document Info">
      <FormProvider {...methods}>
        <View className="p-4 flex-1">
        

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Text className="font-interbold text-2xl text-gray-900">
              Supporting Documents
            </Text>
            <Text className="font-inter text-gray-500 text-sm mt-1 mb-6">
              Upload the required documents to complete your application
            </Text>

            {/* ── ID Document ─────────────────────────────────────────────── */}
            <View className="mb-5 border border-gray-200 rounded-2xl p-4">
              <Text className="font-interbold text-base text-gray-900 mb-1">
                Government-Issued ID
              </Text>
              <Text className="font-inter text-xs text-gray-400 mb-3">
                National ID, International Passport, or Driver's License
              </Text>
              {/* ✅ FIXED: Use FileUploadComponent directly like Portfolio */}
              <FileUploadComponent
                control={control}
                name="idDocumentFile"
                title="Click to upload ID document"
                icon={reportImage}
                label="ID Document"
                note="PNG, JPG, PDF (max. 5MB)"
                maxSizeMB={5}
                error={errors.idDocumentFile?.message as string | undefined}
              />
            </View>

            {/* ── Proof of Income ──────────────────────────────────────────── */}
            <View className="mb-5 border border-gray-200 rounded-2xl p-4">
              <Text className="font-interbold text-base text-gray-900 mb-1">
                Proof of Income
              </Text>
              <Text className="font-inter text-xs text-gray-400 mb-3">
                Payslip, offer letter, or tax return document
              </Text>
              {/* ✅ FIXED: Use FileUploadComponent directly like Portfolio */}
              <FileUploadComponent
                control={control}
                name="proofOfIncomeFile"
                title="Click to upload proof of income"
                icon={reportImage}
                label="Proof of Income"
                note="PNG, JPG, PDF (max. 5MB)"
                maxSizeMB={5}
                error={errors.proofOfIncomeFile?.message as string | undefined}
              />
            </View>

            {/* ── Bank Statement ───────────────────────────────────────────── */}
            <View className="mb-5 border border-gray-200 rounded-2xl p-4">
              <Text className="font-interbold text-base text-gray-900 mb-1">
                Bank Statement
              </Text>
              <Text className="font-inter text-xs text-gray-400 mb-3">
                Last 6 months bank statement
              </Text>
              {/* ✅ FIXED: Use FileUploadComponent directly like Portfolio */}
              <FileUploadComponent
                control={control}
                name="bankStatementFile"
                title="Click to upload bank statement"
                icon={reportImage}
                label="Bank Statement"
                note="PNG, JPG, PDF (max. 5MB)"
                maxSizeMB={5}
                error={errors.bankStatementFile?.message as string | undefined}
              />
            </View>
          </ScrollView>

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <View className="pb-4 pt-6">
            <GradientButton
              title="Submit Application"
              onPress={handleComplete}
              loading={isLoading}
              loadingText="Uploading..."
              disabled={isLoading}
            />
          </View>
        </View>
      </FormProvider>
    </AppLayout>
  );
}