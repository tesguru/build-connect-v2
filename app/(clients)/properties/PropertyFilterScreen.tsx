import { arrowleft, SearchIcon } from "@/constants/icon";
import { useLocalSearchParams, useRouter } from "expo-router"; // Add Expo Router imports
import { Star } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PROPERTY_TYPES = ["All", "Duplex", "Apartment", "Bungalow"];
const BED_ROOMS = ["1", "2", "3", "4", "5+"];
const STAR_RANGES = [5, 4, 3, 2, 1];

const PropertyFilterScreen = () => {
  const router = useRouter(); // Replace navigation prop with router
  const params = useLocalSearchParams(); // Get params if needed

  const [propertyType, setPropertyType] = useState("All");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedRooms, setBedRooms] = useState("4");
  const [starRange, setStarRange] = useState(5);

  const handleBack = () => {
    // Go back or navigate to dashboard
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(dashboard)"); // Adjust based on your structure
      // Or router.push('/(tabs)/dashboard');
    }
  };

  const handleReset = () => {
    setPropertyType("All");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setBedRooms("4");
    setStarRange(5);
  };

  const handleShowProperties = () => {
    // Create filter object to pass back
    const filters = {
      propertyType,
      location,
      minPrice: minPrice ? parseInt(minPrice.replace(/\D/g, "")) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice.replace(/\D/g, "")) : undefined,
      bedRooms,
      starRange,
    };

    // Method 1: Navigate back with params
    if (router.canGoBack()) {
      router.back(); // This will go back to previous screen
      // You might want to use global state or context for the filters
    } else {
      // Method 2: Navigate to properties screen with params
      router.push({
        pathname: "/(dashboard)/properties",
        params: filters,
      });
    }
  };

  const formatPriceDisplay = (value: string) => {
    if (!value) return "";
    const num = value.replace(/\D/g, "");
    if (!num) return "";
    return "#" + num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="p-2 -ml-2"
        >
          <Image
            source={arrowleft}
            resizeMode="contain"
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
        <Text className="font-inter text-xl font-bold text-gray-900">
          Filter
        </Text>
        <TouchableOpacity
          onPress={handleReset}
          activeOpacity={0.6}
          className="px-4 py-2.5 rounded-2xl"
          style={{ backgroundColor: "rgba(36, 99, 235, 0.2)" }}
        >
          <Text
            className="font-inter font-semibold text-sm"
            style={{ color: "#2463EB" }}
          >
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Property Types */}
        <View className="px-4 pt-6">
          <Text className="font-inter font-semibold text-gray-800 text-base mb-3">
            Property Types
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2"
          >
            {PROPERTY_TYPES.map((type) => {
              const selected = propertyType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setPropertyType(type)}
                  activeOpacity={0.7}
                  className={`px-5 py-3 rounded-full border ${
                    selected
                      ? "bg-[#2463EB] border-[#2463EB]"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`font-inter font-medium text-sm ${
                      selected ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Preferred Location */}
        <View className="px-4 pt-6">
          <Text className="font-inter font-semibold text-gray-800 text-base mb-3">
            Preferred Location
          </Text>
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3.5 border border-gray-200">
            <Image
              source={SearchIcon}
              resizeMode="contain"
              className="w-5 h-5 mr-3"
            />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="e.g Victoria Island..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-base font-inter text-gray-800"
            />
          </View>
        </View>

        {/* Price Range */}
        <View className="px-4 pt-6">
          <Text className="font-inter font-semibold text-gray-800 text-base mb-3">
            Price Range
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <Text className="text-gray-400 text-xs font-inter px-3 pt-2">
                Min
              </Text>
              <TextInput
                value={formatPriceDisplay(minPrice)}
                onChangeText={(t) => setMinPrice(t.replace(/\D/g, ""))}
                placeholder="#80,000,000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                className="px-3 pb-3 text-base font-inter text-gray-800"
              />
            </View>
            <View className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <Text className="text-gray-400 text-xs font-inter px-3 pt-2">
                Max
              </Text>
              <TextInput
                value={formatPriceDisplay(maxPrice)}
                onChangeText={(t) => setMaxPrice(t.replace(/\D/g, ""))}
                placeholder="#120,000,000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                className="px-3 pb-3 text-base font-inter text-gray-800"
              />
            </View>
          </View>
        </View>

        {/* Bed Rooms */}
        <View className="px-4 pt-6">
          <Text className="font-inter font-semibold text-gray-800 text-base mb-3">
            Bed Rooms
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2"
          >
            {BED_ROOMS.map((num) => {
              const selected = bedRooms === num;
              return (
                <TouchableOpacity
                  key={num}
                  onPress={() => setBedRooms(num)}
                  activeOpacity={0.7}
                  className={`px-5 py-3.5 rounded-full border min-w-[52px] items-center ${
                    selected
                      ? "bg-[#2463EB] border-[#2463EB]"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`font-inter font-medium text-sm ${
                      selected ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Star Range */}
        <View className="px-4 pt-6">
          <Text className="font-inter font-semibold text-gray-800 text-base mb-3">
            Star Range
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2"
          >
            {STAR_RANGES.map((stars) => {
              const selected = starRange === stars;
              return (
                <TouchableOpacity
                  key={stars}
                  onPress={() => setStarRange(stars)}
                  activeOpacity={0.7}
                  className={`flex-row items-center gap-1 px-4 py-3.5 rounded-full border ${
                    selected
                      ? "bg-[#2463EB] border-[#2463EB]"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Star
                    size={16}
                    fill={selected ? "#fff" : "#EAB308"}
                    color={selected ? "#fff" : "#EAB308"}
                  />
                  <Text
                    className={`font-inter font-medium text-sm ${
                      selected ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {stars}★
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Show Properties Button */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-white">
        <TouchableOpacity
          onPress={handleShowProperties}
          activeOpacity={0.8}
          className="bg-[#2463EB] rounded-full border py-4 items-center justify-center"
        >
          <Text className="font-inter font-semibold text-white text-base">
            Show Properties
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PropertyFilterScreen;
