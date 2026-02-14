import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
} from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { ChevronDown } from 'lucide-react-native';

interface DropdownOption {
  label: string;
  value: string;
}

interface MultiSelectDropdownFieldProps<T extends FieldValues> {
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

export default function MultiSelectDropdownField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  data,
  error,
  containerStyle,
  dropdownStyle,
  disabled = false,
}: MultiSelectDropdownFieldProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className={`${containerStyle || ''}`}>
      <Text className="text-base font-inter text-gray-900 mb-2">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value = [] } }) => {
          const selectedItems = Array.isArray(value) ? value : [];
          
          const toggleSelection = (itemValue: string) => {
            const newValue = selectedItems.includes(itemValue)
              ? selectedItems.filter(v => v !== itemValue)
              : [...selectedItems, itemValue];
            onChange(newValue);
          };

          const getDisplayText = () => {
            if (selectedItems.length === 0) return placeholder;
            const selectedLabels = data
              .filter(item => selectedItems.includes(item.value))
              .map(item => item.label);
            return selectedLabels.join(', ');
          };

          return (
            <>
              {/* Dropdown Trigger - Same design as your single dropdown */}
              <TouchableOpacity
                onPress={() => !disabled && setIsOpen(true)}
                style={[
                  {
                    height: 53,
                    borderWidth: error ? 2 : 1,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    borderColor: error ? '#EF4444' : '#D1D5DB',
                  
                    opacity: disabled ? 0.6 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                  dropdownStyle,
                ]}
                disabled={disabled}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: selectedItems.length === 0 ? '#9CA3AF' : '#1A1A1A',
                    flex: 1,
                  }}
                >
                  {getDisplayText()}
                </Text>
                <Text style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 8 }}><ChevronDown size={15}/></Text>
              </TouchableOpacity>

              {/* Modal for Selection */}
              <Modal
                visible={isOpen}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsOpen(false)}
              >
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
                  <View style={{ 
                    backgroundColor: '#fff', 
                    borderTopLeftRadius: 20, 
                    borderTopRightRadius: 20,
                    maxHeight: '80%',
                    paddingBottom: 20,
                  }}>
                    {/* Header */}
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: 20,
                      borderBottomWidth: 1,
                      borderBottomColor: '#F3F4F6',
                    }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Inter_600SemiBold', color: '#1A1A1A' }}>
                        {label}
                      </Text>
                      <TouchableOpacity onPress={() => onChange([])}>
                        <Text style={{ color: '#3B82F6', fontSize: 16, fontFamily: 'Inter_400Regular' }}>
                          Clear All
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Selected Count */}
                    <Text style={{ 
                      padding: 16, 
                      fontSize: 14, 
                      color: '#6B7280',
                      fontFamily: 'Inter_400Regular'
                    }}>
                      {selectedItems.length} selected
                    </Text>

                    {/* Options List */}
                    <FlatList
                      data={data}
                      keyExtractor={item => item.value}
                      renderItem={({ item }) => {
                        const isSelected = selectedItems.includes(item.value);
                        return (
                          <TouchableOpacity
                            onPress={() => toggleSelection(item.value)}
                            style={{
                              paddingVertical: 14,
                              paddingHorizontal: 16,
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                              borderBottomWidth: 1,
                              borderBottomColor: '#F3F4F6',
                            }}
                          >
                            <View style={{
                              width: 24,
                              height: 24,
                              borderRadius: 4,
                              borderWidth: 2,
                              borderColor: isSelected ? '#3B82F6' : '#D1D5DB',
                              backgroundColor: isSelected ? '#3B82F6' : '#FFFFFF',
                              marginRight: 12,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                              {isSelected && (
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
                              )}
                            </View>
                            <Text style={{
                              flex: 1,
                              fontFamily: "Inter_400Regular",
                              fontSize: 14,
                              color: isSelected ? '#3B82F6' : '#1A1A1A',
                              fontWeight: isSelected ? '500' : '400',
                            }}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      }}
                    />

                    {/* Done Button */}
                    <TouchableOpacity
                      onPress={() => setIsOpen(false)}
                      style={{
                        backgroundColor: '#3B82F6',
                        margin: 16,
                        padding: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ 
                        color: '#fff', 
                        fontSize: 16, 
                        fontWeight: 'bold',
                        fontFamily: 'Inter_600SemiBold'
                      }}>
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          );
        }}
      />
      {error && <Text className="text-sm font-inter text-red-500 mt-1">{error}</Text>}
    </View>
  );
}