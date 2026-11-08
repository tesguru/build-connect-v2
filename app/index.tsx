
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

  const {
    hasCompleted,
    isLoaded,
    loadOnboardingStatus,
  } = useOnboardingStore();

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (isLogin) {
      router.replace("/(tab)");
    } else if (hasCompleted) {
      router.replace("/sign_in/signin");
    } else {
      router.replace("/(onboarding)/onboarding");
    }
  }, [isLogin, hasCompleted, isLoaded, router]);

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
