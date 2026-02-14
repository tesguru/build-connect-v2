import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import InfoCard from '@/components/Cards/InfoCard';
import SearchBarWithFilter from '@/components/PagesComponent/Dashboard/Shared/SearchBarWithFilter';
import DashboardHeader from '@/components/PagesComponent/Dashboard/Shared/DashboardHeader';
import { AddCircle, Code, Dollar } from '@/constants/icon';
import { useAuthStore } from '@/store/Authstore';
import MyProperties from '@/components/PagesComponent/Dashboard/Builders/HomeComponents/Properties';

import AvailableProjects from '@/components/PagesComponent/Dashboard/Builders/HomeComponents/AvailableProjects';
import Bids from '@/components/PagesComponent/Dashboard/Client/ProjectsComponent/Bids';
import MyBids from '@/components/PagesComponent/Dashboard/Builders/HomeComponents/MyBids';

const Home = () => {
  const router = useRouter();
  const { clearAuthData, user } = useAuthStore();
  const firstName = user?.firstName || "Builder";

  const handleNotification = () => {
    router.push("/notification/notification");
  };

  const handleNavigation = () => {
    router.replace("/builders/createproperty/createproperty");
  };

  const handleLogout = () => {
    clearAuthData();
  };

  return (
    <View className="flex-1">
 
      <DashboardHeader
        userName={firstName}
        showDropdown={false}
        onNotificationPress={handleNotification}
        onProfilePress={() => router.push("/profilescreen")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
    
        <SearchBarWithFilter
          placeholder="Search..."
          onFilterPress={() => {}}
        />

     
        <View className="bg-dashboard mt-8 mx-2 rounded-xl pt-6 px-4 pb-4">
          <Text className="font-worksanssemibold text-white text-3xl">
            Welcome Back!
          </Text>
          <Text className="text-white font-work-sans">
            Let's start the day with you.
          </Text>

          <View className="flex-row items-center mt-4 gap-2">
            <View className="flex-1">
              <InfoCard
                icon={AddCircle}
                title="Find Projects"
                subtitle="Browse new projects"
                onPress={() => router.push("/findprojects/findprojects")}
              />
            </View>
            <View className="flex-1">
              <InfoCard
                icon={Code}
                title="My Projects"
                subtitle="Manage active work"
                onPress={() => router.push("/myprojects/myprojects")}
              />
            </View>
          </View>

          <View className="flex-row items-center mt-4 gap-2">
            <View className="flex-1">
              <InfoCard
                icon={Dollar}
                title="My Wallet"
                subtitle="Track your income"
                onPress={() => {}}
              />
            </View>
            <View className="flex-1">
              <InfoCard
                icon={Code}
                title="Portfolio"
                subtitle="Showcase your work"
                onPress={() => {}}
              />
            </View>
          </View>
        </View>

        <View className="pt-2">
          <AvailableProjects />
        </View>
        <View className="pt-2">
          <MyBids />
        </View>
        <View className="pt-2">
          <MyProperties />
        </View>
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
      </ScrollView>
    </View>
  );
};

export default Home;