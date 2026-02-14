import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHeader from "@/components/Miscallaneous/PageHeader";
import FormInput from "@/components/Forms/Formnput";
import { FormTextArea } from "@/components/Forms/TextArea";
import { AvatarImage } from "@/constants/image";
import { useAuthStore } from "@/store/Authstore";
import * as ImagePicker from "expo-image-picker";
import GradientButton from "@/components/Buttons/GradientButton";
import { useRouter } from "expo-router"; // Add Expo Router import

const EditProfileScreen = () => {
  const { user, updateUser } = useAuthStore();
  const router = useRouter(); // Initialize router
  
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.mobileNumber || "");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleChangePhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
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
    // Navigate to ChangePassword screen
    router.push("/changepasswordscreen"); // Adjust path based on your structure
  };

  const handleSave = () => {
    if (user) {
      const updatedUser = {
        ...user,
        firstName,
        lastName,
        email: email.toLowerCase(),
        mobileNumber: phoneNumber,
      };
      updateUser(updatedUser);
      
      Alert.alert("Success", "Profile updated successfully", [
        { 
          text: "OK", 
          onPress: () => {
            // Navigate back to Profile screen
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(profile)/profilescreen"); // Fallback if no history
            }
          }
        },
      ]);
    }
  };

  const handleBack = () => {
    // Simple back navigation
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profilescreen"); // Fallback to profile
    }
  };

  // Alternative: Create a reusable goBackOrTo function for Expo Router
  const goBackOrTo = (fallbackRoute: string) => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <AuthHeader title="Edit Profile" onBackPress={handleBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Picture Section */}
        <View className="items-center pt-6 pb-4">
          <View className="relative">
            <Image
              source={profileImage ? { uri: profileImage } : AvatarImage}
              className="w-24 h-24 rounded-full"
            />
            <TouchableOpacity
              onPress={handleChangePhoto}
              className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 border-2 border-white"
            >
              <Image
                source={require("@/assets/icons/camera.png")}
                className="w-4 h-4"
                style={{ tintColor: "white" }}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleChangePhoto} className="mt-3">
            <Text className="text-blue-600 font-interbold text-base">
              Change Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="px-4">
          <View className="flex-row gap-4">
            <View className="flex-1">
              <FormInput
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter name"
                autoCapitalize="words"
              />
            </View>
            <View className="flex-1">
              <FormInput
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                autoCapitalize="words"
              />
            </View>
          </View>

          <FormInput
            label="Email Address"
            value={email}
            onChangeText={(text) => setEmail(text.toLowerCase())}
            placeholder="user@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
          />

          <FormInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="070********"
            keyboardType="phone-pad"
          />

          <View className="mt-4">
            <FormTextArea
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address..."
              numberOfLines={4}
              minHeight={100}
            />
          </View>

          <TouchableOpacity
            onPress={handleChangePassword}
            className="bg-white rounded-xl p-4 mt-6 border border-gray-200 flex-row items-center justify-between"
          >
            <Text className="font-interbold text-base text-gray-900">
              Change Password
            </Text>
            <Image
              source={require("@/assets/icons/arrow-left.png")}
              className="w-5 h-5"
              style={{ tintColor: "#9CA3AF", transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>

          <View className="mt-8 mb-4">
            <GradientButton
              title="Save Changes"
              onPress={handleSave}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;