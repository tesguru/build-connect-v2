import GradientButton from "@/components/Buttons/GradientButton";
import { FormDatePicker } from "@/components/Forms/DatePicker";
import DropdownField from "@/components/Forms/DropDown";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import FormInput from "@/components/Forms/Formnput";
import { FormTextArea } from "@/components/Forms/TextArea";
import AppLayout from "@/components/Layouts/AppLayout";
import colors from "@/constants/colors";
import { reportImage } from "@/constants/icon";
import { useEscrow } from "@/core/hooks/useEscrow";
import { uploadFile } from "@/core/utils/fileUpload";
import { handleApiError } from "@/core/utils/handleapierror";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────
const logPaymentSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().min(1, "Currency is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  proofDocument: z.any().nullable().optional(),
  note: z.string().optional(),
});

type LogPaymentInput = z.infer<typeof logPaymentSchema>;

const currencyData = [
  { label: "Nigerian Naira (NGN)", value: "NGN", id: "NGN" },
  { label: "US Dollar (USD)", value: "USD", id: "USD" },
  { label: "British Pound (GBP)", value: "GBP", id: "GBP" },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const LogPayment = () => {
  const [openDatePicker, setOpenDatePicker] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const { createWalletFunding } = useEscrow();

  // ── Form ───────────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LogPaymentInput>({
    resolver: zodResolver(logPaymentSchema),
    defaultValues: {
      amount: "",
      currency: "NGN",
      paymentDate: "",
      proofDocument: null,
      note: "",
    },
  });

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data: LogPaymentInput) => {
    try {
      setIsUploading(true);

      // ✅ Validate amount first before uploading anything
      const amountNum = parseFloat(String(data.amount ?? "").replace(/,/g, ""));
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please enter a valid amount",
        });
        setIsUploading(false);
        return;
      }

      // ✅ Upload proof document if provided (optional)
      let proofDocumentId: string | undefined;
      if (data.proofDocument) {
        const uploadResult = await uploadFile(
          data.proofDocument,
          "portfolio",
          "Proof of Payment",
        );
        proofDocumentId = uploadResult.id;
      }

      // ── Build payload ──────────────────────────────────────────────────────
      const apiPayload = {
        amount: amountNum,
        currency: data.currency,
        paymentDate: formatDate(data.paymentDate),
        ...(proofDocumentId && { proofDocumentId }),
        note: data.note || "",
      };

      createWalletFunding.mutate(apiPayload, {
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
      handleApiError(error, "Failed to process payment. Please try again.", {
        title: "Upload Failed",
        fallbackMessage: "Failed to process payment. Please try again.",
      });
    }
  };

  const isLoading = isUploading || createWalletFunding.isPending;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout screenName="Log Payment">
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background_light }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <Text className="font-interbold pt-4 text-base mb-2">
          Payment Details
        </Text>

        {/* Amount */}
        <View className="pt-3 pb-2">
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Amount"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="0.00"
                keyboardType="numeric"
                formatNumber
                hasError={!!errors.amount}
              />
            )}
          />
          {errors.amount && (
            <Text className="font-inter pt-1 text-red-500 text-sm">
              {errors.amount.message}
            </Text>
          )}
        </View>

        {/* Currency */}
        <View className="pb-2">
          <DropdownField
            name="currency"
            control={control}
            label="Currency"
            placeholder="Select currency"
            data={currencyData}
            error={errors.currency?.message as string}
          />
        </View>

        {/* Payment Date */}
        <View className="pt-3 pb-2">
          <Controller
            control={control}
            name="paymentDate"
            render={({ field }) => (
              <FormDatePicker
                label="Payment Date"
                value={field.value ? new Date(field.value) : new Date()}
                onChange={(date) => field.onChange(date.toISOString())}
                hasError={!!errors.paymentDate}
                errorMessage={errors.paymentDate?.message}
                isOpen={openDatePicker}
                onOpen={() => setOpenDatePicker(true)}
                onClose={() => setOpenDatePicker(false)}
              />
            )}
          />
        </View>

        {/* Note */}
        <View className="pt-4">
          <Controller
            control={control}
            name="note"
            render={({ field }) => (
              <FormTextArea
                label="Note (Optional)"
                placeholder="Add a note about this payment..."
                value={field.value ?? ""}
                onChangeText={field.onChange}
                hasError={!!errors.note}
                errorMessage={errors.note?.message}
                width="w-full"
              />
            )}
          />
        </View>

        {/* Proof Document */}
        <View className="pt-4">
          {/* ✅ field wired — file saves to form state */}
          <Controller
            control={control}
            name="proofDocument"
            render={() => (
              <FileUploadComponent
                title="Click to upload proof of payment"
                icon={reportImage}
                label="Proof Document (Optional)"
                note="PNG, JPG, PDF (max. 5MB)"
                control={control}
                name="proofDocument"
                error={errors.proofDocument?.message as string | undefined}
                maxSizeMB={5}
              />
            )}
          />
        </View>

        {/* Submit */}
        <View className="pt-6">
          <GradientButton
            title="Log Payment"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            loadingText="Uploading..."
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default LogPayment;
