import AppLayout from "@/components/Layouts/AppLayout";
import { useProjects } from "@/core/hooks/useProjects";

import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Layers, MessageSquare } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function getStatusConfig(status: string | null | undefined) {
  const normalized = status?.toLowerCase();
  switch (normalized) {
    case "in_progress":
    case "in progress":
      return {
        dot: "bg-blue-400",
        label: "In Progress",
        labelColor: "text-blue-500",
        pillBg: "bg-blue-50",
      };
    case "completed":
      return {
        dot: "bg-green-400",
        label: "Completed",
        labelColor: "text-green-600",
        pillBg: "bg-green-50",
      };
    case "pending":
      return {
        dot: "bg-amber-400",
        label: "Pending",
        labelColor: "text-amber-500",
        pillBg: "bg-amber-50",
      };
    case "cancelled":
    case "canceled":
      return {
        dot: "bg-red-400",
        label: "Cancelled",
        labelColor: "text-red-500",
        pillBg: "bg-red-50",
      };
    default:
      return {
        dot: "bg-gray-400",
        label: status || "Unknown",
        labelColor: "text-gray-500",
        pillBg: "bg-gray-50",
      };
  }
}

function formatBudget(project: any) {
  if (!project) return "Not specified";
  const { budgetMinimum, budgetMaximum, currency = "NGN" } = project;
  if (!budgetMinimum || !budgetMaximum) return "Not specified";
  return `${currency} ${budgetMinimum.toLocaleString()} – ${budgetMaximum.toLocaleString()}`;
}

function formatDuration(project: any) {
  if (!project) return "Not specified";
  const { durationMinimum, durationMaximum } = project;
  if (!durationMinimum || !durationMaximum) return "Not specified";
  return `${durationMinimum} – ${durationMaximum} months`;
}

function formatStartedDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ActionCard({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-2xl mx-4 mb-3 px-4 py-4 flex-row items-center justify-between"
    >
      <View className="flex-row items-center gap-4">
        <View className={`${iconBg} rounded-xl p-3`}>{icon}</View>
        <View>
          <Text className="font-interbold text-gray-900 text-base">
            {title}
          </Text>
          <Text className="font-inter text-gray-400 text-xs mt-0.5">
            {subtitle}
          </Text>
        </View>
      </View>
      <ChevronRight size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2">
      <Text className="font-inter text-gray-500">{label}</Text>
      <Text className="font-interbold text-sm" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function StartWork() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { getSingleProjectQuery } = useProjects();
  const { data, isLoading, error } = getSingleProjectQuery(projectId);
  const project = data?.data?.data || data?.data || {};

  const goToMilestones = () => {
    router.push({
      pathname: "/share/milestone",
      params: { projectId, currency: project?.currency },
    });
  };

  const goToChat = () => {
    router.push({ pathname: "/share/chat", params: { projectId } });
  };

  if (isLoading) {
    return (
      <AppLayout screenName="Project Dashboard">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600">Loading project...</Text>
        </View>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout screenName="Project Dashboard">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center">
            Could not load project. Please try again.
          </Text>
        </View>
      </AppLayout>
    );
  }

  const statusConfig = getStatusConfig(project?.status);
  const startedDate = formatStartedDate(project?.startedAt);
  const totalMilestones = project?.progress?.totalMilestones || 0;
  const completedMilestones = project?.progress?.completedMilestones || 0;
  const progressPercent = project?.progress?.progressPercentage || 0;

  return (
    <AppLayout screenName="Project Dashboard">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="font-interbold text-xl flex-1 mr-3"
              numberOfLines={2}
            >
              {project?.name || "—"}
            </Text>
            <View
              className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.pillBg}`}
            >
              <View className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
              <Text
                className={`font-interbold text-xs ${statusConfig.labelColor}`}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>
          {startedDate && (
            <Text className="text-gray-400 text-sm">Started {startedDate}</Text>
          )}
        </View>

        <View className="mx-4 mt-4 bg-white rounded-xl p-4">
          <Text
            className="font-inter text-gray-600 leading-5"
            numberOfLines={4}
          >
            {project?.description || "No description available"}
          </Text>
          <View className="h-px bg-gray-100 my-3" />
          <DetailRow label="Budget" value={formatBudget(project)} />
          <DetailRow label="Timeline" value={formatDuration(project)} />
        </View>

        <View className="mx-4 mt-4 bg-white rounded-xl p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-interbold text-base">Progress</Text>
            <Text className="font-interbold text-blue-600">
              {progressPercent}%
            </Text>
          </View>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-2 bg-blue-600 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
          <Text className="text-gray-400 text-xs mt-2">
            {completedMilestones}/{totalMilestones} milestones ·{" "}
            {completedMilestones} completed
          </Text>
        </View>

        <View className="mt-6">
          <Text className="font-interbold text-lg px-4 mb-3">Actions</Text>
          <ActionCard
            icon={<Layers size={20} color="#2463EB" />}
            iconBg="bg-blue-50"
            title="View Milestones"
            subtitle="Track project milestones"
            onPress={goToMilestones}
          />
          <ActionCard
            icon={<MessageSquare size={20} color="#16a34a" />}
            iconBg="bg-green-50"
            title="Chat"
            subtitle="Message your contractor"
            onPress={goToChat}
          />
        </View>
      </ScrollView>
    </AppLayout>
  );
}
