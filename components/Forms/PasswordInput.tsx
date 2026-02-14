import { HidePasswordIcon, ShowPasswordIcon } from '@/constants/image';
import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  hasError?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  hasError = false,
}) => {
  const [secureText, setSecureText] = useState(true);

  return (
    <View className="w-full">
  <Text className="font-inter text-black mt-4  text-left">
        {label}
      </Text>
      <View className="flex-row relative">
        <TextInput
          className={`h-[50px] font-inter w-full mt-3 px-2.5 pr-12 text-base text-gray-600 rounded-[10px] border ${
            hasError ? 'border-red-500' : 'border-gray-300'
          }`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
           placeholderTextColor="#6B7280"
          secureTextEntry={secureText}
        />
        <TouchableOpacity
          className="w-6 h-6 absolute right-4 top-[25px]"
          onPress={() => setSecureText(!secureText)}
        >
          <Image
            source={
              secureText
                ? ShowPasswordIcon
                : HidePasswordIcon
            }
            className="h-6 w-6"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PasswordInput;