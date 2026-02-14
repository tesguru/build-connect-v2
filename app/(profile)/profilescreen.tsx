import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHeader from "@/components/Miscallaneous/PageHeader";
import { AvatarImage } from "@/constants/image";
import { useAuthStore } from "@/store/Authstore";
import { useRouter } from "expo-router"; 

const ProfileScreen = () => {
  const { user, clearAuthData } = useAuthStore();
  const router = useRouter(); 
  
  const fullName = user ? `${user.firstName} ${user.lastName}` : "User Name";
  const email = user?.email || "user@example.com";

  const handleEditProfile = () => {
    router.push("/editprofilescreen"); 
  };

  const handlePersonalInformation = () => {
    router.push("/editprofilescreen"); 
  };

  const handleAccountSettings = () => {
  
  };

  const handleNotifications = () => {
   
  };

  const handleBack = () => {
 
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tab)"); 
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await clearAuthData();
          
            router.replace("/sign_in/signin"); 
          
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="flex-1 bg-white">
      <AuthHeader title="Profile" onBackPress={handleBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >

        <View className="items-center pt-6 pb-8">
          <View className="relative">
            <Image
              source={AvatarImage}
              className="w-24 h-24 rounded-full"
            />
            <TouchableOpacity
              onPress={handleEditProfile}
              className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 border-2 border-white"
            >
              <Image
                source={require("@/assets/icons/camera.png")}
                className="w-4 h-4"
                style={{ tintColor: "white" }}
              />
            </TouchableOpacity>
          </View>
          <Text className="font-interbold text-xl mt-4 text-gray-900">
            {fullName}
          </Text>
          <Text className="font-inter text-base mt-1 text-gray-600">
            {email}
          </Text>
        </View>

   
        <View className="px-4 mt-4">
          <Text className="font-interbold text-lg mb-4 text-gray-900">
            Account
          </Text>
          <TouchableOpacity
            onPress={handlePersonalInformation}
            className="bg-white rounded-xl p-4 mb-3 border border-gray-200 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                <Image
                  source={require("@/assets/icons/profile-2user.png")}
                  className="w-5 h-5"
                  style={{ tintColor: "#3B82F6" }}
                />
              </View>
              <View className="flex-1">
                <Text className="font-interbold text-base text-gray-900">
                  Personal Information
                </Text>
                <Text className="font-inter text-sm text-gray-600 mt-1">
                  Edit your personal details
                </Text>
              </View>
            </View>
            <Image
              source={require("@/assets/icons/arrow-left.png")}
              className="w-5 h-5"
              style={{ tintColor: "#9CA3AF", transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
        </View>

 
        <View className="px-4 mt-6">
          <Text className="font-interbold text-lg mb-4 text-gray-900">
            Settings
          </Text>
          <TouchableOpacity
            onPress={handleAccountSettings}
            className="bg-white rounded-xl p-4 mb-3 border border-gray-200 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                <Image
                  source={require("@/assets/icons/settings.png")}
                  className="w-5 h-5"
                  style={{ tintColor: "#3B82F6" }}
                />
              </View>
              <View className="flex-1">
                <Text className="font-interbold text-base text-gray-900">
                  Account Settings
                </Text>
                <Text className="font-inter text-sm text-gray-600 mt-1">
                  Adjust account preferences
                </Text>
              </View>
            </View>
            <Image
              source={require("@/assets/icons/arrow-left.png")}
              className="w-5 h-5"
              style={{ tintColor: "#9CA3AF", transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNotifications}
            className="bg-white rounded-xl p-4 mb-3 border border-gray-200 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                <Image
                  source={require("@/assets/icons/notification.png")}
                  className="w-5 h-5"
                  style={{ tintColor: "#3B82F6" }}
                />
              </View>
              <View className="flex-1">
                <Text className="font-interbold text-base text-gray-900">
                  Notifications
                </Text>
                <Text className="font-inter text-sm text-gray-600 mt-1">
                  Manage notifications
                </Text>
              </View>
            </View>
            <Image
              source={require("@/assets/icons/arrow-left.png")}
              className="w-5 h-5"
              style={{ tintColor: "#9CA3AF", transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
        </View>

    
        <View className="px-4 mt-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-white rounded-xl p-4 mb-3 border border-red-200 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mr-3">
                <Text className="text-red-600 text-xl font-bold">↪</Text>
              </View>
              <View className="flex-1">
                <Text className="font-interbold text-base text-red-600">
                  Logout
                </Text>
                <Text className="font-inter text-sm text-gray-600 mt-1">
                  Sign out of your account
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;