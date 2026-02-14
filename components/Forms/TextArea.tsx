import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface FormTextAreaProps extends TextInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  hasError?: boolean;
  errorMessage?: string;
  width?: string;
  numberOfLines?: number;
  minHeight?: number;
}

export const FormTextArea: React.FC<FormTextAreaProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  hasError = false,
  errorMessage,
  width = "",
  numberOfLines = 6,
  minHeight = 100,
  ...rest
}) => {
  return (
    <View className={width}>
      <Text className="text-base font-inter text-gray-900 mb-3">
        {label}
      </Text>
      
      <TextInput
        multiline
        numberOfLines={numberOfLines}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        className={`${width} p-4 bg-white rounded-xl text-gray-900 text-base ${
          hasError 
            ? 'border-2 border-red-500' 
            : 'border border-gray-300'
        }`}
        style={{ 
          textAlignVertical: 'top',
          minHeight 
        }}
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
      
      {hasError && errorMessage && (
        <Text className="text-red-500 font-inter text-sm mt-1">
          {errorMessage}
        </Text>
      )}
    </View>
  );
};