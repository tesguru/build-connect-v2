import "../ReactotronConfig";
import FontLayout from "@/components/Layouts/FontLayout";
import createToastConfig from "@/components/Notifications/Toast";
import SessionManager from "@/components/Session/SessionManager";
import { enforceIdleTimeoutOnStartup } from "@/core/services/session/sessionManager";
import { onSessionEnded } from "@/core/services/session/sessionEvents";
import { handleApiError } from "@/core/utils/handleapierror";
import { useAuthStore } from "@/store/Authstore";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../ReactotronConfig";
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Never retry client errors (401/403/404/422); retry transient failures twice.
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        if (typeof status === "number" && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: { retry: 0 },
  },
  // Safety net: even a screen that forgets error handling still reports failures.
  queryCache: new QueryCache({
    onError: (error) => handleApiError(error, "Loading data"),
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      // Mutation-level onError runs after this; give it a tick to report
      // with its own context and mark the error as handled.
      setTimeout(() => handleApiError(error, "Request"), 0);
    },
  }),
});

const toastConfig = createToastConfig({
  titleFont: "Inter_700Bold",
  subtitleFont: "Inter_500Medium",
});

function RootLayoutNav() {
  const { isLogin, loadAuthData } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Any session end (idle, refresh failure, manual) clears cached server data.
  // Navigation waits until the navigator has mounted, so a cold-start logout
  // does not try to route from the loading screen.
  useEffect(() => {
    return onSessionEnded(() => {
      queryClient.clear();
      setSessionEnded(true);
    });
  }, [queryClient]);

  useEffect(() => {
    if (loading || !sessionEnded) return;
    setSessionEnded(false);
    router.replace("/sign_in/signin");
  }, [loading, sessionEnded, router]);

  // Load auth state on app start, then enforce the idle timeout.
  useEffect(() => {
    const loadAuth = async () => {
      await loadAuthData();
      await enforceIdleTimeoutOnStartup();
      await new Promise((res) => setTimeout(res, 200));
      setLoading(false);
    };
    loadAuth();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inProtectedArea =
      segments[0] === "(tab)" ||
      segments[0] === "(builders)" ||
      segments[0] === "(clients)" ||
      segments[0] === "(profile)";

    if (!isLogin && inProtectedArea) {
      router.replace("/");
    } else if (isLogin && (segments as string[]).length === 0) {
      router.replace("/(tab)");
    }
  }, [isLogin, segments, loading]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FCFCFD",
        }}
      >
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Onboarding has no safe area insets; every other screen keeps them.
  // Same component is always rendered, only `edges` changes, so the Stack never remounts.
  const inOnboarding = segments[0] === "(onboarding)";

  return (
    <SafeAreaView
      edges={inOnboarding ? [] : ["top", "right", "bottom", "left"]}
      style={{ flex: 1, backgroundColor: "#FCFCFD" }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tab)" />
        <Stack.Screen name="(builders)" />
        <Stack.Screen name="(clients)" />
        <Stack.Screen name="(profile)" />
      </Stack>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <QueryClientProvider client={queryClient}>
        <FontLayout>
          <StatusBar
            style="dark"
            backgroundColor="#FCFCFD"
            translucent={Platform.OS === "android"}
          />

          <SessionManager>
            <RootLayoutNav />
          </SessionManager>

          <Toast config={toastConfig} />
        </FontLayout>
      </QueryClientProvider>
    </KeyboardProvider>
  );
}

/** Expo Router renders this instead of a red screen if a route throws. */
export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => Promise<void>;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        backgroundColor: "#FCFCFD",
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 18,
          color: "#111827",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Something went wrong
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 14,
          color: "#6B7280",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        {error?.message || "The screen could not be loaded. Please try again."}
      </Text>
      <Pressable
        onPress={() => retry()}
        style={{
          backgroundColor: "#007bff",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text
          style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 }}
        >
          Try Again
        </Text>
      </Pressable>
    </View>
  );
}
