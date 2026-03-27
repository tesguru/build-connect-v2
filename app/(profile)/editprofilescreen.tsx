import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";

import GradientButton from "@/components/Buttons/GradientButton";
import FormInput from "@/components/Forms/Formnput";
import AuthHeader from "@/components/Miscallaneous/PageHeader";
import { AvatarImage } from "@/constants/image";
import { useAuth } from "@/core/hooks/useAuth";
import { useAuthStore } from "@/store/Authstore";


const editProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobileNumber: z
    .string()
    .min(1, "Phone number is required")
    .min(10, "Enter a valid phone number"),
});

type EditProfileInput = z.infer<typeof editProfileSchema>;

const EditProfileScreen = () => {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const { changeProfileMutation } = useAuth();

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      mobileNumber: user?.mobileNumber ?? "",
    },
  });

 
  const handleChangePhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access camera roll is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleChangePassword = () => {
    router.push("/changepasswordscreen");
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profilescreen");
    }
  };


  const onSubmit = (data: EditProfileInput) => {
    if (user) {
      updateUser({ ...user, ...data });

      const apiPayload: EditProfileInput = {
        firstName: data.firstName,
        lastName: data.lastName,
        mobileNumber: data.mobileNumber,
      };

      changeProfileMutation.mutate(apiPayload);
    }   
  };    

  return (
    <View className="flex-1 bg-white">
      <AuthHeader title="Edit Profile" onBackPress={handleBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
     
        <View className="items-center pt-6 pb-4">
          <View className="relative">
            <Image
              source={profileImage ? { uri: profileImage } : AvatarImage}
              className="w-24 h-24 rounded-full"
            />
            {/* <TouchableOpacity
              onPress={handleChangePhoto}
              className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 border-2 border-white"
            >
              <Image
                source={require("@/assets/icons/camera.png")}
                className="w-4 h-4"
                style={{ tintColor: "white" }}
              />
            </TouchableOpacity> */}
          </View>
          <TouchableOpacity onPress={handleChangePhoto} className="mt-3">
            <Text className="text-blue-600 font-interbold text-base">Change Photo</Text>
          </TouchableOpacity>
        </View>

      
        <View className="px-4">

     
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, value } }) => (
                  <FormInput
                    label="First Name"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter first name"
                    autoCapitalize="words"
                    hasError={!!errors.firstName}
                  />
                )}
              />
              {errors.firstName && (
                <Text className="font-inter pt-1 text-red-500 text-sm">
                  {errors.firstName.message}
                </Text>
              )}
            </View>

            <View className="flex-1">
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, value } }) => (
                  <FormInput
                    label="Last Name"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter last name"
                    autoCapitalize="words"
                    hasError={!!errors.lastName}
                  />
                )}
              />
              {errors.lastName && (
                <Text className="font-inter pt-1 text-red-500 text-sm">
                  {errors.lastName.message}
                </Text>
              )}
            </View>
          </View>

        
          <FormInput
            label="Email Address"
            value={user?.email ?? ""}
            onChangeText={() => {}}
            placeholder="user@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
          />

          <View className="mt-1">
            <Controller
              control={control}
              name="mobileNumber"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Phone Number"
                  value={value}
                  onChangeText={onChange}
                  placeholder="070********"
                  keyboardType="phone-pad"
                  hasError={!!errors.mobileNumber}
                />
              )}
            />
            {errors.mobileNumber && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.mobileNumber.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleChangePassword}
            className="bg-white rounded-xl p-4 mt-6 border border-gray-200 flex-row items-center justify-between"
          >
            <Text className="font-interbold text-base text-gray-900">Change Password</Text>
            <Image
              source={require("@/assets/icons/arrow-left.png")}
              className="w-5 h-5"
              style={{ tintColor: "#9CA3AF", transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>

          <View className="mt-8 mb-4">
            <GradientButton
              loading={changeProfileMutation.isPending}
              title="Save Changes"
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;