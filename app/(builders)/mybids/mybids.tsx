// Reconstructed from Hermes bytecode (module 3833) — hand-verified
// Original route: ./(builders)/mybids/mybids.tsx
// This is the "Bids" tab component referenced by (builders)/mybids/bids.tsx.
// Module 3812 exports a named `BidsCard` component (props: currency,
// projectName, projectId, amount, bidStatus, contractId, bidId).

import { BidsCard } from "@/components/Cards/BidsCard";
import EmptyScreenComponent from "@/components/Miscallaneous/EmptyScreenComponent";
import { useBids } from "@/core/hooks/UseBids";
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
  revision_requested: "Revision Requested",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  all: "All",
};

function capitalize(status: string) {
  const label = STATUS_LABELS[status];
  if (label != null) return label;
  return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
}

export default function MyBids() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [queryParams, setQueryParams] = useState<Record<string, any>>({
    page: 1,
    limit: 100,
    includeProgress: true,
  });

  const { getAllBids } = useBids();
  const { data, isLoading, error } = getAllBids(queryParams);

  const bids = data?.data?.data?.bids || data?.data?.bids || [];

  const statusCounts = bids.reduce(
    (acc: Record<string, number>, item: any) => {
      if (item.status && acc[item.status] !== undefined) {
        acc[item.status] += 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const filterTabs = [
    { id: "all", label: "All", count: bids.length },
    ...Object.keys(STATUS_LABELS)
      .filter((id) => id !== "all")
      .map((id) => ({
        id,
        label: STATUS_LABELS[id],
        count: statusCounts[id] || 0,
      })),
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

  const pagination = data?.data?.data?.pagination;
  const canLoadMore = pagination && pagination.page < pagination.totalPages;

  const onLoadMore = () => {
    setQueryParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  const onRetry = () => {
    setQueryParams((prev) => ({ ...prev }));
  };

  const renderCard = (item: any) => (
    <View key={item.id} className=" px-4 py-3">
      <BidsCard
        currency={item.project?.currency}
        projectName={item.project?.name}
        projectId={item.project?.id}
        amount={item.bidAmount}
        bidStatus={item.status}
        contractId={item.contractId}
        bidId={item.id}
      />
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600">Loading bids...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center mb-4">
            Error loading bids. Please try again.
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
    if (bids.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20 px-4">
          <EmptyScreenComponent
            title={
              selectedFilter !== "all"
                ? `No "${capitalize(selectedFilter)}" Bids`
                : "No Bids Found"
            }
            description={
              selectedFilter !== "all"
                ? "Try a different filter to see more results"
                : "Bids you submit on projects will appear here"
            }
          />
        </View>
      );
    }
    return (
      <ScrollView>
        {bids.map(renderCard)}
        {canLoadMore && (
          <View className="py-6 items-center">
            <Text className="text-gray-500 text-sm mb-2">
              Showing {bids.length} of {pagination.total} bids
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-lg"
              onPress={onLoadMore}
            >
              <Text className="text-white font-medium">Load More Bids</Text>
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
