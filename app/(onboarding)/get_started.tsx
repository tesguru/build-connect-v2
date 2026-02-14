import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { GetStartedImage } from "@/constants/image";
import PrimaryButton from "@/components/Buttons/Button";
import AuthLink from "@/components/Miscallaneous/AuthLink";

const GetStarted = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("client");

  const handleNavigation = () => {
    router.push({
      pathname: "/sign_up/sign_up",
      params: { selectedRole }
    });
  };

  return (
    <View>
      <ImageBackground  
        imageStyle={{
          top: 0,        
          left: 0,
          bottom: 0,       
        }}  
        resizeMode="cover"  
        className="h-full w-full bg-black/50" 
        source={GetStartedImage}
      >
        <View className="flex-col justify-end h-full items-center pb-[40px] px-11 bg-black/50">
          <Text className="font-worksansBold text-white text-3xl text-center px-5">
            Get quality projects, showcase, grow your work
          </Text>

          <View className="flex-row bg-white/20 rounded-full p-1 w-full max-w-md mt-8">
            <TouchableOpacity
              className={`flex-1 py-3.5 px-5 items-center justify-center rounded-full ${
                selectedRole === "client" ? "bg-white" : ""
              }`}
              onPress={() => setSelectedRole("client")}
            >
              <Text
                className={`text-base font-inter font-medium ${
                  selectedRole === "client" ? "text-gray-800" : "text-white/70"
                }`}
              >
                I'm a Client
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3.5 px-5 items-center justify-center rounded-full ${
                selectedRole === "builder" ? "bg-white" : ""
              }`}
              onPress={() => setSelectedRole("builder")}
            >
              <Text
                className={`text-base font-inter font-medium ${
                  selectedRole === "builder" ? "text-gray-800" : "text-white/70"
                }`}
              >
                I'm a Builder
              </Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton
            className="my-6"
            onPress={handleNavigation}
            textColor="white"
            title="Create account"
          />

          <AuthLink
            questionText="Already have an account?"
            linkText="Login"
            onPress={() => router.push("/sign_in/signin")}
            className="justify-center mt-4"
            questionClassName="text-gray-200 text-sm"
            linkClassName="text-white text-base"
          />
        </View>
      </ImageBackground>
    </View>
  );
};

export default GetStarted;