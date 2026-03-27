import AppLayout from '@/components/Layouts/AppLayout';
import { useProperty } from '@/core/hooks/useProperty';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const GALLERY_SIZE = (width - 48) / 3;

type PropertyMedia = {
  id: string;
  fileName: string;
  mimeType: string;
  publicUrl: string;
};

type PropertyDetail = {
  id: string;
  title: string;
  price: number;
  status: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  description: string;
  keyFeatures: string[];
  propertyType: { id: string; label: string; value: string };
  builder: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
  };
  media: PropertyMedia[];
  createdAt: string;
  updatedAt: string;
};

const PropertyDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isFavourited, setIsFavourited] = useState(false);
  const [showAllGallery, setShowAllGallery] = useState(false);

  const {  singleProperty} = useProperty();

  const {
    data: apiResponse,
    isLoading,
    error,
  } = singleProperty(id);

  const property: PropertyDetail | null = apiResponse?.data?.data || null;

  const GALLERY_LIMIT = 3;
  const visibleMedia = showAllGallery
    ? property?.media || []
    : (property?.media || []).slice(0, GALLERY_LIMIT);
  const extraCount = (property?.media?.length || 0) - GALLERY_LIMIT;

  if (isLoading) {
    return (
      <AppLayout screenName="Property Details">
        <View className="flex-1 justify-center items-center py-40">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-500 font-inter">Loading property...</Text>
        </View>
      </AppLayout>
    );
  }

  if (error || !property) {
    return (
      <AppLayout screenName="Property Details">
        <View className="flex-1 justify-center items-center py-40 px-6">
          <Text className="text-red-500 text-center font-inter">
            Failed to load property details. Please try again.
          </Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout screenName="Property Details">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero Image */}
        <View className="mx-4 mt-4 rounded-3xl overflow-hidden" style={{ height: 220 }}>
          {property.media?.[0]?.publicUrl ? (
            <Image
              source={{ uri: property.media[0].publicUrl }}
              style={{ width: '100%', height: 220 }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 bg-gray-200 justify-center items-center">
              <Ionicons name="image-outline" size={48} color="#9ca3af" />
            </View>
          )}

          {/* Status Badge */}
          <View
            className="absolute top-3 left-3 bg-gray-800 px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(31,41,55,0.85)' }}
          >
            <Text className="text-white font-inter text-xs capitalize">
              {property.propertyType?.label || property.status}
            </Text>
          </View>

          {/* Favourite Button */}
          <TouchableOpacity
            onPress={() => setIsFavourited(!isFavourited)}
            className="absolute top-3 right-3 bg-white rounded-full p-2"
            style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 }}
          >
            <Ionicons
              name={isFavourited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavourited ? '#ef4444' : '#374151'}
            />
          </TouchableOpacity>
        </View>

      
        <View className="mx-4 mt-4 flex-row justify-between items-start">
          <Text className="font-interbold text-xl flex-1 mr-2">{property.title}</Text>
          <Text className="font-interbold text-xl text-gray-900">
            ₦{property.price.toLocaleString()}
          </Text>
        </View>

   
        <View className="mx-4 mt-2 flex-row items-center gap-1">
          <Ionicons name="star" size={16} color="#f59e0b" />
          <Text className="font-inter text-sm text-gray-700">4.5 (87)</Text>
        </View>

     
        <View className="mx-4 mt-3 flex-row items-start gap-2">
          <Ionicons name="location-outline" size={18} color="#6b7280" style={{ marginTop: 1 }} />
          <Text className="font-inter text-sm text-gray-600 flex-1">{property.location}</Text>
        </View>

      
        <View className="mx-4 mt-4 flex-row gap-3">
          <View className="flex-row items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
            <Ionicons name="bed-outline" size={16} color="#374151" />
            <Text className="font-inter text-sm text-gray-700">{property.bedrooms} beds</Text>
          </View>
          <View className="flex-row items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
            <Ionicons name="water-outline" size={16} color="#374151" />
            <Text className="font-inter text-sm text-gray-700">{property.bathrooms} baths</Text>
          </View>
          <View className="flex-row items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
            <Ionicons name="layers-outline" size={16} color="#374151" />
            <Text className="font-inter text-sm text-gray-700">
              {property.propertyType?.label || '—'}
            </Text>
          </View>
        </View>

    
        <View className="mx-4 mt-6">
          <Text className="font-interbold text-lg mb-2">About Property</Text>
          <Text className="font-inter text-sm text-gray-600 leading-6">
            {property.description}
          </Text>
        </View>

      
        {property.keyFeatures?.length > 0 && (
          <View className="mx-4 mt-6">
            <Text className="font-interbold text-lg mb-3">Key Features</Text>
            <View className="flex-row flex-wrap gap-2">
              {property.keyFeatures.map((feature, index) => (
                <View
                  key={index}
                  className="flex-row items-center gap-1 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full"
                >
                  <Ionicons name="checkmark-circle" size={14} color="#2463EB" />
                  <Text className="font-inter text-sm text-blue-700 capitalize">{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

     
        {property.media?.length > 0 && (
          <View className="mx-4 mt-6">
            <Text className="font-interbold text-lg mb-3">Gallery</Text>
            <View className="flex-row flex-wrap gap-3">
              {visibleMedia.map((media, index) => (
                <View
                  key={media.id}
                  style={{ width: GALLERY_SIZE, height: GALLERY_SIZE }}
                  className="rounded-xl overflow-hidden"
                >
                  <Image
                    source={{ uri: media.publicUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                  {/* +N overlay on last visible if there are more */}
                  {!showAllGallery &&
                    index === GALLERY_LIMIT - 1 &&
                    extraCount > 0 && (
                      <TouchableOpacity
                        onPress={() => setShowAllGallery(true)}
                        className="absolute inset-0 justify-center items-center"
                        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                      >
                        <Text className="text-white font-interbold text-xl">+{extraCount}</Text>
                      </TouchableOpacity>
                    )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Builder Info */}
        {property.builder && (
          <View className="mx-4 mt-6 bg-gray-50 rounded-2xl p-4">
            <Text className="font-interbold text-lg mb-3">Listed By</Text>
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 bg-blue-100 rounded-full justify-center items-center">
                <Text className="font-interbold text-blue-600 text-lg">
                  {property.builder.firstName?.[0]}{property.builder.lastName?.[0]}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-interbold text-base">
                  {property.builder.firstName} {property.builder.lastName}
                </Text>
                <Text className="font-inter text-sm text-gray-500">
                  {property.builder.email}
                </Text>
              </View>
              <TouchableOpacity
                className="bg-blue-600 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-inter text-sm">Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </AppLayout>
  );
};

export default PropertyDetailsScreen;