import React, { useEffect, useRef } from "react";
import { View, Text, Image, Animated } from "react-native";
import { useRouter } from "expo-router";
import { BlueMark } from "@/constants/image";
import GradientButton from "../Buttons/GradientButton";

interface SuccessScreenProps {
  title?: string;
  message?: string;
  buttonTitle?: string;
  onPress?: () => void;
  navigateTo?: string;
  params?: Record<string, string>;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
  title = "You're all set!",
  message = "Congratulations! Your account has been created successfully.",
  buttonTitle = "Go to Homepage",
  onPress,
  navigateTo,
  params,
}) => {
  const router = useRouter();

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pop-in + fade
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Subtle bounce loop after entrance
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -8,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const handlePress = () => {
    if (onPress) return onPress();

    if (navigateTo) {
      router.push({
        pathname: navigateTo,
        params: params ?? {},
      });
    }
  };

  return (
    <View className="px-5 pt-20">
      <View className="flex-row justify-center">
        <Animated.View
          style={{
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }, { translateY: bounceAnim }],
          }}
        >
          <Image
            source={BlueMark}
            resizeMode="contain"
            className="w-24 h-24 mb-10"
          />
        </Animated.View>
      </View>

      <Text className="text-2xl pt-40 font-interbold text-center mb-3">
        {title}
      </Text>

      <Text className="text-gray-600 font-inter text-lg text-center mb-10 leading-6">
        {message}
      </Text>

      <View className="pt-80">
        <GradientButton onPress={handlePress} title={buttonTitle} />
      </View>
    </View>
  );
};

export default SuccessScreen;