import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { arrowleft } from "@/constants/icon";
import colors from "@/constants/colors";

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
    <View className="flex-row items-center justify-center relative pt-10 pb-6">
      <Text className="font-interbold text-2xl text-center flex-1 px-4" pointerEvents="box-none">
        {title}
      </Text>
      {showBackButton && (
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.6}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          className="absolute left-0 items-center justify-center"
          style={{
            paddingLeft: 16,
            paddingTop: 35,
            paddingRight: 24,
            paddingBottom: 24,
            minWidth: 77,
            minHeight: 61,
            zIndex: 10,
          }}
        >
          <Image
            source={arrowleft}
            resizeMode="contain"
            style={{ width: 35, height: 35 }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AuthHeader;

