import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

import GradientButton from "@/components/Buttons/GradientButton";
import { FormDatePicker } from "@/components/Forms/DatePicker";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import { FormTextArea } from "@/components/Forms/TextArea";
import AppLayout from "@/components/Layouts/AppLayout";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import { reportImage } from "@/constants/icon";
import { useBids } from "@/core/hooks/UseBids";
import { uploadFile } from "@/core/utils/fileUpload";
import { handleApiError } from "@/core/utils/handleapierror";

const invitationSchema = z.object({
  deadline: z.date({ message: "Bid submission deadline is required" }),
  notes: z.string().optional(),
  document: z.any().nullable().optional(),
});

type InvitationFormValues = z.infer<typeof invitationSchema>;

export default function SendInvitationToBid() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { contractorId, projectId, contractorName } = useLocalSearchParams<{
    contractorId: string;
    projectId: string;
    contractorName?: string;
  }>();

  const { inviteBidMutation, inviteBidsuccess } = useBids();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      deadline: new Date(),
      notes: "",
      document: null,
    },
  });

  const showError = (message: string) => {
    Toast.show({ type: "error", text1: "Validation Error", text2: message });
  };

  const onSubmit = async (data: InvitationFormValues) => {
    setIsSubmitting(true);
    try {
      let documentIds: string[] = [];
      if (data.document) {
        const uploaded = await uploadFile(
          data.document,
          "work_showcase",
          "Bid Document",
        );
        documentIds = [uploaded.id];
      }

      const deadlineDate = data.deadline.toISOString().split("T")[0];

      inviteBidMutation.mutate(
        {
          projectId,
          contractorId,
          bidSubmissionDeadline: deadlineDate,
          additionalNotes: data.notes ?? "",
          documentIds,
        },
        {
          onSuccess: () => {},
          onSettled: () => {
            setIsSubmitting(false);
          },
          onError: (err: any) => {
            handleApiError(err, "Something went wrong. Please try again.", {
              title: "Invitation Failed",
              fallbackMessage: "Something went wrong. Please try again.",
            });
          },
        },
      );
    } catch (err: any) {
      setIsSubmitting(false);
      handleApiError(err, "Failed to upload file. Please try again.", {
        title: "Upload Failed",
        fallbackMessage: "Failed to upload file. Please try again.",
      });
    }
  };

  const isLoading = isSubmitting || inviteBidMutation.isPending;

  if (inviteBidsuccess) {
    return (
      <SuccessScreen
        title="Invitation Sent"
        message="Invitation Sent Successfully"
        buttonTitle="View more Projects"
        navigateTo="/(tab)/mybids"
      />
    );
  }

  return (
    <AppLayout screenName="Send Invitation to Bid">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-1 flex-1">
          <View className="pt-5 pb-2 px-4">
            <Text className="text-gray-500 text-base font-inter">
              Send Invitation to{" "}
              <Text className="text-gray-900 font-semibold font-inter">
                {contractorName || "ProBuild Ltd"}
              </Text>
            </Text>
          </View>

          <View className="px-4 pt-4">
            <Controller
              control={control}
              name="deadline"
              render={({ field }) => (
                <FormDatePicker
                  label="Bid Submission Deadline"
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.deadline}
                  errorMessage={errors.deadline?.message}
                  minimumDate={new Date()}
                  width="w-full"
                />
              )}
            />
          </View>

          <View className="px-4 pt-4">
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <FormTextArea
                  label="Additional Notes"
                  placeholder="Any specific requirements..."
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  hasError={!!errors.notes}
                  errorMessage={errors.notes?.message}
                  width="w-full"
                />
              )}
            />
          </View>

          <View className="px-4 pt-4">
            <Controller
              control={control}
              name="document"
              render={() => (
                <FileUploadComponent
                  title="Upload bid documents"
                  icon={reportImage}
                  label="Upload Documents"
                  note="PDF, drawings, specs (max. 20MB)"
                  control={control}
                  name="document"
                  error={errors.document?.message as string | undefined}
                  maxSizeMB={20}
                />
              )}
            />
          </View>

          <View className="pt-6 pb-8 px-4">
            <GradientButton
              title="Send Invitation"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              loadingText="Uploading..."
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </AppLayout>
  );
}
