import ProjectTimeline from "@/components/Cards/ProjectTimeline";
import AppLayout from "@/components/Layouts/AppLayout";
import ProgressBar from "@/components/Miscallaneous/ProgressBar";
import { useProjects } from "@/core/hooks/useProjects";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ChevronRight, FileText, MapPin, Play } from "lucide-react-native";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

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
        labelColor: "text-green-500",
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

export default function ProjectDetails() {
  const route = useRoute<any>();
  const { projectId, contractId, bidId } = route.params;
  const router = useRouter();

  const { getSingleProjectQuery } = useProjects();
  const { data, isLoading, error } = getSingleProjectQuery(projectId);
  const project = data?.data?.data || data?.data || {};

  const { setCurrency } = useCurrencyStore();

  const viewContract = () => {
    router.push({
      pathname: "/(builders)/mybids/ProjectDetails/contractdetails",
      params: { bidId, contractId, projectId },
    });
  };

  const startWork = () => {
    router.push({
      pathname: "/share/startwork",
      params: { projectId, contractId, bidId },
    });
  };

  useEffect(() => {
    if (project?.currency) {
      setCurrency(project.currency);
    }
  }, [project?.currency, setCurrency]);

  if (isLoading) {
    return (
      <AppLayout screenName="Project Overview">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600 font-inter">
            Loading project details...
          </Text>
        </View>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout screenName="Project Overview">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center mb-4 font-inter">
            Error loading project details. Please try again.
          </Text>
        </View>
      </AppLayout>
    );
  }

  const statusConfig = getStatusConfig(project?.status);
  const progressPercent = project?.progress?.progressPercentage || 0;
  const completedMilestones = project?.progress?.completedMilestones || 0;
  const totalMilestones = project?.progress?.totalMilestones || 0;

  const {
    name,
    location,
    description,
    currency,
    budgetMinimum,
    budgetMaximum,
    durationMinimum,
    durationMaximum,
    status,
    isApprovedBuildingDrawings,
    milestones = [],
  } = project;

  // Check if project is in progress
  const isInProgress = status === "in_progress" || status === "in progress";

  const budgetLabel =
    budgetMinimum != null && budgetMaximum != null
      ? `${currency ?? "₦"} ${budgetMinimum.toLocaleString()} - ${budgetMaximum.toLocaleString()}`
      : "Not specified";

  const timelineLabel =
    durationMinimum != null && durationMaximum != null
      ? `${durationMinimum} - ${durationMaximum} months`
      : "Not specified";

  return (
    <AppLayout screenName="Project Overview">
      <View className="pt-4 bg-white m-4 rounded-xl">
        {/* Header with status */}
        <View className="flex-row items-center justify-between px-4 mb-1">
          <Text
            className="font-interbold text-xl flex-1 pr-2"
            numberOfLines={1}
          >
            {name || "Untitled Project"}
          </Text>
          <View
            className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.pillBg}`}
          >
            <View className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
            <Text
              className={`text-xs font-interbold ${statusConfig.labelColor}`}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Location */}
        {location && (
          <View className="flex-row items-center gap-1.5 px-4 pb-3">
            <MapPin size={13} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm font-inter">{location}</Text>
          </View>
        )}

        {/* Description */}
        <Text className="font-inter px-4 text-gray-600 leading-5">
          {description || "No description available"}
        </Text>

        {/* Progress Bar */}
        <View className="px-3 mt-3">
          <ProgressBar progress={progressPercent} />
        </View>

        {/* Milestone summary */}
        <View className="flex-row px-4 pb-3 gap-4 mt-1">
          <Text className="text-gray-400 text-xs font-inter">
            {completedMilestones}/{totalMilestones} milestones
          </Text>
          <Text className="text-blue-500 text-xs font-interbold">
            {progressPercent}% complete
          </Text>
        </View>

        <View className="h-px bg-gray-100 mx-4" />

        {/* Budget */}
        <View className="px-4 py-4 flex-row justify-between items-center">
          <Text className="font-inter text-gray-500">Budget</Text>
          <Text className="font-interbold text-base">{budgetLabel}</Text>
        </View>

        <View className="h-px bg-gray-100 mx-4" />

        {/* Timeline */}
        <View className="px-4 py-4 flex-row justify-between items-center">
          <Text className="font-inter text-gray-500">Timeline</Text>
          <Text className="font-interbold text-base">{timelineLabel}</Text>
        </View>

        <View className="h-px bg-gray-100 mx-4" />

        {/* Building Drawings */}
        <View className="px-4 py-4 flex-row justify-between items-center">
          <Text className="font-inter text-gray-500">Building Drawings</Text>
          <Text className="font-interbold text-base">
            {isApprovedBuildingDrawings ? "Approved" : "Pending"}
          </Text>
        </View>

        {/* View Contract - only shown if contractId exists */}
        {contractId && (
          <>
            <View className="h-px bg-gray-100 mx-4" />
            <TouchableOpacity
              onPress={viewContract}
              activeOpacity={0.7}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-blue-50 rounded-lg p-2">
                  <FileText size={15} color="#2463EB" />
                </View>
                <Text className="font-interbold text-gray-900 text-sm">
                  View Contract
                </Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </>
        )}

        {/* Start Project - ONLY shown when status is "in_progress" */}
        {isInProgress && (
          <>
            <View className="h-px bg-gray-100 mx-4" />
            <TouchableOpacity
              onPress={startWork}
              activeOpacity={0.7}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-green-50 rounded-lg p-2">
                  <Play size={15} color="#16a34a" />
                </View>
                <Text className="font-interbold text-gray-900 text-sm">
                  Start Project
                </Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Milestones Timeline */}
      <ProjectTimeline milestones={milestones} />
    </AppLayout>
  );
}
