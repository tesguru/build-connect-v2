import Search from '@/components/Forms/Search';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { PROJECTS } from '@/core/utils/data';
import AppLayout from '@/components/Layouts/AppLayout';

const PropertiesScreen = () => {
  const router = useRouter();
  
  const handleNavigation = () => {
    router.replace("/projects/projects");
  };

  return (
    <AppLayout screenName="Properties">
      <View className="pt-3">
        <Search />
      </View>

      <View className="pt-12">
        {/* {PROJECTS.length > 0 ? (
          <PropertiesComponent/>
        ) : (
          <EmptyScreenComponent/>
        )} */}

        <View className="flex-row justify-end mr-3 mt-4">
          <TouchableOpacity 
            onPress={handleNavigation} 
            className="bg-blue-600 w-40 flex-row items-center px-6 py-3 rounded-full"
          >
            <Text className="text-white text-2xl">+</Text>
            <Text className="text-white font-work-sans text-base ml-2">
              Add Property
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppLayout>
  );
};

export default PropertiesScreen;