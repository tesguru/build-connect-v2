import { arrowleft } from "@/constants/icon";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface AuthHeaderProps {
  title: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  onBackPress,
  showBackButton = true,
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View className="flex-row items-center  py-4  ">
      {/* Back Button - Left side */}
      {showBackButton ? (
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 11, right: 10 }}
          className="w-10 h-10 pr-2 items-center justify-center"
        >
          <Image
            source={arrowleft}
            resizeMode="contain"
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      ) : (
     
        <View className="w-10" />
      )}

   
      <Text 
        className="flex-1 font-interbold text-xl text-center text-gray-900"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {title}
      </Text>

  
      <View className="w-10" />
    </View>
  );
};

export default AuthHeader;