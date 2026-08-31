import EOICard from "@/components/Cards/EOICard";
import EmptyScreenComponent from "@/components/Miscallaneous/EmptyScreenComponent";
import { useProjects } from "@/core/hooks/useProjects";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  all: "All",
};

function capitalize(status: string) {
  const label = STATUS_LABELS[status];
  if (label != null) return label;
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function ExpressionOfInterest() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [queryParams, setQueryParams] = useState<Record<string, any>>({
    page: 1,
    limit: 20,
  });

  const { getBuilderExpressionOfInterest } = useProjects();
  const { data, isLoading, error } =
    getBuilderExpressionOfInterest(queryParams);

  const interests = data?.data?.data?.interests || data?.data?.interests || [];

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

  const onFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    setQueryParams((prev) => {
      const next = { ...prev, page: 1 };
      if (filterId !== "all") {
        next.status = filterId;
      } else {
        delete next.status;
      }
      return next;
    });
  };

  const filteredInterests =
    selectedFilter === "all"
      ? interests
      : interests.filter((item: any) => item.status === selectedFilter);

  const pagination = data?.data?.data?.pagination;
  const canLoadMore = pagination && pagination.page < pagination.totalPages;

  const onLoadMore = () => {
    setQueryParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  const onRetry = () => {
    setQueryParams((prev) => ({ ...prev }));
  };

  const renderCard = (item: any) => (
    <View key={item.id} className="px-4 py-3">
      <EOICard
        eoiId={item.id}
        projectId={item.project?.id}
        projectName={item.project?.name}
        projectLocation={item.project?.location}
        projectStatus={item.project?.status}
        status={item.status}
        message={item.message}
        reviewNote={item.reviewNote}
        createdAt={item.createdAt}
      />
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600">Loading interests...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center mb-4">
            Error loading interests. Please try again.
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-lg"
            onPress={onRetry}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (filteredInterests.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20 px-4">
          <EmptyScreenComponent
            message={
              selectedFilter !== "all"
                ? `No "${capitalize(selectedFilter)}" Interests`
                : "No Expressions of Interest Found"
            }
          />
        </View>
      );
    }
    return (
      <ScrollView>
        {filteredInterests.map(renderCard)}
        {canLoadMore && (
          <View className="py-6 items-center">
            <Text className="text-gray-500 text-sm mb-2">
              Showing {filteredInterests.length} of {pagination.total} interests
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
    );
  };

  return (
    <View className="flex-1">
      <View className="mt-8 flex-1">
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

        {renderContent()}
      </View>
    </View>
  );
}
