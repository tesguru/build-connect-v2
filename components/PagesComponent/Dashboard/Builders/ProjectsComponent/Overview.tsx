import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Milestone = {
  id: string;
  name: string;
  dueDate: string;
  status: "pending" | "completed" | string;
};

type ProjectData = {
  id: string;
  name: string;
  location: string;
  description: string;
  currency: string;
  budgetMinimum: number;
  budgetMaximum: number;
  durationMinimum: number;
  durationMaximum: number;
  status: string;
  milestones: Milestone[];
  progress: {
    totalMilestones: number;
    completedMilestones: number;
    progressPercentage: number;
    totalBudget: number;
  };
};

const formatStatus = (status: string) =>
  status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const Overview = ({ data }: { data: ProjectData }) => {
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
    milestones,
    progress,
  } = data;

  const isInProgress = status === "in_progress";

  return (
    <View className="flex-1 bg-gray-100">
      {/* Project Info Card */}
      <View className="bg-white rounded-2xl m-4 p-4">
        <View className="flex-row justify-between items-start">
          <Text className="font-interbold text-xl">{name}</Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-gray-400 mr-1" />
            <Text className="font-inter text-gray-400 text-xs">{status}</Text>
          </View>
        </View>

        <Text className="font-inter text-gray-400 mt-1">{location}</Text>

        <Text className="font-inter text-gray-600 mt-3">{description}</Text>

        {/* Progress */}
        <View className="flex-row justify-between items-center mt-5">
          <Text className="font-interbold text-base">Progress</Text>
          <Text className="font-interbold text-base">
            {progress.progressPercentage}%
          </Text>
        </View>

        <View className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
          <View
            style={{ width: `${progress.progressPercentage}%` }}
            className="h-2 bg-blue-500 rounded-full"
          />
        </View>

        <View className="flex-row justify-between mt-2">
          <Text className="font-inter text-gray-400 text-xs">
            {progress.completedMilestones}/{progress.totalMilestones} milestones
          </Text>
          <Text className="font-interbold text-blue-500 text-xs">
            {progress.progressPercentage}% complete
          </Text>
        </View>

        {/* Budget */}
        <View className="flex-row justify-between items-center border-t border-gray-100 mt-4 pt-4">
          <Text className="font-inter text-gray-400">Budget</Text>
          <Text className="font-interbold">
            {currency} {budgetMinimum.toLocaleString()} -{" "}
            {budgetMaximum.toLocaleString()}
          </Text>
        </View>

        {/* Timeline */}
        <View className="flex-row justify-between items-center border-t border-gray-100 mt-4 pt-4">
          <Text className="font-inter text-gray-400">Timeline</Text>
          <Text className="font-interbold">
            {durationMinimum} - {durationMaximum} months
          </Text>
        </View>

        {/* Status */}
        <View className="flex-row justify-between items-center border-t border-gray-100 mt-4 pt-4">
          <Text className="font-inter text-gray-400">Status</Text>
          <Text className="font-interbold text-gray-600">
            {formatStatus(status)}
          </Text>
        </View>
      </View>

      {/* Milestones Card */}
      <View className="bg-white rounded-2xl mx-4 mb-4 p-4">
        <Text className="font-interbold text-xl mb-4">Project Milestones</Text>

        {milestones.map((milestone) => (
          <View
            key={milestone.id}
            className="flex-row items-center justify-between py-3 border-b border-gray-100"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3" />
              <View>
                <Text className="font-interbold">{milestone.name}</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="font-inter text-gray-400 text-xs mr-2">
                    Due: {formatDate(milestone.dueDate)}
                  </Text>
                  <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                    <Text className="font-inter text-xs text-gray-500 capitalize">
                      {milestone.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}

        <View className="flex-row justify-between mt-4">
          <Text className="font-inter text-gray-400">Total Milestones</Text>
          <Text className="font-interbold">{progress.totalMilestones}</Text>
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="font-inter text-gray-400">Completed</Text>
          <Text className="font-interbold">{progress.completedMilestones}</Text>
        </View>
      </View>

      {/* Only shows when project is in progress */}
      {isInProgress && (
        <View className="mx-4 mb-6">
          <TouchableOpacity className="bg-blue-500 rounded-xl py-4 items-center">
            <Text className="font-interbold text-white text-base">
              Start Work
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Overview;
