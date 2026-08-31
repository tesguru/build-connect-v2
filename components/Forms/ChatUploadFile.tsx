import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

import { FileUploadResult } from "@/components/Forms/FileUploadComponent";

interface ChatUploadFileProps {
  attachments?: FileUploadResult[];
  onChange: (files: FileUploadResult[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

const getFileIcon = (mimeType?: string): keyof typeof Ionicons.glyphMap => {
  if (!mimeType) return "document-outline";
  if (mimeType.startsWith("image/")) return "image-outline";
  if (mimeType.includes("pdf")) return "document-text-outline";
  if (mimeType.includes("word") || mimeType.includes("doc"))
    return "document-outline";
  return "attach-outline";
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

/**
 * ChatUploadFile
 *
 * Lightweight, chat-optimized attachment picker. One tap opens the
 * native picker directly (no intermediate "tap to upload" card),
 * picked files render as removable chips. Intentionally independent
 * of FileUploadComponent so it doesn't affect forms elsewhere in the app.
 */
const ChatUploadFile = ({
  attachments = [],
  onChange,
  maxFiles = 5,
  maxSizeMB = 10,
  disabled = false,
}: ChatUploadFileProps) => {
  const [isPicking, setIsPicking] = useState(false);

  const handlePick = async () => {
    if (disabled || isPicking) return;

    if (attachments.length >= maxFiles) {
      Toast.show({
        type: "error",
        text1: `You can attach up to ${maxFiles} files`,
      });
      return;
    }

    setIsPicking(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const remainingSlots = maxFiles - attachments.length;
      const picked = result.assets.slice(0, remainingSlots);

      const oversized = picked.filter(
        (asset) => (asset.size ?? 0) > maxSizeMB * 1024 * 1024,
      );
      const valid = picked.filter(
        (asset) => (asset.size ?? 0) <= maxSizeMB * 1024 * 1024,
      );

      if (oversized.length > 0) {
        Toast.show({
          type: "error",
          text1: `${oversized.length} file(s) exceed ${maxSizeMB}MB and were skipped`,
        });
      }

      if (valid.length > 0) {
        const newFiles: FileUploadResult[] = valid.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || "application/octet-stream",
          size: asset.size,
        }));
        onChange([...attachments, ...newFiles]);
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Couldn't open file picker",
        text2: "Please try again.",
      });
    } finally {
      setIsPicking(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <View>
      {attachments.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            paddingBottom: 8,
          }}
        >
          {attachments.map((file, index) => (
            <View
              key={`${file.name}-${index}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#eff6ff",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#bfdbfe",
                paddingHorizontal: 10,
                paddingVertical: 7,
                width: "48%",
              }}
            >
              <Ionicons
                name={getFileIcon(file.type)}
                size={14}
                color="#2563eb"
              />
              <View style={{ flexShrink: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_500Medium",
                    color: "#1e40af",
                  }}
                >
                  {file.name}
                </Text>
                {!!file.size && (
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: "Inter_400Regular",
                      color: "#60a5fa",
                    }}
                  >
                    {formatFileSize(file.size)}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleRemove(index)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={{ marginLeft: "auto" }}
              >
                <Ionicons name="close-circle" size={16} color="#93c5fd" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        onPress={handlePick}
        disabled={disabled || isPicking || attachments.length >= maxFiles}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          alignSelf: "flex-start",
          marginBottom: 8,
          opacity: attachments.length >= maxFiles ? 0.4 : 1,
        }}
      >
        {isPicking ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : (
          <Ionicons name="attach-outline" size={16} color="#2563eb" />
        )}
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Inter_500Medium",
            color: "#2563eb",
          }}
        >
          {attachments.length >= maxFiles
            ? `Max ${maxFiles} files attached`
            : "Add attachment"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatUploadFile;
