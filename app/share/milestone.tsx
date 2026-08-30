import MilestoneCard from "@/components/Cards/MileStoneCard";
import AppLayout from "@/components/Layouts/AppLayout";
import { useProjects } from "@/core/hooks/useProjects";
import { useAuthStore } from "@/store/Authstore";
import { useCurrencyStore } from "@/store/useCurrencyStore";

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

function formatDueDate(date: string) {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusToProgress(status: string) {
  if (status === "completed") return 100;
  if (status === "in_progress") return 50;
  return 0;
}

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  pending: "Pending",
};

function formatStatusLabel(status: string) {
  return STATUS_LABELS[status] || status;
}

export default function Milestone() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { projectId, currency } = useLocalSearchParams<{
    projectId: string;
    currency?: string;
  }>();
  const { setCurrency, currencySymbol } = useCurrencyStore();

  useEffect(() => {
    if (currency) {
      setCurrency(currency);
    }
  }, [currency, setCurrency]);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 100,
    projectId,
    includeProgress: true,
  });

  const { getProjectMilestonesQuery } = useProjects();
  const { data, isLoading, error } = getProjectMilestonesQuery(
    projectId,
    queryParams,
  );

  const milestones =
    data?.data?.data?.milestones || data?.data?.milestones || [];

  const statusCounts = milestones.reduce(
    (acc: Record<string, number>, item: any) => {
      if (item.status && acc[item.status] !== undefined) {
        acc[item.status] += 1;
      }
      return acc;
    },
    { pending: 0, in_progress: 0, completed: 0 },
  );

  const filterTabs = [
    { id: "all", label: "All", count: milestones.length },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    {
      id: "in_progress",
      label: "In Progress",
      count: statusCounts.in_progress,
    },
    { id: "completed", label: "Completed", count: statusCounts.completed },
  ];

  const onFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    setQueryParams((prev) => {
      const next: any = { ...prev, page: 1 };
      if (filterId !== "all") {
        next.status = filterId;
      } else {
        delete next.status;
        delete next.statusId;
      }
      return next;
    });
  };

  const filteredMilestones =
    selectedFilter === "all"
      ? milestones
      : milestones.filter((item: any) => item.status === selectedFilter);

  const role = useAuthStore().user?.role;
  const router = useRouter();

  const pagination = data?.data?.pagination;
  const canLoadMore = pagination && pagination.page < pagination.totalPages;

  const onLoadMore = () => {
    setQueryParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  return (
    <AppLayout screenName="Milestones">
      <View className="flex-1 mt-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingVertical: 1,
            gap: 10,
            alignItems: "center",
          }}
          style={{ maxHeight: 60 }}
        >
          {filterTabs.map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => onFilterChange(tab.id)}
                className={`px-5 py-3.5 rounded-full border min-w-[90px] items-center justify-center ${
                  isActive
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-md font-inter font-medium text-center ${
                    isActive ? "text-white" : "text-gray-800"
                  }`}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredMilestones.length !== 0 && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {filteredMilestones.map((item: any, index: number) => (
              <View key={item.id} className="mb-4 px-4">
                <MilestoneCard
                  milestoneName={item.name}
                  dueDate={formatDueDate(item.completionDate)}
                  budget={`${currencySymbol} ${item.amount != null ? item.amount.toLocaleString() : "0"}`}
                  progress={statusToProgress(item.status)}
                  status={formatStatusLabel(item.status)}
                  isFirst={index === 0}
                  isLast={index === filteredMilestones.length - 1}
                  onPress={() =>
                    router.push({
                      pathname:
                        role === "client"
                          ? "/(clients)/milestone/milestonedetails"
                          : "/(builders)/milestone/milestonedetails",
                      params: {
                        milestoneId: item.id,
                        projectId,
                        milestoneName: item.name,
                        currencySymbol,
                      },
                    })
                  }
                />
              </View>
            ))}
            {canLoadMore && (
              <View className="py-6 items-center">
                <Text className="text-gray-500 text-sm mb-2">
                  Showing {filteredMilestones.length} of {pagination.total}{" "}
                  milestones
                </Text>
                <TouchableOpacity
                  className="bg-blue-600 px-6 py-3 rounded-lg"
                  onPress={onLoadMore}
                >
                  <Text className="text-white font-medium">Load More</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </AppLayout>
  );
}
