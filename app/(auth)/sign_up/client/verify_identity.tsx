import GradientButton from "@/components/Buttons/GradientButton";
import DropdownField from "@/components/Forms/DropDown";
import FileUploadComponent, { FileUploadResult } from "@/components/Forms/FileUploadComponent";
import FormInput from "@/components/Forms/Formnput";
import { FormTextArea } from "@/components/Forms/TextArea";
import AppLayout from "@/components/Layouts/AppLayout";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import colors from "@/constants/colors";
import { reportImage } from "@/constants/icon";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Expo image picker returns type:"image" — resolve the real MIME from the URI extension */
const getMimeType = (uri: string, fallback?: string): string => {
  const ext = uri.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  // if fallback is already a valid MIME (contains "/"), keep it
  if (fallback && fallback.includes("/")) return fallback;
  return (ext && map[ext]) ?? "image/jpeg";
};

// ─── Component ────────────────────────────────────────────────────────────────

const SubmitTicket = () => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [attachmentErrors, setAttachmentErrors] = React.useState<Record<number, string | null>>({});

  const setAttachmentError = (index: number, error: string | null) => {
    setAttachmentErrors((prev) => ({ ...prev, [index]: error }));
  };

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

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (data: SubmitTicketInput) => {
    try {
      setIsUploading(true);

      // Upload each attachment that has a file selected and collect the IDs
      const attachmentFileIds: string[] = [];

      for (const item of data.attachments) {
        if (!item.file) continue;

        let fileData: FileUploadResult;

        if ("size" in item.file && "name" in item.file) {
          // Already a FileUploadResult — still sanitize the type just in case
          fileData = {
            ...(item.file as FileUploadResult),
            type: getMimeType(item.file.uri, item.file.type),
          };
        } else {
          const response = await fetch(item.file.uri);
          const blob = await response.blob();
          const fileName = item.file.uri.split("/").pop() || "attachment.jpg";

          fileData = {
            uri: item.file.uri,
            name: fileName,
            // expo returns "image" or "video" — resolve to real MIME from extension
            type: getMimeType(item.file.uri, item.file.type),
            width: item.file.width,
            height: item.file.height,
            size: blob.size,
          };
        }

        const uploadResult = await uploadFile(fileData, "portfolio", "portfolio");
        attachmentFileIds.push(uploadResult.fileId);
      }

      setIsUploading(false);

      const apiPayload = {
        subject: data.subject,
        projectName: data.projectName,
        description: data.description,
        priority: data.priority,
        attachmentFileIds,
      };

      console.log("Ticket payload:", apiPayload);
      // submitTicketMutation.mutate(apiPayload);

      setIsSuccess(true);
    } catch (error: any) {
      setIsUploading(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to submit ticket",
      });
    }
  };

  // ─── Success screen ──────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <SuccessScreen
        title="Ticket Submitted Successfully"
        message="Your support ticket has been submitted. Our team will get back to you shortly."
        buttonTitle="Back to Dashboard"
        navigateTo={{
          route: "Dashboard",
          screen: "Home",
          params: {},
        }}
      />
    );
  }

  // ─── Form ────────────────────────────────────────────────────────────────────

  return (
    <AppLayout screenName="Submit Ticket">
      <View
        style={{
          backgroundColor: colors.background_light,
          padding: 16,
          flex: 1,
        }}
      >
        <Text className="font-interbold pt-4">Ticket Details</Text>

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

        {/* Attachments — same pattern as milestones in AddProject */}
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

              {/* Each slot bound to its own field: attachments.${index}.file 
                  — ImageUploadComponent writes the picked file directly into
                    this form field exactly as projectMedia works in AddProject */}
              <FileUploadComponent
                    control={control}
                    name={`attachments.${index}.file`}
                    label="Attachment"
                    title="Upload Attachment"
                    note="PNG, JPG, PDF (max. 5MB)"
                    icon={reportImage}
                    maxSizeMB={5}
                    error={
                      attachmentErrors[index] ||
                      (errors.attachments?.[index]?.file?.message as string | undefined)
                    }
                    onError={(error) => setAttachmentError(index, error || null)}
                  />
            </View>
          ))}
        </View>

        {/* Add attachment — same style as Add milestone in AddProject */}
        <TouchableOpacity
          onPress={() => append({ file: null })}
          className="flex-row gap-2 justify-end"
        >
          <Plus size={20} color="#2563eb" />
          <Text className="text-blue-600 font-inter">Add attachment</Text>
        </TouchableOpacity>

        {/* Submit */}
        <View className="pt-6">
          <GradientButton
            loading={isUploading}
            title="Submit Ticket"
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </AppLayout>
  );
};

export default SubmitTicket;