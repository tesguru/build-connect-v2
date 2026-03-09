import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";

import GradientButton from "@/components/Buttons/GradientButton";
import { FormDatePicker } from "@/components/Forms/DatePicker";
import DropdownField from "@/components/Forms/DropDown";
import { FileUploadResult } from "@/components/Forms/FileUploadComponent";
import FormInput from "@/components/Forms/Formnput";
import ImageUploadComponent from "@/components/Forms/ImageForm";
import { FormTextArea } from "@/components/Forms/TextArea";
import AppLayout from "@/components/Layouts/AppLayout";
import colors from "@/constants/colors";
import { reportImage } from "@/constants/icon";
import { useEscrow } from "@/core/hooks/useEscrow";
import { uploadFile } from "@/core/utils/fileUpload";
import Toast from "react-native-toast-message";

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

const LogPayment = () => {
  const [openDatePicker, setOpenDatePicker] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const { createWalletFunding } = useEscrow();

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

  const onSubmit = async (data: LogPaymentInput) => {
    try {
      setIsUploading(true);

      // STEP 1: Upload proof document first (if provided) and get the file ID
      let proofDocumentId: string | null = null;
      if (data.proofDocument) {
        let fileData: FileUploadResult;

        if ("size" in data.proofDocument && "name" in data.proofDocument) {
          fileData = data.proofDocument as FileUploadResult;
        } else {
          const response = await fetch(data.proofDocument.uri);
          const blob = await response.blob();
          const fileName =
            data.proofDocument.uri.split("/").pop() || "document.jpg";
          const mediaData = data.proofDocument as any;

          fileData = {
            uri: data.proofDocument.uri,
            name: fileName,
            type: mediaData.type || "image/jpeg",
            width: mediaData.width,
            height: mediaData.height,
            size: blob.size,
          };
        }

        const uploadResult = await uploadFile(fileData, "portfolio", "portfolio");
        proofDocumentId = uploadResult.fileId;
      }

      setIsUploading(false);

      // STEP 2: Format date to YYYY-MM-DD
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const amountStr = String(data.amount ?? "").replace(/,/g, "");
      const amountNum = amountStr ? parseFloat(amountStr) : NaN;
     

      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please enter a valid amount",
        });
        return;
      }

   
      const apiPayload = {
        amount: amountNum,
        currency: data.currency,
        paymentDate: formatDate(data.paymentDate),
        proofDocumentId: proofDocumentId ?? undefined,
        note: data.note || "",
      };

      createWalletFunding.mutate(apiPayload);
    } catch (error: any) {
      setIsUploading(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to process payment",
      });
    }
  };

  // if (logPaymentSuccess) {
  //   return (
  //     <SuccessScreen
  //       title="Payment Logged Successfully"
  //       message="Your payment has been recorded successfully"
  //       buttonTitle="Go Back"
  //       navigateTo={{
  //         route: "Dashboard",
  //         screen: "Projects",
  //         params: { refresh: true },
  //       }}
  //     />
  //   );
  // }

  return (
    <AppLayout screenName="Log Payment">
      <View
        style={{
          backgroundColor: colors.background_light,
          padding: 16,
          flex: 1,
        }}
      >
        <Text className="font-interbold pt-4 text-base mb-2">
          Payment Details
        </Text>

     
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
                  formatNumber={true}
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

     
        <View className="pt-4">
          <Controller
            control={control}
            name="note"
            render={({ field }) => (
              <FormTextArea
                label="Note (Optional)"
                placeholder="Add a note about this payment..."
                value={field.value}
                onChangeText={field.onChange}
                hasError={!!errors.note}
                errorMessage={errors.note?.message}
                width="w-full"
              />
            )}
          />
        </View>

     
        <View className="pt-4">
          <Controller
            control={control}
            name="proofDocument"
            render={() => (
              <ImageUploadComponent
                title="Click to upload proof of payment"
                image={reportImage}
                label="Proof Document"
                note="PNG, JPG, PDF (max. 5MB)"
                control={control}
                name="proofDocument"
                error={errors.proofDocument?.message as string | undefined}
              />
            )}
          />
        </View>

      
        <View className="pt-6">
          <GradientButton
            loading={isUploading || createWalletFunding.isPending}
            title="Log Payment"
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </AppLayout>
  );
};

export default LogPayment;