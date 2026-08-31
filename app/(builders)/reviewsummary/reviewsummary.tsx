import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import GradientButton from "@/components/Buttons/GradientButton";
import AppLayout from "@/components/Layouts/AppLayout";
import { useBids } from "@/core/hooks/UseBids";

function formatSentAt(dateInput: string) {
  const date = new Date(dateInput);
  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;

  if (!sameDay) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${hours}:${minutes}${ampm}`;
  }
  return `Today, ${hours}:${minutes}${ampm}`;
}

function getInitials(name: string) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length !== 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function getStatusStyle(status: string) {
  switch (status) {
    case "pending":
      return { bg: "#fef9c3", text: "#854d0e", border: "#fde68a" };
    case "revision_requested":
      return { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" };
    case "accepted":
      return { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" };
    case "rejected":
      return { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" };
    default:
      return { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };
  }
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getRoleLabel(role: string, isStatic: boolean) {
  if (isStatic) return "Initial Bid";
  return role === "client" ? "Counter Offer" : "Revision Request";
}

function ThreadConnector() {
  return (
    <View style={{ alignItems: "center", paddingVertical: 2 }}>
      <View style={{ width: 1, height: 10, backgroundColor: "#cbd5e1" }} />
      <Ionicons name="chevron-down" size={12} color="#94a3b8" />
    </View>
  );
}

type ThreadEntry = {
  role: string;
  name?: string;
  isStatic?: boolean;
  sentAt: string;
  message: string;
};

function EntryCard({ item }: { item: ThreadEntry }) {
  const isClient = item.role === "client";
  const accentColor = isClient ? "#1d4ed8" : "#93c5fd";
  const avatarBg = isClient ? "#1d4ed8" : "#eff6ff";
  const avatarText = isClient ? "#ffffff" : "#1d4ed8";
  const avatarBorder = isClient ? "#1e40af" : "#bfdbfe";
  const displayName = item.name || (isClient ? "Client" : "Builder");

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderLeftWidth: 3,
        borderLeftColor: accentColor,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingVertical: 10,
          backgroundColor: "#f8fafc",
          borderBottomWidth: 1,
          borderBottomColor: "#f1f5f9",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: avatarBg,
              borderWidth: 1,
              borderColor: avatarBorder,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Inter_600SemiBold",
                color: avatarText,
              }}
            >
              {getInitials(item.name || displayName)}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_600SemiBold",
                color: "#0f172a",
              }}
            >
              {displayName}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Inter_400Regular",
                color: "#64748b",
              }}
            >
              {getRoleLabel(item.role, !!item.isStatic)} ·{" "}
              {formatSentAt(item.sentAt)}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: "#1e293b",
            lineHeight: 22,
          }}
        >
          {item.message}
        </Text>
      </View>
    </View>
  );
}

export default function ReviewSummaryScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { bidId, companyName, projectTitle, projectId } = useLocalSearchParams<{
    bidId: string;
    companyName: string;
    projectTitle: string;
    projectId: string;
  }>();

  const { bidRevisionSummary, submitBidMutation } = useBids();
  const { data, isLoading, error } = bidRevisionSummary(bidId);

  const messages: ThreadEntry[] = data?.data?.data?.messages || [];
  const status = data?.data?.data?.status || "";

  // ── Helpers from first file ──────────────────────────────────────────────
  const showError = (message: string) => {
    Toast.show({ type: "error", text1: "Error", text2: message });
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onSendReviewSummary = () => {
    router.push({
      pathname: "/(builders)/revisionscreen/revisionscreen",
      params: { bidId, companyName, projectTitle, projectId },
    });
  };

  const onContentSizeChange = () => {
    scrollRef.current?.scrollToEnd({ animated: false });
  };

  const statusStyle = getStatusStyle(status);

  // ── Loading State ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppLayout screenName={projectTitle || "Review Summary"}>
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600 font-inter">
            Loading conversation…
          </Text>
        </View>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout screenName={projectTitle || "Review Summary"}>
        <View className="flex-1 items-center justify-center py-20 px-4">
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          <Text className="mt-4 text-red-500 font-inter text-center">
            Failed to load messages. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-inter">Go Back</Text>
          </TouchableOpacity>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout screenName={projectTitle || "Review Summary"}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="bg-white border-b border-gray-200 px-5 py-3.5 gap-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-xs font-inter text-gray-400 mb-0.5">
                  Project
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-base font-interbold text-gray-900"
                >
                  {projectTitle || "Untitled Project"}
                </Text>
              </View>
              <View
                style={{ backgroundColor: statusStyle.bg }}
                className="px-2.5 py-1 rounded"
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                    color: statusStyle.text,
                  }}
                >
                  {formatStatusLabel(status)}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="business-outline" size={14} color="#94a3b8" />
              <Text className="font-inter text-sm text-gray-500">
                {companyName}
              </Text>
            </View>
          </View>

          {/* Messages */}
          {messages.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="chatbubble-outline" size={40} color="#cbd5e1" />
              <Text className="mt-2 text-gray-400 font-inter text-sm">
                No messages yet.
              </Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={onContentSizeChange}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 24,
              }}
            >
              {messages.map((item, index) => (
                <View key={index}>
                  <EntryCard item={item} />
                  {index < messages.length - 1 && <ThreadConnector />}
                </View>
              ))}
            </ScrollView>
          )}

          <View className="px-5 pt-4 pb-6 border-t border-gray-200 bg-white">
            <GradientButton
              title="Send Review Summary"
              onPress={onSendReviewSummary}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}
