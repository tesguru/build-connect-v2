import PropertiesComponent from '@/components/Cards/PropertiesComponent';
import AppLayout from '@/components/Layouts/AppLayout';
import EmptyScreenComponent from '@/components/Miscallaneous/EmptyScreenComponent';
import { useProperty } from '@/core/hooks/useProperty';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';

type PropertyMedia = {
  id: string;
  fileName: string;
  mimeType: string;
  publicUrl: string;
};

type Property = {
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

const PropertiesScreen = () => {
  const router = useRouter();

  const { myProperty } = useProperty();

  const {
    data: apiResponse,
    isLoading,
    error,
  } = myProperty();

  const propertyList: Property[] = apiResponse?.data?.data?.properties || [];

  const handleCreateProperty = () => {
    router.push('/createproperty/createproperty');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600 font-inter">Loading properties...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center mb-4 font-inter">
            Error loading properties. Please try again.
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-lg"
            onPress={() => {}}
          >
            <Text className="text-white font-inter font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (propertyList.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20 px-4">
          <EmptyScreenComponent
            title="No Properties Found"
            description="You haven't created any properties yet"
            buttonText="Add Your First Property"
            onButtonPress={handleCreateProperty}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={propertyList}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, gap: 16, paddingTop: 8 }}
        renderItem={({ item }) => (
          <PropertiesComponent
            title={item.title}
            status={item.status}
            address={item.location}
            price={item.price}
            onView={() =>
              router.push({
                pathname: '/properties/propertiesdetails',
                params: { id: item.id },
              })
            }
            onEdit={() =>
              router.push({
                pathname: '/createproperty/updateproperty',
                params: { id: item.id },
              })
            }
          />
        )}
      />
    );
  };

  return (
    <AppLayout screenName="Properties" fullHeightContent>
      <View className="flex-1 mt-4">

        {/* Content */}
        {renderContent()}

        {/* FAB — always visible above everything */}
        <TouchableOpacity
          onPress={handleCreateProperty}
          activeOpacity={0.9}
          className="absolute right-5 bottom-6 bg-blue-600 flex-row items-center justify-center rounded-full px-5 py-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8,
            zIndex: 999,
          }}
        >
          <Text className="text-white font-inter text-base font-medium">
            + Create Property
          </Text>
        </TouchableOpacity>

      </View>
    </AppLayout>
  );
};

export default PropertiesScreen;