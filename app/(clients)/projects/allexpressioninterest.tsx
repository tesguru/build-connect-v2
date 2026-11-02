import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import GradientButton from "@/components/Buttons/GradientButton";

import ExpressionOfInterestCard from "@/components/Cards/ExpressionOfInterestCard";
import AppLayout from "@/components/Layouts/AppLayout";
import EmptyScreenComponent from "@/components/Miscallaneous/EmptyScreenComponent";
import { useProjects } from "@/core/hooks/useProjects";

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Helpers - Preserved from original
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  all: "All",
};

function capitalize(status: string) {
  if (STATUS_LABELS[status]) return STATUS_LABELS[status];
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AllExpressionOfInterest() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 100,
    projectId,
  });

  const { getClientsExpressionOfInterest } = useProjects();
  const { data, isLoading, error, refetch } = getClientsExpressionOfInterest(
    projectId,
    queryParams,
  );

  const interests = data?.data?.data?.interests || data?.data?.interests || [];

  // ── Status counts ──────────────────────────────────────────────────────────
  const statusCounts = interests.reduce(
    (acc: Record<string, number>, item: any) => {
      if (item.status && acc[item.status] !== undefined) {
        acc[item.status] += 1;
      }
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 },
  );

  const filterTabs = [
    { id: "all", label: "All", count: interests.length },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    { id: "approved", label: "Approved", count: statusCounts.approved },
    { id: "rejected", label: "Rejected", count: statusCounts.rejected },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    const params: Record<string, any> = { page: 1, limit: 100, projectId };
    if (filterId !== "all") params.status = filterId;
    setQueryParams(params);
  };

  const filteredInterests =
    selectedFilter === "all"
      ? interests
      : interests.filter((item: any) => item.status === selectedFilter);

  const pagination = data?.data?.pagination || data?.data?.data?.pagination;
  const canLoadMore = pagination && pagination.page < pagination.totalPages;

  const onLoadMore = () => {
    setQueryParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  const onRetry = () => {
    refetch();
  };

  const handleBack = () => {
    router.back();
  };

  // ── Loading State ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppLayout screenName="Expressions of Interest">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600 font-inter">
            Loading expressions of interest...
          </Text>
        </View>
      </AppLayout>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <AppLayout screenName="Expressions of Interest">
        <View className="flex-1 justify-center items-center p-4">
          <View className="bg-red-50 rounded-xl p-6 items-center max-w-md">
            <Text className="text-red-500 text-center mb-4 font-inter">
              {(error as any)?.message ||
                "Error loading data. Please try again."}
            </Text>
            <GradientButton title="Retry" onPress={onRetry} />
          </View>
        </View>
      </AppLayout>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout screenName="Expressions of Interest">
      <View className="flex-1 mt-4">
        <View className="flex-1">
          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 8,
              paddingVertical: 1,
              gap: 10,
              alignItems: "center",
            }}
            style={{ maxHeight: 60, marginBottom: 16 }}
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

          {/* Content */}
          {filteredInterests.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20 px-4">
              <EmptyScreenComponent
                title={
                  selectedFilter !== "all"
                    ? `No ${capitalize(selectedFilter)} Expressions of Interest`
                    : "No Expressions of Interest Yet"
                }
                description={
                  selectedFilter !== "all"
                    ? "Try a different filter to see more results"
                    : "When builders show interest in your projects, they will appear here"
                }
              />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="mt-2"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {filteredInterests.map((item: any) => (
                <View key={item.id} className="mb-4 px-4">
                  <ExpressionOfInterestCard
                    interest={item}
                    projectId={projectId}
                  />
                </View>
              ))}

              {/* Load More */}
              {canLoadMore && (
                <View className="py-6 items-center">
                  <Text className="text-gray-500 text-sm mb-2 font-inter">
                    Showing {filteredInterests.length} of {pagination.total}{" "}
                    interests
                  </Text>
                  <GradientButton title="Load More" onPress={onLoadMore} />
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </AppLayout>
  );
}
