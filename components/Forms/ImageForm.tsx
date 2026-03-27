import { fileerror, markicon } from '@/constants/icon';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

interface ImageUploadComponentProps {
  control: Control<any>;
  name: string;
  error?: string;
  label: string;
  image: string;
  note: string;
  title: string;
}

export default function ImageUploadComponent({
  control,
  name,
  error,
  image,
  title,
  note,
  label
}: ImageUploadComponentProps) {

  const pickImage = async (onChange: (value: any) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const pickedImage = result.assets[0];
      onChange({
        uri: pickedImage.uri,
        width: pickedImage.width,
        height: pickedImage.height,
        type: pickedImage.type || 'image',
      });
    }
  };

  const handleReUpload = (onChange: (value: any) => void) => {
    onChange(null);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const imageUri = value?.uri || null;
        const isUploaded = !!value;

        return (
          <View className="">
            <Text className="py-4 font-inter text-md">{label}</Text>

            {!isUploaded && !error && (
              <View className="w-full border-2 border-dashed border-gray-300 rounded-3xl py-6 items-center justify-center">
                <Image className='w-10 h-10' source={image} resizeMode="contain" />

                <Text className="text-md pt-4 font-inter text-gray-800 mb-2 text-center">
                  {title}
                </Text>

                <Text className="text-gray-500 text-xl font-inter text-center mb-8">
                  {note}
                </Text>

                <TouchableOpacity
                  className="border border-gray-200 px-12 py-3 rounded-xl"
                  onPress={() => pickImage(onChange)}
                >
                  <Text className="text-gray font-inter">Upload</Text>
                </TouchableOpacity>
              </View>
            )}

            {isUploaded && !error && (
              <View className="w-full border-2 border-dashed border-blue-400 rounded-3xl py-6 items-center bg-blue-50">
                <Image className='w-10 h-10' source={markicon} resizeMode="contain" />

                <Text className="text-xl font-semibold font-inter text-blue-600 mb-2">
                  Upload successful
                </Text>

                <Text className="text-gray-600 text-center font-inter mb-8">
                  PNG, JPG, PDF (max. 800×400px)
                </Text>

                <TouchableOpacity
                  className="border border-gray-300 px-10 py-3 rounded-full active:bg-gray-50"
                  onPress={() => handleReUpload(onChange)}
                >
                  <Text className="text-gray-700 font-inter text-base">Re-upload</Text>
                </TouchableOpacity>
              </View>
            )}

            {error && (
              <View className="w-full border-2 border-dashed border-red-400 rounded-3xl py-6 items-center bg-red-50">
                <Image className='w-10 h-10' source={fileerror} resizeMode="contain" />

                <Text className="text-xl font-semibold font-inter text-red-600 mb-2">
                  Upload Failed
                </Text>

                <Text className="text-red-600 text-center font-inter mb-8">
                  {error}
                </Text>

                <TouchableOpacity
                  className="border border-red-300 px-10 py-3 rounded-full active:bg-red-100"
                  onPress={() => pickImage(onChange)}
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