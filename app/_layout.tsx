import "../global.css";
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from "expo-status-bar";
import { Platform, View, ActivityIndicator } from "react-native";
import Toast from 'react-native-toast-message';
import createToastConfig from "@/components/Notifications/Toast";
import FontLayout from "@/components/Layouts/FontLayout";
import React, { useEffect, useState } from "react";
import { useAuthStore } from '@/store/Authstore';

const queryClient = new QueryClient();

const toastConfig = createToastConfig({
  titleFont: 'Inter_700Bold',
  subtitleFont: 'Inter_500Medium',
});

function RootLayoutNav() {
  const { isLogin, loadAuthData } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Load auth state on app start
  useEffect(() => {
    const loadAuth = async () => {
      await loadAuthData();
      await new Promise((res) => setTimeout(res, 200));
      setLoading(false);
    };
    loadAuth();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)' || segments[0] === '(onboarding)';
    const inProtectedArea = segments[0] === '(tab)' || segments[0] === '(builders)' || segments[0] === '(clients)' || segments[0] === '(profile)';

    if (!isLogin && inProtectedArea) {
   
      router.replace('/');
    } else if (isLogin && segments.length === 0) {

      router.replace('/(tab)');
    }
  }, [isLogin, segments, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FCFCFD' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(builders)" />
      <Stack.Screen name="(clients)" />
      <Stack.Screen name="(profile)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFCFD' }}>
      <QueryClientProvider client={queryClient}>
        <FontLayout>
          <StatusBar
            style="dark"
            backgroundColor="#FCFCFD"
            translucent={Platform.OS === 'android'}
          />
          
          <RootLayoutNav />
          
          <Toast config={toastConfig} />
        </FontLayout>
      </QueryClientProvider>
    </SafeAreaView>
  );
}