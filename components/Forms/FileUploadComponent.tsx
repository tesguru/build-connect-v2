import { reportImage } from "@/constants/icon";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { Control, Controller } from "react-hook-form";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

export interface FileUploadResult {
  uri: string;
  name: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
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
  /** e.g. ["image/*", "application/pdf"] — defaults to all types */
  allowedTypes?: string[];
  onFileSelected?: (file: FileUploadResult) => void;
  onError?: (error: string) => void;
  containerClassName?: string;
}

export default function FileUploadComponent({
  control,
  name,
  label,
  title = "Upload Document",
  note = "PNG, JPG, PDF and more (max. 5MB)",
  icon = reportImage,
  error: externalError,
  maxSizeMB = 5,
  allowedTypes,          // undefined = expo uses "*/*" (all types)
  onFileSelected,
  onError,
  containerClassName = "",
}: FileUploadComponentProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  const clearError = () => {
    setLocalError(null);
    onError?.("");
  };

  const setError = (msg: string) => {
    setLocalError(msg);
    onError?.(msg);
  };

  const pickFile = async (onChange: (value: FileUploadResult | null) => void) => {
    try {
      clearError();

      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes ?? ["*/*"],   // "*/*" = every file type
        copyToCacheDirectory: true,       // needed to reliably read size/uri
        multiple: false,
      });

      // User cancelled
      if (result.canceled) return;

      const asset = result.assets[0];

      // Size guard
      const fileSizeInMB = (asset.size ?? 0) / (1024 * 1024);
      if (fileSizeInMB > maxSizeMB) {
        setError(`File is too large (max ${maxSizeMB} MB)`);
        return;
      }

      const fileData: FileUploadResult = {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? "application/octet-stream",
        size: asset.size ?? 0,
      };

      onChange(fileData);
      clearError();
      onFileSelected?.(fileData);
    } catch (err) {
      Alert.alert("Error", "Failed to pick file");
      setError("Failed to pick file");
    }
  };

  const handleReUpload = (onChange: (value: FileUploadResult | null) => void) => {
    onChange(null);
    clearError();
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

            {/* ── Default / idle state ── */}
            {!isUploaded && !displayError && (
              <TouchableOpacity
                onPress={() => pickFile(onChange)}
                className="mx-4 border-2 border-dashed border-gray-300 rounded-3xl py-6 items-center justify-center"
              >
                <Image className="w-10 h-10" source={icon} resizeMode="contain" />
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

            {/* ── Success state ── */}
            {isUploaded && !displayError && (
              <View className="mx-4 border-2 border-blue-400 rounded-3xl py-6 items-center bg-blue-50">
                <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mb-2">
                  <Text className="text-white text-xl font-bold">✓</Text>
                </View>
                <Text className="text-xl font-semibold font-inter text-blue-600 mb-2">
                  Upload successful
                </Text>
                <Text
                  className="text-gray-600 text-center font-inter mb-1 px-4"
                  numberOfLines={1}
                >
                  {(value as FileUploadResult).name}
                </Text>
                <Text className="text-gray-400 text-xs font-inter text-center mb-4">
                  {note}
                </Text>
                <TouchableOpacity
                  className="border border-gray-300 px-10 py-3 rounded-full"
                  onPress={() => handleReUpload(onChange)}
                >
                  <Text className="text-gray-700 font-inter text-base">Re-upload</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Error state ── */}
            {displayError && (
              <View className="mx-4 border-2 border-red-400 rounded-3xl py-6 items-center bg-red-50">
                <View className="w-10 h-10 rounded-full bg-red-500 items-center justify-center mb-2">
                  <Text className="text-white text-xl font-bold">!</Text>
                </View>
                <Text className="text-xl font-semibold font-inter text-red-600 mb-2">
                  {displayError}
                </Text>
                <Text className="text-gray-600 text-center font-inter mb-4">{note}</Text>
                <TouchableOpacity
                  className="border border-red-300 px-10 py-3 rounded-full"
                  onPress={() => pickFile(onChange)}
                >
                  <Text className="text-red-700 font-inter text-base">Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      }}
    />
  );
}