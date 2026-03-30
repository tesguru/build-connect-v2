import GradientButton from "@/components/Buttons/GradientButton";
import DropdownField from "@/components/Forms/DropDown";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import FormInput from "@/components/Forms/Formnput";
import { FormTextArea } from "@/components/Forms/TextArea";
import AppLayout from "@/components/Layouts/AppLayout";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import colors from "@/constants/colors";
import { reportImage } from "@/constants/icon";
import { useSupport } from "@/core/hooks/useSupport";
import { uploadFile } from "@/core/utils/fileUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react-native";
import React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────────────────────────

const submitTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  projectName: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority",
  }),
  attachments: z.array(z.object({ file: z.any().nullable() })).default([]),
});

type SubmitTicketInput = z.infer<typeof submitTicketSchema>;

// ─── Priority options ─────────────────────────────────────────────────────────

const PRIORITY_OPTIONS = [
  { label: "Low", value: "low", id: "low" },
  { label: "Medium", value: "medium", id: "medium" },
  { label: "High", value: "high", id: "high" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SubmitTicket = () => {
  const [isUploading, setIsUploading] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SubmitTicketInput>({
    resolver: zodResolver(submitTicketSchema),
    defaultValues: {
      subject: "",
      projectName: "",
      description: "",
      priority: "medium",
      attachments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "attachments",
  });

  const { submitTicketMutation, submitTicketSuccess } = useSupport();

  const onSubmit = async (data: SubmitTicketInput) => {
    try {
      setIsUploading(true);

      // ✅ Sequential uploads — FileUploadComponent gives FileUploadResult directly
      const attachmentFileIds: string[] = [];

      for (const item of data.attachments) {
        if (!item.file) continue;

        // No conversion needed — FileUploadComponent already returns FileUploadResult
        const uploadResult = await uploadFile(item.file, "work_showcase", "Support Attachment");
        attachmentFileIds.push(uploadResult.id); // ✅ uploadFile returns UploadedFile directly
      }

      setIsUploading(false);

      const apiPayload = {
        subject: data.subject,
        projectName: data.projectName,
        description: data.description,
        priority: data.priority,
        attachmentFileIds,
      };

      submitTicketMutation.mutate(apiPayload);
    } catch (error: any) {
      setIsUploading(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to submit ticket",
      });
    }
  };

  if (submitTicketSuccess) {
    return (
      <SuccessScreen
        title="Ticket Submitted Successfully"
        message="Your support ticket has been submitted. Our team will get back to you shortly."
        buttonTitle="Back to Dashboard"
        navigateTo={"/(tab)"}
      />
    );
  }

  return (
    <AppLayout screenName="Submit Ticket">
      <View
        style={{
          backgroundColor: colors.background_light,
          padding: 14,
          flex: 1,
        }}
      >
     

        {/* Subject */}
        <View className="pt-3">
          <Controller
            control={control}
            name="subject"
            render={({ field }) => (
              <FormInput
                placeholder="e.g Payment issue on milestone 2"
                label="Subject"
                value={field.value}
                hasError={!!errors.subject}
                onChangeText={field.onChange}
              />
            )}
          />
          {errors.subject && (
            <Text className="font-inter pt-1 text-red-500 text-sm">
              {errors.subject.message}
            </Text>
          )}
        </View>

        {/* Project Name */}
        <View className="pt-3">
          <Controller
            control={control}
            name="projectName"
            render={({ field }) => (
              <FormInput
                placeholder="e.g Modern Bungalow Construction"
                label="Project Name"
                value={field.value}
                hasError={!!errors.projectName}
                onChangeText={field.onChange}
              />
            )}
          />
          {errors.projectName && (
            <Text className="font-inter pt-1 text-red-500 text-sm">
              {errors.projectName.message}
            </Text>
          )}
        </View>

        {/* Priority */}
        <View className="pt-3 pb-2">
          <DropdownField
            name="priority"
            control={control}
            label="Priority"
            placeholder="Select priority"
            data={PRIORITY_OPTIONS}
            error={errors.priority?.message as string}
          />
        </View>

        {/* Description */}
        <View className="pt-3">
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <FormTextArea
                label="Description"
                placeholder="Describe your issue in detail..."
                value={field.value}
                onChangeText={field.onChange}
                hasError={!!errors.description}
                errorMessage={errors.description?.message}
                width="w-full"
              />
            )}
          />
        </View>

        {/* Attachments */}
        <View className="mt-4 mx-2">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-worksanssemibold text-xl">Attachments</Text>
            <Text className="font-inter text-gray-400 text-sm">Optional</Text>
          </View>

          {fields.map((field, index) => (
            <View
              key={field.id}
              className="border border-gray-300 rounded-xl p-4 mb-4"
            >
              {/* Header row with remove button */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-inter text-xl">Attachment {index + 1}</Text>
                <TouchableOpacity onPress={() => remove(index)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

           
              <FileUploadComponent
                control={control}
                name={`attachments.${index}.file`}
                label="Attachment"
                title="Upload Attachment"
                note="PNG, JPG, PDF (max. 5MB)"
                icon={reportImage}
                maxSizeMB={5}
                error={
                  errors.attachments?.[index]?.file?.message as
                    | string
                    | undefined
                }
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => append({ file: null })}
          className="flex-row gap-2 justify-end"
        >
          <Plus size={20} color="#2563eb" />
          <Text className="text-blue-600 font-inter">Add attachment</Text>
        </TouchableOpacity>

        <View className="pt-6">
          <GradientButton
            loading={isUploading || submitTicketMutation.isPending}
            title="Submit Ticket"
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </AppLayout>
  );
};

export default SubmitTicket;