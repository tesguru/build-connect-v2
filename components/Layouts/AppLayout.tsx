import colors from '@/constants/colors';
import { arrowleft } from '@/constants/icon';
import { useAuthStore } from '@/store/Authstore';
import { useRouter } from 'expo-router';
import { Home } from 'lucide-react-native';
import React, { ReactNode } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface AppLayoutProps {
  screenName: string;
  children: ReactNode;
  navigateTo?: string;
  fullHeightContent?: boolean;
  showHome?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  screenName,
  children,
  navigateTo,
  fullHeightContent = false,
  showHome = true,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (navigateTo) {
      router.push(navigateTo);
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push('/');
      }
    }
  };

    const { user } = useAuthStore();
   user?.role === "client";

  const handleHome = () => {
     if(user?.role === "client"){
 router.push('/(clients)/home/home');
     }
     else{
      router.push('/(builders)/home/home')
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

          {showHome && (
            <TouchableOpacity onPress={handleHome} className="absolute right-2 pt-2">
              <Home size={24} color={colors.primary || '#2463EB'} />
            </TouchableOpacity>
          )}
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