import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { SettingsIcon } from "@/constants/icon";
import SearchBar from "./SearchBar";

interface SearchBarWithFilterProps {
  placeholder?: string;
  value?: string;
  onSearchChange?: (text: string) => void;
  onFilterPress?: () => void;
}

const SearchBarWithFilter: React.FC<SearchBarWithFilterProps> = ({
  placeholder = "Search...",
  value,
  onSearchChange,
  onFilterPress,
}) => {
  return (
    <View className="flex-row items-center pt-5 gap-2 px-2">
      <View className="flex-1">
        <SearchBar
          placeholder={placeholder}
          value={value}
          onSearchChange={onSearchChange}
        />
      </View>
      <TouchableOpacity onPress={onFilterPress}>
        <View className="w-14 h-14 bg-gray-100 rounded-lg items-center justify-center border border-gray-200">
          <Image source={SettingsIcon} className="w-6 h-6" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SearchBarWithFilter;

