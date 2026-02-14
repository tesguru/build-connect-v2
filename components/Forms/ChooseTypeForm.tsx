import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Controller, Control } from 'react-hook-form';

type ChooseType = {
  id: string;
  label: string;
  value: string;
};

interface ChooseTypeFormProps {
  control: Control<any>;
  name: string;
  title: string;
  rules?: any;
  defaultValue?: string[];
  data?: ChooseType[];
}

const ChooseTypeForm = ({
  control,
  name,
  rules,
  defaultValue = [],
  data,
  title,
}: ChooseTypeFormProps) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field: { value, onChange } }) => {
        const selectedTypes: string[] = value || [];

        const handleCheckboxChange = (val: string) => {
          if (selectedTypes.includes(val)) {
            onChange(selectedTypes.filter((item) => item !== val));
          } else {
            onChange([...selectedTypes, val]);
          }
        };

        return (
          <View className="rounded-xl">
            <Text className="text-xl font-interbold text-gray-900 mb-4">
             {title}
            </Text>

            <View className="mb-6">
              {data.map((type) => {
                const isChecked = selectedTypes.includes(type.value);

                return (
                  <TouchableOpacity
                    key={type.id}
                    className="flex-row items-center justify-between bg-gray-50 p-4 rounded-lg mb-3"
                    onPress={() => handleCheckboxChange(type.value)}
                    activeOpacity={0.7}
                  >
                    <Text className="font-inter text-gray-900 flex-1">
                      {type.label}
                    </Text>
                    <Checkbox
                      value={isChecked}
                      onValueChange={() => handleCheckboxChange(type.value)}
                      color={isChecked ? '#3B82F6' : '#D1D5DB'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

          </View>
        );
      }}
    />
  );
};

export default ChooseTypeForm;
