import ProjectTimeline from "@/components/Cards/ProjectTimeline";
import ProgressBar from "@/components/Miscallaneous/ProgressBar";
import { useProjects } from "@/core/hooks/useProjects";
import { useCurrencyStore } from "@/store/useCurrencyStore";

// module 3825
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ChevronRight, FileText, Play } from "lucide-react-native";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
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
      pathname: "/(clients)/projects/contractviewscreen",
      params: { contractId, projectId },
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
  }, [project?.currency]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <ActivityIndicator size="large" color="#2463EB" />
        <Text className="mt-4 text-gray-600">Loading project details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center mb-4">
          Error loading project details. Please try again.
        </Text>
      </View>
    );
  }

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
    progress,
  } = project;

  const isInProgress = status === "in_progress";

  const budgetLabel =
    budgetMinimum != null && budgetMaximum != null
      ? `${currency ?? ""} ${budgetMinimum.toLocaleString()} - ${budgetMaximum.toLocaleString()}`
      : "Not specified";

  const timelineLabel =
    durationMinimum != null && durationMaximum != null
      ? `${durationMinimum} - ${durationMaximum} months`
      : "Not specified";

  return (
    <View>
      <View className="pt-4 bg-white m-4 rounded-xl">
        <View className="px-4 pb-2">
          <Text className="font-interbold text-xl">
            {name || "Untitled Project"}
          </Text>
          {location ? (
            <Text className="font-inter text-gray-400 text-sm mt-1">
              {location}
            </Text>
          ) : null}
        </View>

        <Text className="font-inter px-4 pt-2 text-gray-600 leading-5">
          {description || "No description available"}
        </Text>

        <View className="px-3 mt-3">
          <ProgressBar progress={progress?.progressPercentage || 0} />
        </View>

        <View className="px-4 pt-2 flex-row justify-between">
          <Text className="font-inter text-gray-400 text-xs">
            {progress?.completedMilestones ?? 0}/
            {progress?.totalMilestones ?? 0} milestones
          </Text>
          <Text className="font-interbold text-blue-500 text-xs">
            {progress?.progressPercentage ?? 0}% complete
          </Text>
        </View>

        <View className="h-px bg-gray-100 mx-4 mt-3" />

        <View className="px-4 py-4 flex-row justify-between">
          <Text className="font-inter text-gray-500">Budget</Text>
          <Text className="font-interbold text-base">{budgetLabel}</Text>
        </View>

        <View className="h-px bg-gray-100 mx-4" />

        <View className="px-4 py-4 flex-row justify-between">
          <Text className="font-inter text-gray-500">Timeline</Text>
          <Text className="font-interbold text-base">{timelineLabel}</Text>
        </View>

        <View className="h-px bg-gray-100 mx-4" />

        <View className="px-4 py-4 flex-row justify-between">
          <Text className="font-inter text-gray-500">Building Drawings</Text>
          <Text className="font-interbold text-base">
            {isApprovedBuildingDrawings ? "Approved" : "Pending"}
          </Text>
        </View>

        <View className="h-px bg-gray-100 mx-4" />

        <View className="px-4 py-4 flex-row justify-between">
          <Text className="font-inter text-gray-500">Status</Text>
          <Text className="font-interbold text-base capitalize">
            {status ? status.replace(/_/g, " ") : "Not specified"}
          </Text>
        </View>

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
      <ProjectTimeline milestones={milestones} />
    </View>
  );
}
