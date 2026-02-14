import React from "react";
import { View, Image, Text } from "react-native";
import { useFonts, WorkSans_400Regular, WorkSans_500Medium, WorkSans_600SemiBold, WorkSans_800ExtraBold } from "@expo-google-fonts/work-sans";
import { Inter_400Regular, Inter_500Medium, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { SplashImage } from "@/constants/image";
import colors from "@/constants/colors";
import string from "@/constants/strings";

function FontLoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center p-16 bg-primary">
      <Image 
        source={SplashImage}
        style={{
          width: 300,
          height: 100
        }}
        resizeMode="contain"
      />

      <Text className="mt-1 text-white font-work-sans" style={{ 
        marginTop: 1, 
        color: colors.color_white,
      }}> 
        {string.splash_description} 
      </Text>
    </View>
  );
}

export default function FontLayout({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <FontLoadingScreen />;
  }

  return <>{children}</>;
}
