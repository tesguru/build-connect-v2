import { BlueMark } from "@/constants/image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Image, Text, View } from "react-native";
import PrimaryButton from "../Buttons/Button";
import GradientButton from "../Buttons/GradientButton";


interface SuccessScreenProps {
  title?: string;
  message?: string;
  buttonTitle?: string;
  onPress?: () => void;
  navigateTo?: string;
  params?: Record<string, string>;
  secondButtonTitle?: string;
  secondButtonOnPress?: () => void;
  secondButtonNavigateTo?: string;
  secondButtonParams?: Record<string, string>;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
  title = "You're all set!",
  message = "Congratulations! Your account has been created successfully.",
  buttonTitle = "Go to Homepage",
  onPress,
  navigateTo,
  params,
  secondButtonTitle,
  secondButtonOnPress,
  secondButtonNavigateTo,
  secondButtonParams,
}) => {
  const router = useRouter();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
      router.push({ pathname: navigateTo, params: params ?? {} });
    }
  };

  const handleSecondPress = () => {
    if (secondButtonOnPress) return secondButtonOnPress();
    if (secondButtonNavigateTo) {
      router.push({ pathname: secondButtonNavigateTo, params: secondButtonParams ?? {} });
    }
  };

  return (
    <View className="px-5 pt-12">
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

      <Text className="text-2xl pt-32 font-interbold text-center mb-3">
        {title}
      </Text>

      <Text className="text-gray-600 font-inter text-lg text-center mb-10 leading-6">
        {message}
      </Text>

      <View className="pt-60 gap-3">
        <GradientButton onPress={handlePress} title={buttonTitle} />

        {secondButtonTitle && (
          <PrimaryButton
            title={secondButtonTitle}
            onPress={handleSecondPress}
            backgroundColor="transparent"
            textColor="#2563EB"
            style={{ borderWidth: 1.5, borderColor: '#2563EB' }}
          />
        )}
      </View>
    </View>
  );
};

export default SuccessScreen;