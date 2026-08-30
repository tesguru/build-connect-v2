import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as z from "zod";

import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import AppLayout from "@/components/Layouts/AppLayout";
import { reportImage } from "@/constants/icon";
import { useProjects } from "@/core/hooks/useProjects";
import { uploadFile } from "@/core/utils/fileUpload";

// Types
interface Message {
  id: string;
  message: string;
  sender: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  attachments?: Attachment[];
  createdAt: string;
}

interface Attachment {
  id: string;
  file: File;
  fileName: string;
  url: string;
}

interface ChatFormValues {
  attachments: { file: File | null }[];
}

// Zod schema for form validation
const chatSchema = z.object({
  attachments: z.array(z.object({ file: z.any().nullable() })).default([]),
});

// Helper functions
const formatSentAt = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;

  if (isToday) {
    return `Today, ${hour12}:${minutes}${ampm}`;
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${hour12}:${minutes}${ampm}`;
};

const getInitials = (name: string): string => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getSenderName = (sender: {
  firstName?: string;
  lastName?: string;
}): string => {
  if (!sender) return "Unknown";
  const firstName = sender.firstName || "";
  const lastName = sender.lastName || "";
  return `${firstName} ${lastName}`.trim();
};

// Avatar Component
const Avatar = ({ name, isMine }: { name: string; isMine: boolean }) => {
  const bgColor = isMine ? "#2563eb" : "#eff6ff";
  const borderColor = isMine ? "#1e40af" : "#bfdbfe";
  const textColor = isMine ? "#fff" : "#2563eb";

  const initials = getInitials(name);

  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: bgColor,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: borderColor,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter_600SemiBold",
          color: textColor,
        }}
      >
        {initials}
      </Text>
    </View>
  );
};

// MessageBubble Component
const MessageBubble = ({
  item,
  currentUserId,
}: {
  item: Message;
  currentUserId?: string;
}) => {
  const isMine = currentUserId ? item.sender?.id === currentUserId : false;
  const senderName = getSenderName(item.sender);
  const attachments = item.attachments || [];
  const justifyContent = isMine ? "flex-end" : "flex-start";

  const bubbleBg = isMine ? "#2563eb" : "#ffffff";
  const topLeftRadius = isMine ? 18 : 8;
  const topRightRadius = isMine ? 8 : 18;

  const senderColor = isMine ? "#fff" : "#1e293b";
  const timeColor = isMine ? "#bfdbfe" : "#cbd5e1";

  return (
    <View
      style={{
        flexDirection: "row",
        marginBottom: 16,
        alignItems: "flex-end",
        justifyContent,
      }}
    >
      {!isMine && (
        <View style={{ marginRight: 10, marginBottom: 2 }}>
          <Avatar name={senderName} isMine={false} />
        </View>
      )}

      <View style={{ maxWidth: "72%", alignItems: justifyContent }}>
        {!isMine && (
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Inter_500Medium",
              color: "#94a3b8",
              marginBottom: 3,
            }}
          >
            {senderName}
          </Text>
        )}

        <View
          style={{
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingTop: 10,
            paddingBottom: 8,
            backgroundColor: bubbleBg,
            borderTopRightRadius: topRightRadius,
            borderTopLeftRadius: topLeftRadius,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
            elevation: 1,
          }}
        >
          {item.message && (
            <Text
              style={{
                fontSize: 15,
                lineHeight: 22,
                fontFamily: "Inter_400Regular",
                color: senderColor,
              }}
            >
              {item.message}
            </Text>
          )}

          {attachments.length > 0 && (
            <View style={{ marginTop: item.message ? 8 : 0, gap: 6 }}>
              {attachments.map((attachment) => (
                <TouchableOpacity
                  key={attachment.id}
                  onPress={() => Linking.openURL(attachment.url)}
                  activeOpacity={0.75}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: isMine
                      ? "rgba(255,255,255,0.15)"
                      : "#f1f5f9",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Ionicons
                    name="document-attach-outline"
                    size={14}
                    color={isMine ? "#bfdbfe" : "#64748b"}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: isMine ? "#e0f2fe" : "#475569",
                      flexShrink: 1,
                    }}
                    numberOfLines={1}
                  >
                    {attachment.fileName}
                  </Text>
                  <Ionicons
                    name="download-outline"
                    size={13}
                    color={isMine ? "#bfdbfe" : "#64748b"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text
            style={{
              fontSize: 10,
              fontFamily: "Inter_400Regular",
              marginTop: 5,
              textAlign: "right",
              color: timeColor,
            }}
          >
            {formatSentAt(item.createdAt)}
          </Text>
        </View>

        {isMine && (
          <View style={{ marginLeft: 10, marginBottom: 2 }}>
            <Avatar name={senderName} isMine={true} />
          </View>
        )}
      </View>
    </View>
  );
};

// Main ChatScreen Component
const ChatScreen = () => {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Use projects hook
  const { createMessage, viewMessages } = useProjects();
  const {
    data: messagesData,
    isLoading,
    error,
    refetch,
  } = viewMessages(projectId);

  const messages = messagesData?.data?.messages || [];

  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema),
    defaultValues: { attachments: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "attachments",
  });

  const attachments = watch("attachments");

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!message.trim() && !attachments.some((a) => a.file)) return;

    setIsSending(true);

    try {
      // Upload files using uploadFile from core/utils
      const filesWithAttachments = attachments.filter((a) => a.file);

      const uploadResults = await Promise.allSettled(
        filesWithAttachments.map(async (attachment) => {
          const result = await uploadFile(
            attachment.file,
            "work_showcase",
            "Chat Attachment",
          );
          return result.id;
        }),
      );

      const failed = uploadResults.filter((r) => r.status === "rejected");

      if (failed.length > 0) {
        const reasons = failed
          .map((r) => (r as PromiseRejectedResult).reason?.message)
          .filter(Boolean)
          .join(", ");
        Toast.show({
          type: "error",
          text1: `${failed.length} file(s) failed to upload`,
          text2: reasons || "Please retry.",
        });
        setIsSending(false);
        return;
      }

      const attachmentIds = (
        uploadResults as PromiseFulfilledResult<string>[]
      ).map((r) => r.value);

      // Send message with attachments
      await createMessage.mutateAsync({
        projectId,
        message: message.trim(),
        attachmentIds,
      });

      setMessage("");
      setValue("attachments", []);
      refetch();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to send",
        text2: err?.message || "Something went wrong",
      });
    } finally {
      setIsSending(false);
    }
  };

  const canSend =
    (message.trim().length > 0 || attachments.some((a) => a.file)) &&
    !isSending;

  if (isLoading) {
    return (
      <AppLayout screenName="Chats">
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#2563eb" />
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              color: "#94a3b8",
              fontSize: 13,
              marginTop: 12,
            }}
          >
            Loading conversation…
          </Text>
        </View>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout screenName="Chats">
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              color: "#ef4444",
              fontSize: 14,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            Failed to load messages. Please try again.
          </Text>
          <TouchableOpacity
            onPress={refetch}
            style={{
              marginTop: 16,
              backgroundColor: "#eff6ff",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#2563eb", fontFamily: "Inter_500Medium" }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout screenName="Chats">
      <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="height"
          keyboardVerticalOffset={20}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 20,
              paddingBottom: 12,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              scrollRef.current?.scrollToEnd({ animated: false });
            }}
          >
            {messages.length > 0 ? (
              messages.map((item: Message) => (
                <MessageBubble
                  key={item.id}
                  item={item}
                  currentUserId={undefined}
                />
              ))
            ) : (
              <View style={{ alignItems: "center", marginTop: 80 }}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={52}
                  color="#cbd5e1"
                />
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    color: "#94a3b8",
                    fontSize: 14,
                    marginTop: 12,
                  }}
                >
                  No messages yet. Start the conversation.
                </Text>
              </View>
            )}
          </ScrollView>

          <View
            style={{
              backgroundColor: "#ffffff",
              borderTopWidth: 1,
              borderTopColor: "#e2e8f0",
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: 14,
            }}
          >
            {/* Attachment previews using FileUploadComponent */}
            {fields.map((field, index) => (
              <View key={field.id} className="mb-4">
                <Controller
                  control={control}
                  name={`attachments.${index}.file`}
                  render={({ field: { value, onChange } }) => (
                    <FileUploadComponent
                      title="Tap to upload document"
                      image={reportImage}
                      label={`Attachment ${index + 1}`}
                      note="PDF, DOC, JPG, PNG (max. 10MB)"
                      control={control}
                      name={`attachments.${index}.file`}
                      value={value}
                      onChange={onChange}
                      maxSizeMB={10}
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => remove(index)}
                  style={{ alignSelf: "flex-end", marginTop: 4 }}
                >
                  <Text
                    style={{
                      color: "#ef4444",
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                    }}
                  >
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add attachment button */}
            <TouchableOpacity
              onPress={() => append({ file: null })}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                alignSelf: "flex-start",
                marginBottom: 8,
              }}
            >
              <Ionicons name="attach-outline" size={16} color="#2563eb" />
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter_500Medium",
                  color: "#2563eb",
                }}
              >
                Add attachment
              </Text>
            </TouchableOpacity>

            {/* Input row */}
            <View
              style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}
            >
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message…"
                placeholderTextColor="#94a3b8"
                multiline
                maxLength={2000}
                style={{
                  flex: 1,
                  minHeight: 40,
                  maxHeight: 120,
                  backgroundColor: "#f8fafc",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  paddingHorizontal: 16,
                  paddingTop: 8,
                  paddingBottom: 8,
                  fontSize: 15,
                  fontFamily: "Inter_400Regular",
                  color: "#0f172a",
                }}
              />

              <TouchableOpacity
                onPress={handleSend}
                disabled={!canSend}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: canSend ? "#2563eb" : "#cbd5e1",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 1,
                }}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons
                    name="send"
                    size={17}
                    color={canSend ? "#ffffff" : "#94a3b8"}
                    style={{ marginLeft: 2 }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </AppLayout>
  );
};

export default ChatScreen;
