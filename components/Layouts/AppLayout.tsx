import React, { ReactNode } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { arrowleft } from '@/constants/icon';
import colors from '@/constants/colors';

interface AppLayoutProps {
  screenName: string;
  children: ReactNode;
  navigateTo?: string; // Optional: specify where to navigate (e.g., "/dashboard")
  /** When true, content area is full-height (use for FABs). Add your own ScrollView inside. */
  fullHeightContent?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  screenName,
  children,
  navigateTo,
  fullHeightContent = false,
}) => {
  const router = useRouter();
  
  const handleBack = () => {
    if (navigateTo) {
      // If a specific route is provided, navigate to it
      router.push(navigateTo);
    } else {
      // Default: go back to previous screen
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push("/");
      }
    }
  };

  return (
    <View className="flex-1">
      <View 
        className="z-10 border-b border-gray-300 py-6 px-2"
        style={{ backgroundColor: colors.background_light }}
      >
        <View className="flex-row items-center justify-center relative">
          <TouchableOpacity onPress={handleBack} className="absolute left-2">
            <Image
              source={arrowleft}
              style={{ width: 25, height: 25 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text className="font-worksansBold text-xl">{screenName}</Text>
        </View>
      </View>

      {fullHeightContent ? (
        <View style={{ flex: 1 }}>{children}</View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {children}
        </ScrollView>
      )}
    </View>
  );
};

export default AppLayout;