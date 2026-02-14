import SearchBarWithFilter from '@/components/PagesComponent/Dashboard/Shared/SearchBarWithFilter';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import AppLayout from '@/components/Layouts/AppLayout';
import EmptyScreenComponent from '@/components/Miscallaneous/EmptyScreenComponent';
import { useProjects } from '@/core/hooks/useProjects';
import type { MarketplaceProperty } from '@/core/types/api';
import ClientPropertiesComponent from './ClientPropertiesComponent';
import { useRouter } from 'expo-router';

const ClientPropertiesScreen = () => {
  const router = useRouter(); // Replace useNavigation with useRouter
  const { projectsMarketPlaceQuery } = useProjects();

  const {
    data: apiResponse,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = projectsMarketPlaceQuery({});

  const propertiesList: MarketplaceProperty[] =
    apiResponse?.data?.data?.properties ??
    apiResponse?.data?.data?.items ??
    apiResponse?.data?.properties ??
    apiResponse?.data?.items ??
    (Array.isArray(apiResponse?.data?.data) ? apiResponse.data.data : []);

  const handleNavigation = () => {
    // Use router.replace for replace navigation
    router.replace('/createproperty/createproperty'); // Adjust path based on your file structure
    // If you want push instead: router.push('/create-property');
  };

  const handleFilterPress = () => {
    // Navigate to PropertyFilter screen
    router.push('/'); // Adjust path based on your file structure
  };

  return (
    <AppLayout screenName="Properties" fullHeightContent>
      <View className="flex-1">
        <View className="pt-3">
          <SearchBarWithFilter
            placeholder="Search properties..."
            onFilterPress={handleFilterPress} // Use the new handler
          />
        </View>

        <View className="pt-4 flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#2463EB" />
            <Text className="text-gray-500 font-inter mt-3">Loading properties...</Text>
          </View>
        ) : isError ? (
          <View className="flex-1 justify-center items-center py-20 px-4">
            <Text className="text-gray-700 font-inter text-center">
              Unable to load properties. Pull down to retry.
            </Text>
          </View>
        ) : propertiesList.length === 0 ? (
          <EmptyScreenComponent message="No properties in the marketplace yet" />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
            }
          >
            {propertiesList.map((property, index) => (
              <ClientPropertiesComponent
                key={property?.id ?? `property-${index}`}
                property={property}
              />
            ))}
          </ScrollView>
        )}
        </View>

        <TouchableOpacity
          onPress={handleNavigation}
          activeOpacity={0.9}
          className="absolute right-5 bottom-6 bg-blue-600 flex-row items-center justify-center rounded-full px-5 py-4 shadow-lg"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <Text className="text-white text-2xl font-bold">+</Text>
          <Text className="text-white font-work-sans text-base ml-2">
            Add Property
          </Text>
        </TouchableOpacity>
      </View>
    </AppLayout>
  );
};

export default ClientPropertiesScreen;