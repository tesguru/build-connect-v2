import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import PhoneInput from 'react-native-international-phone-number';

interface PhoneFormInputProps {
  label: string;
  value: string;
  selectedCountry: any;
  onChangeText: (text: string) => void;
  onChangeCountry: (country: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  hasError?: boolean;
  defaultCountry?: string;
  onChangeFormattedText?: (text: string) => void;
}

const PhoneFormInput: React.FC<PhoneFormInputProps> = ({
  label,
  value,
  selectedCountry,
  onChangeText,
  onChangeCountry,
  onChangeFormattedText,
  onBlur,
  placeholder = 'Enter phone number',
  hasError = false,
  defaultCountry = 'NG',
}) => {
  
  // Format phone number whenever value or selectedCountry changes
  useEffect(() => {
    if (selectedCountry?.idd?.root && value) {
      const callingCode = selectedCountry.idd.root.replace('+', '');
      const cleanNumber = value.replace(/[^\d]/g, '');
      
      if (cleanNumber && callingCode) {
        const formattedNumber = `+${callingCode}${cleanNumber}`;
        
        if (onChangeFormattedText) {
          onChangeFormattedText(formattedNumber);
        }
      }
    } else if (onChangeFormattedText) {
      // Clear formatted number if no country or phone number
      onChangeFormattedText('');
    }
  }, [value, selectedCountry, onChangeFormattedText]);

  const handlePhoneChange = (text: string) => {
    onChangeText(text);
  };

  const handleCountryChange = (country: any) => {
    onChangeCountry(country);
  };

  return (
    <View>
      <Text className="font-inter text-black mt-4 text-left">
        {label}
      </Text>
      <View className="mt-3">
        <PhoneInput
          value={value}
          onChangePhoneNumber={handlePhoneChange}
          selectedCountry={selectedCountry}
          onChangeSelectedCountry={handleCountryChange}
          defaultCountry={defaultCountry}
          placeholder={placeholder}
          phoneInputStyles={{
            container: {
              height: 50,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: hasError ? '#ef4444' : '#d1d5db',
              backgroundColor: 'transparent',
            },
            flagContainer: {
              paddingHorizontal: 12,
              justifyContent: 'center',
            },
            flag: {},
            caret: {
              color: '#4B5563',
            },
            divider: {
              backgroundColor: '#d1d5db',
            },
            callingCode: {
              fontFamily: 'Inter',
              fontSize: 16,
              color: '#4B5563',
              fontWeight: '500',
            },
            input: {
              fontFamily: 'Inter',
              fontSize: 16,
              color: '#4B5563',
              paddingHorizontal: 10,
            },
          }}
        />
      </View>
    </View>
  );
};

export default PhoneFormInput;