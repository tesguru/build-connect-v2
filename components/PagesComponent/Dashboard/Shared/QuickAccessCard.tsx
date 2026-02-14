import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

interface QuickAccessCardProps {
  icon: any;
  title: string;
  onPress?: () => void;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  icon,
  title,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className=" rounded-2xl p-2 items-center justify-center border border-gray-300"
      style={{ width: 97, height: 85 }}
    >
      <Image
        source={icon}
        resizeMode="contain"
        className="w-5 h-5 mb-1"
      />
      <Text className="text-xs font-intersemibold text-center text-gray-700 mt-4">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default QuickAccessCard;

