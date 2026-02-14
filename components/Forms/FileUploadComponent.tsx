import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Control, Controller } from "react-hook-form";
import { fileerror, markicon, reportImage } from "@/constants/icon";

export interface FileUploadResult {
  uri: string;
  name: string;
  type: string;
  width?: number;
  height?: number;
  size: number;
}

interface FileUploadComponentProps {
  control: Control<any>;
  name: string;
  label: string;
  title?: string;
  note?: string;
  icon?: any;
  error?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  onFileSelected?: (file: FileUploadResult) => void;
  onError?: (error: string) => void;
  containerClassName?: string;
}

/**
 * Reusable file upload component with file size validation
 * Supports image and document uploads with exact file size checking
 */
export default function FileUploadComponent({
  control,
  name,
  label,
  title = "Upload Document",
  note = "PNG, JPG, PDF (max. 5MB)",
  icon = reportImage,
  error: externalError,
  maxSizeMB = 5,
  allowedTypes = ["image", "pdf"],
  onFileSelected,
  onError,
  containerClassName = "",
}: FileUploadComponentProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  // Helper function to get proper mime type from file
  const getMimeType = (
    uri: string,
    fileName: string,
    fallbackType?: string
  ): string => {
    if (fallbackType && fallbackType.includes("/")) {
      return fallbackType;
    }

    // Get extension from file name or URI
    const extension =
      fileName.split(".").pop()?.toLowerCase() ||
      uri.split(".").pop()?.toLowerCase() ||
      "";

    // Map extensions to mime types
    const mimeTypes: { [key: string]: string } = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      pdf: "application/pdf",
      doc: "application/msword",
      docx:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    return mimeTypes[extension] || "image/jpeg";
  };

  const pickFile = async (onChange: (value: any) => void) => {
    try {
      setLocalError(null);
      if (onError) onError("");

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        const errorMsg = "Please allow access to your photos.";
        Alert.alert("Permission required", errorMsg);
        setLocalError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        let fileSizeInBytes = 0;

        // Get exact file size using fetch
        try {
          const response = await fetch(file.uri);
          const blob = await response.blob();
          fileSizeInBytes = blob.size;
          const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

          // Check file size
          if (fileSizeInMB > maxSizeMB) {
            const errorMsg = `File is too big (max ${maxSizeMB}MB)`;
            setLocalError(errorMsg);
            if (onError) onError(errorMsg);
            return;
          }
        } catch (sizeError) {
          console.error("Error getting file size:", sizeError);
        }

        // Get proper mime type
        const mimeType = getMimeType(
          file.uri,
          file.fileName || "document.jpg",
          file.type
        );

        const fileData: FileUploadResult = {
          uri: file.uri,
          name: file.fileName || "document.jpg",
          type: mimeType,
          width: file.width,
          height: file.height,
          size: fileSizeInBytes,
        };

        onChange(fileData);
        setLocalError(null);
        if (onFileSelected) onFileSelected(fileData);
        if (onError) onError("");
      }
    } catch (error) {
      const errorMsg = "Failed to pick document";
      Alert.alert("Error", errorMsg);
      setLocalError(errorMsg);
      if (onError) onError(errorMsg);
    }
  };

  const handleReUpload = (onChange: (value: any) => void) => {
    onChange(null);
    setLocalError(null);
    if (onError) onError("");
  };

  const displayError = externalError || localError;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const isUploaded = !!value;

        return (
          <View className={containerClassName}>
            <Text className="font-inter text-base mb-3 px-4">{label}</Text>

            {!isUploaded && !displayError && (
              <TouchableOpacity
                onPress={() => pickFile(onChange)}
                className="mx-4 border-2 border-dashed border-gray-300 rounded-3xl py-6 items-center justify-center"
              >
                <Image
                  className="w-10 h-10"
                  source={icon}
                  resizeMode="contain"
                />
                <Text className="text-md pt-4 font-inter text-gray-800 mb-2 text-center">
                  {title}
                </Text>
                <Text className="text-gray-500 text-sm font-inter text-center mb-4">
                  {note}
                </Text>
                <TouchableOpacity
                  className="border border-gray-200 px-12 py-3 rounded-xl"
                  onPress={() => pickFile(onChange)}
                >
                  <Text className="text-gray font-inter">Upload</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}

            {isUploaded && !displayError && (
              <View className="mx-4 border-2 border-blue-400 rounded-3xl py-6 items-center bg-blue-50">
                <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mb-2">
                  <Text className="text-white text-xl font-bold">✓</Text>
                </View>
                <Text className="text-xl font-semibold font-inter text-blue-600 mb-2">
                  Upload successful
                </Text>
                <Text className="text-gray-600 text-center font-inter mb-4">
                  {note}
                </Text>
                <TouchableOpacity
                  className="border border-gray-300 px-10 py-3 rounded-full"
                  onPress={() => handleReUpload(onChange)}
                >
                  <Text className="text-gray-700 font-inter text-base">
                    Re-upload
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {displayError && (
              <View className="mx-4 border-2 border-red-400 rounded-3xl py-6 items-center bg-red-50">
                <View className="w-10 h-10 rounded-full bg-red-500 items-center justify-center mb-2">
                  <Text className="text-white text-xl font-bold">i</Text>
                </View>
                <Text className="text-xl font-semibold font-inter text-red-600 mb-2">
                  {displayError}
                </Text>
                <Text className="text-gray-600 text-center font-inter mb-4">
                  {note}
                </Text>
                <TouchableOpacity
                  className="border border-red-300 px-10 py-3 rounded-full"
                  onPress={() => pickFile(onChange)}
                >
                  <Text className="text-red-700 font-inter text-base">
                    Try Again
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

