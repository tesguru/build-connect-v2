import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  placeholder?: string;
  hasError?: boolean;
  errorMessage?: string;
}

const TimePicker = ({
  value,
  onChange,
  label,
  placeholder = 'Select time',
  hasError,
  errorMessage,
}: TimePickerProps) => {
  const [show, setShow] = useState(false);

  const parseTime = (timeStr: string) => {
    if (!timeStr) return new Date();
    const date = new Date(`1970-01-01T${timeStr}`);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const handleChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') setShow(false); // Android closes on select
    if (event.type === 'dismissed') return;
    if (selectedTime) {
      const formatted = selectedTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Change to true for AM/PM format
      });
      onChange(formatted);
    }
  };

  return (
    <View className="flex-1 pb-4">
      {label && (
        <Text className="font-inter text-sm text-gray-700 mb-1">{label}</Text>
      )}

      {/* Trigger Button */}
      <TouchableOpacity
        onPress={() => setShow(true)}
        className={`border rounded-lg px-4 py-3 flex-row justify-between items-center bg-white ${
          hasError ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <Text className={`font-inter text-sm ${value ? 'text-black' : 'text-gray-400'}`}>
          {value || placeholder}
        </Text>
        <Text>🕐</Text>
      </TouchableOpacity>

      {/* Error Message */}
      {hasError && errorMessage && (
        <Text className="font-inter pt-1 text-red-500 text-sm">{errorMessage}</Text>
      )}

      {/* Picker */}
      {show && (
        <DateTimePicker
          value={parseTime(value)}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

export default TimePicker;