import React from "react";
import { View, TextInput, Image } from "react-native";
import { SearchIcon } from "@/constants/icon";
import colors from "@/constants/colors";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onSearchChange?: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  value,
  onSearchChange,
}) => {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-4 border border-gray-200">
      <Image
        source={SearchIcon}
        resizeMode="contain"
        className="w-5 h-5 mr-3"
      />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.text_placeholder}
        className="flex-1 text-base font-inter text-gray-800"
        value={value}
        onChangeText={onSearchChange}
      />
    </View>
  );
};

export default SearchBar;
