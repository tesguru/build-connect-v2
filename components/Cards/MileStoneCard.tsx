import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

function getStatusConfig(status: string | null | undefined) {
  const normalized = status?.toLowerCase();
  switch (normalized) {
    case "completed":
      return {
        dotColor: "#16a34a",
        labelColor: "#16a34a",
        lineColor: "#86efac",
        icon: "checkmark-circle",
        iconColor: "#16a34a",
      };
    case "in_progress":
    case "in progress":
      return {
        dotColor: "#2463EB",
        labelColor: "#2463EB",
        lineColor: "#93c5fd",
        icon: "play-circle",
        iconColor: "#2463EB",
      };
    default:
      return {
        dotColor: "#f59e0b",
        labelColor: "#d97706",
        lineColor: "#e5e7eb",
        icon: null,
        iconColor: "#d1d5db",
      };
  }
}

type MilestoneCardProps = {
  milestoneName: string;
  dueDate: string;
  budget: string;
  status?: string;
  onPress?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
};

export default function MilestoneCard({
  milestoneName,
  dueDate,
  budget,
  status = "Pending",
  onPress,
  isFirst = false,
  isLast = false,
}: MilestoneCardProps) {
  const statusConfig = getStatusConfig(status);

  return (
    <View className="flex-row px-4 mb-0.5">
      <View className="items-center">
        <View
          style={{
            width: 2,
            height: 18,
            backgroundColor: isFirst ? "transparent" : statusConfig.lineColor,
          }}
        />
        {statusConfig.icon ? (
          <Ionicons
            name={statusConfig.icon as any}
            size={28}
            color={statusConfig.iconColor}
          />
        ) : (
          <View className="w-5 h-5 rounded-full border-2 border-gray-300 bg-gray-50" />
        )}
        <View
          style={{
            width: 2,
            flex: 1,
            minHeight: 24,
            backgroundColor: isLast ? "transparent" : statusConfig.lineColor,
          }}
        />
      </View>

      <View className="flex-1 bg-white rounded-2xl ml-3 mb-2.5 px-4 py-3.5 shadow-sm shadow-black/10 elevation-2">
        <View className="flex-row items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full self-start mb-2">
          <Ionicons name="flag-outline" size={12} color="#64748b" />
          <Text className="text-xs text-slate-500 font-inter">Milestone</Text>
        </View>

        <View className="flex-row items-center gap-1.5 mb-2">
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: statusConfig.dotColor,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              color: statusConfig.labelColor,
              fontWeight: "500",
            }}
          >
            {status}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text
            className="font-interbold text-base text-gray-900 flex-1 pr-2"
            numberOfLines={2}
          >
            {milestoneName}
          </Text>
          <Text className="font-interbold text-sm text-gray-700">{budget}</Text>
        </View>

        <View className="h-px bg-gray-100 mb-2.5" />

        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-gray-400 font-inter">{dueDate}</Text>
          <View className="items-end">
            <TouchableOpacity
              onPress={onPress}
              activeOpacity={0.8}
              className="bg-blue-600 rounded-full px-4 py-1.5"
            >
              <Text className="text-white text-sm font-intersemibold">
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
