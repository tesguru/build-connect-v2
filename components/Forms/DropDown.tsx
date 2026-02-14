import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder: string;
  data: DropdownOption[];
  error?: string;
  containerStyle?: string;
  dropdownStyle?: ViewStyle;
  disabled?: boolean;
}

export default function DropdownField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  data,
  error,
  containerStyle,
  dropdownStyle,
  disabled = false,
}: DropdownFieldProps<T>) {
  return (
    <View className={`${containerStyle || ''}`}>
      <Text className="text-base font-inter text-gray-900 mb-2">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <Dropdown
            style={[
              {
                height: 53,
                borderWidth: error ? 2 : 1,
                borderRadius: 12,
                paddingHorizontal: 16,
                borderColor: error ? '#EF4444' : '#D1D5DB',
                opacity: disabled ? 0.6 : 1,
              },
              dropdownStyle,
            ]}
            placeholderStyle={{
              fontSize: 14,
              color: '#9CA3AF',
              fontFamily: "Inter_400Regular",
            }}
            selectedTextStyle={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: '#1A1A1A',
            }}
            data={data}
            labelField="label"
            valueField="value"
            placeholder={placeholder}
            value={value}
            onChange={item => onChange(item.value)}
            disable={disabled}
            mode="modal"
            renderItem={(item, selected) => (
              <View className={`p-4 flex-row items-center ${selected ? 'bg-blue-500' : 'bg-white'}`}>
                {selected && (
                  <Text className="text-white text-lg font-bold mr-3">✓</Text>
                )}
                <Text className={`flex-1 font-inter text-base ${selected ? 'text-white font-inter' : 'text-gray-900'}`}>
                  {item.label}
                </Text>
              </View>
            )}
          />
        )}
      />
      {error && <Text className="text-sm font-inter text-red-500 mt-1">{error}</Text>}
    </View>
  );
}