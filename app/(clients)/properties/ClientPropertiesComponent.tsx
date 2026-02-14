import { BathroomIcon, BedrooomIcon, LocationIcon, SquareMeter } from '@/constants/icon';
import { SampleImage } from '@/constants/image';
import type { MarketplaceProperty } from '@/core/types/api';
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

const NOT_AVAILABLE = 'Not available';

function formatPrice(value: number | string | undefined): string {
  if (value === undefined || value === null) return NOT_AVAILABLE;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return NOT_AVAILABLE;
  return `₦${num.toLocaleString()}`;
}

function getPropertyTypeLabel(propertyType: MarketplaceProperty['propertyType']): string {
  if (!propertyType) return NOT_AVAILABLE;
  if (typeof propertyType === 'string') return propertyType;
  return propertyType?.label ?? propertyType?.value ?? NOT_AVAILABLE;
}

interface ClientPropertiesComponentProps {
  property: MarketplaceProperty;
}

export default function ClientPropertiesComponent({ property }: ClientPropertiesComponentProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const title = property?.title ?? NOT_AVAILABLE;
  const price = formatPrice(property?.price ?? property?.amount);
  const location = property?.location ?? NOT_AVAILABLE;
  const propertyType = getPropertyTypeLabel(property?.propertyType);
  const bedroomsText =
    property?.bedrooms != null ? `${property.bedrooms} beds` : NOT_AVAILABLE;
  const bathroomsText =
    property?.bathrooms != null ? `${property.bathrooms} baths` : NOT_AVAILABLE;
  const areaText =
    property?.area != null ? `${String(property.area)} sqm` : NOT_AVAILABLE;
  const imageUri =
    property?.image ??
    (Array.isArray(property?.images) && property.images[0] ? property.images[0] : null);

  return (
    <View className="px-4 mb-4">
      <View className="bg-white p-2 rounded-3xl overflow-hidden shadow-lg w-full">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="w-full rounded-xl"
            style={{ height: 200 }}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={SampleImage}
            className="w-full rounded-xl"
            style={{ height: 200 }}
            resizeMode="cover"
          />
        )}

        <View className="absolute top-6 left-6 bg-gray-900 px-5 py-2.5 rounded-xl">
          <Text className="text-white font-inter text-base font-semibold tracking-wide">
            {propertyType}
          </Text>
        </View>

        <TouchableOpacity
          className="absolute top-5 right-6"
          onPress={() => setIsFavorite(!isFavorite)}
          activeOpacity={0.7}
        >
          <View
            className={`w-12 h-12 rounded-full justify-center items-center shadow-md ${
              isFavorite ? 'bg-red-50' : 'bg-white/95'
            }`}
          >
            <Text className="text-3xl">
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </View>
        </TouchableOpacity>

        <View className="pt-4 p-2">
          <View className="flex-row justify-between ">
            <Text className="font-interbold text-xl flex-1" numberOfLines={1}>
              {title}
            </Text>
            <Text className="font-interbold text-xl ml-2">
              {price}
            </Text>
          </View>

          <View className="flex-row gap-2 py-4 items-start">
            <Image
              source={LocationIcon}
              style={{ width: 15, height: 15, marginTop: 2 }}
              resizeMode="contain"
            />
            <Text className="font-inter flex-1" numberOfLines={2}>
              {location}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <View className="bg-gray-200 gap-2 p-3 w-20 rounded-3xl flex-row items-end ">
              <Image className="w-4 h-4" source={BedrooomIcon} />
              <Text className="text-xs font-inter">{bedroomsText}</Text>
            </View>
            <View className="bg-gray-200 gap-2 p-3 w-20 rounded-3xl flex-row items-end ">
              <Image className="w-4 h-4" source={BathroomIcon} />
              <Text className="text-xs font-inter">{bathroomsText}</Text>
            </View>
            <View className="bg-gray-200 gap-2 p-3 w-22 rounded-3xl flex-row items-end ">
              <Image className="w-4 h-4" source={SquareMeter} />
              <Text className="text-xs font-inter">{areaText}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}