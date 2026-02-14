import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  hasError?: boolean;
  formatNumber?: boolean;
  editable?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  hasError = false,
  formatNumber = false,
  editable = true,
}) => {
  
  // Format number with comma separators
  const formatNumberWithCommas = (text: string): string => {
    // Remove all non-digit characters except decimal point
    const numericText = text.replace(/[^\d.]/g, '');
    
    // Split into whole and decimal parts
    const parts = numericText.split('.');
    let wholePart = parts[0];
    const decimalPart = parts.length > 1 ? `.${parts[1]}` : '';
    
    // Format whole part with commas
    if (wholePart) {
      wholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    return wholePart + decimalPart;
  };

  // Parse formatted number back to raw number
  const parseFormattedNumber = (formattedText: string): string => {
    return formattedText.replace(/,/g, '');
  };

  const handleChangeText = (text: string) => {
    if (formatNumber && keyboardType === 'numeric') {
      // Format the number with commas
      const formattedText = formatNumberWithCommas(text);
      
      // Parse back to raw number for the onChangeText callback
      const rawValue = parseFormattedNumber(formattedText);
      
      // Update the input with formatted text
      // But call onChangeText with the raw value
      onChangeText(rawValue);
      
      // We need to return the formatted text for display
      // But we can't directly set it here since onChangeText
      // expects the raw value. We'll handle this differently.
    } else {
      onChangeText(text);
    }
  };

  // Get display value
  const getDisplayValue = () => {
    if (formatNumber && keyboardType === 'numeric' && value) {
      return formatNumberWithCommas(value);
    }
    return value;
  };

  return (
    <View>
      <Text className="font-inter text-black mt-4 text-left">
        {label}
      </Text>
      <TextInput
        className={`h-[50px] font-inter w-full mt-3 px-2.5 text-base rounded-[10px] border ${
          hasError ? 'border-red-500' : 'border-gray-300'
        } ${!editable ? 'bg-gray-100 text-gray-500' : 'text-gray-600'}`}
        value={getDisplayValue()}
        onChangeText={handleChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
      />
    </View>
  );
};

export default FormInput;