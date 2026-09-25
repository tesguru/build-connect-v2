import colors from "@/constants/colors";
import { SplashImage } from "@/constants/image";
import strings from "@/constants/strings";
import { useAuthStore } from "@/store/Authstore";
import { useOnboardingStore } from "@/store/OnboardingStore";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { isLogin } = useAuthStore();
  const { hasCompleted, isLoaded, loadOnboardingStatus } = useOnboardingStore();

  // 1. Load onboarding flag on app start
  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  // 2. Route based on both flags
  useEffect(() => {
    if (!isLoaded) return;

    const timeout = setTimeout(() => {
      if (isLogin) {
        router.replace("/(tab)");
      } else if (hasCompleted) {
        router.replace("/(auth)/sign_in/signin");
      } else {
        router.replace("/(onboarding)/onboarding");
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isLogin, hasCompleted, isLoaded]);

  return (
    <View className="flex-1 items-center justify-center p-16 bg-primary">
      <Image
        source={SplashImage}
        style={{ width: 300, height: 100 }}
        resizeMode="contain"
      />
      <Text
        className="mt-1 text-white font-work-sans"
        style={{ marginTop: 1, color: colors.color_white }}
      >
        {strings.splash_description}
      </Text>
    </View>
  );
}
