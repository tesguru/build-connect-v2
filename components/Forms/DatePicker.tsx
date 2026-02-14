import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native'; 

interface FormDatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  hasError?: boolean;
  errorMessage?: string;
  width?: string;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  value,
  onChange,
  hasError = false,
  errorMessage,
  width = "w-full",
  isOpen: controlledIsOpen,
  onOpen,
  onClose,
  minimumDate,
  maximumDate,
}) => {
  const [internalShow, setInternalShow] = useState(false);
  const [tempDate, setTempDate] = useState(value);
  
  // Use controlled state if provided, otherwise use internal state
  const show = controlledIsOpen !== undefined ? controlledIsOpen : internalShow;

  const handleOpen = () => {
    // Ensure tempDate respects minimumDate constraint
    const initialDate = minimumDate && value < minimumDate ? minimumDate : value;
    setTempDate(initialDate);
    if (controlledIsOpen === undefined) {
      setInternalShow(true);
    } else if (onOpen) {
      onOpen();
    }
  };

  const handleClose = () => {
    if (controlledIsOpen === undefined) {
      setInternalShow(false);
    } else if (onClose) {
      onClose();
    }
  };

  const handleDone = () => {
    // Ensure selected date is not before minimumDate
    const finalDate = minimumDate && tempDate < minimumDate ? minimumDate : tempDate;
    onChange(finalDate);
    handleClose();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android' && event.type === 'set') {
      if (selectedDate) {
        // Ensure selected date is not before minimumDate
        const finalDate = minimumDate && selectedDate < minimumDate ? minimumDate : selectedDate;
        onChange(finalDate);
        handleClose();
      }
    } else if (Platform.OS === 'ios' && selectedDate) {
      // Ensure selected date is not before minimumDate
      const finalDate = minimumDate && selectedDate < minimumDate ? minimumDate : selectedDate;
      setTempDate(finalDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View className={width}>
      <Text className="text-base font-inter text-gray-900 mb-3">
        {label}
      </Text>
      
      <TouchableOpacity
        onPress={handleOpen}
        className={`flex-row items-center justify-between px-4 py-3 bg-white rounded-xl ${
          hasError ? 'border-2 border-red-500' : 'border border-gray-300'
        }`}
      >
        <Text className="text-base font-inter text-gray-900">
          {formatDate(value)}
        </Text>
        <Calendar size={20} color="#6b7280" />
      </TouchableOpacity>

      {Platform.OS === 'ios' && show ? (
        <Modal
          visible={show}
          transparent={true}
          animationType="fade"
          onRequestClose={handleClose}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-2xl p-6 mx-4" style={{ width: '90%', maxWidth: 400 }}>
              <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={handleClose}>
                  <Text className="text-gray-500 font-inter text-base">Cancel</Text>
                </TouchableOpacity>
                <Text className="font-interbold text-lg text-gray-900">{label}</Text>
                <TouchableOpacity onPress={handleDone}>
                  <Text className="text-blue-600 font-interbold text-base">Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                style={{ height: 200 }}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
            </View>
          </View>
        </Modal>
      ) : show && Platform.OS === 'android' ? (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {hasError && errorMessage && (
        <Text className="text-red-500 font-inter text-sm mt-1">
          {errorMessage}
        </Text>
      )}
    </View>
  );
};