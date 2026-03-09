import { Home, House, Question, Vector } from '@/constants/icon';
import { useAuthStore } from '@/store/Authstore';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';

const TabIcon = ({ focused, icon }: { focused: boolean; icon: any }) => (
  <View style={{ alignItems: "center", justifyContent: "center", height: 32 }}>
    {focused && (
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: "#007bff",
          marginBottom: 4,
        }}
      />
    )}
    <Image
      source={icon}
      style={{
        width: 20,
        height: 20,
        tintColor: focused ? "#007bff" : "#888",
      }}
      resizeMode="contain"
    />
  </View>
);

export default function TabLayout() {
  const { user } = useAuthStore();
  const isClient = user?.role === "client";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter_400Regular',
          marginTop: 4,
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 70,
          paddingBottom: 5,
          paddingTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Home} />,
          tabBarLabel: "Home",
        }}
      />

      <Tabs.Screen
        name="mybids"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Vector} />,
           tabBarLabel: isClient ? "Projects" : "My bids",
        }}
      />

      <Tabs.Screen
        name="properties"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={House} />,
          tabBarLabel: "Properties",
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Question} />,
          tabBarLabel: isClient ? "Support" : "Settings",
        }}
      />
    </Tabs>
  );
}