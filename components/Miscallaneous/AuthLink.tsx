import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

type AuthLinkProps = {
  questionText: string;           
  linkText: string;               
  onPress: () => void;           
  className?: string;             
  questionClassName?: string;   
  linkClassName?: string;       
};

const AuthLink: React.FC<AuthLinkProps> = ({
  questionText,
  linkText,
  onPress,
  className = "",
  questionClassName = "",
  linkClassName = "",
}) => {
  return (
    <View className={`flex-row font-inter items-center mt-2 ${className}`}>
      <Text className={`font-inter ${questionClassName}`}>{questionText} </Text>
      <TouchableOpacity onPress={onPress}>
        <Text className={`font-inter underline ${linkClassName}`}>
          {linkText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthLink;
