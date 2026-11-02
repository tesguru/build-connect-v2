import InvitationCard from "@/components/Cards/InvitationCard";
import EmptyScreenComponent from "@/components/Miscallaneous/EmptyScreenComponent";
import { useBids } from "@/core/hooks/UseBids";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_LABELS: Record<string, string> = {
  all: "All",
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

function capitalize(status: string) {
  const label = STATUS_LABELS[status];
  if (label != null) return label;
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function InvitedInvitations() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [queryParams, setQueryParams] = useState<Record<string, any>>({
    page: 1,
    limit: 20,
  });
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const { myInvitations, respondToBidInvitationMutation } = useBids();
  const router = useRouter();

  const { data, isLoading, error } = myInvitations(queryParams);
  const invitations =
    data?.data?.data?.invitations || data?.data?.invitations || [];

  const statusCounts = invitations.reduce(
    (acc: Record<string, number>, item: any) => {
      if (item.status && acc[item.status] !== undefined) {
        acc[item.status] += 1;
      }
      return acc;
    },
    { pending: 0, accepted: 0, declined: 0, expired: 0 },
  );

  const filterTabs = [
    { id: "all", label: "All", count: invitations.length },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    { id: "accepted", label: "Accepted", count: statusCounts.accepted },
    { id: "declined", label: "Declined", count: statusCounts.declined },
    { id: "expired", label: "Expired", count: statusCounts.expired },
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

  const onAccept = (invitationId: string, projectId: string) => {
    setRespondingId(invitationId);
    respondToBidInvitationMutation.mutate(
      { id: invitationId, status: "accepted" },
      {
        onSuccess: () => {
          setRespondingId(null);
          router.push({
            pathname: "/projectdetails/projectdetails",
            params: { projectId },
          });
        },
        onError: () => setRespondingId(null),
      },
    );
  };

  const onDecline = (invitationId: string) => {
    setRespondingId(invitationId);
    respondToBidInvitationMutation.mutate(
      { id: invitationId, status: "declined" },
      {
        onSuccess: () => setRespondingId(null),
        onError: () => setRespondingId(null),
      },
    );
  };

  const onViewProject = (projectId: string) => {
    router.push({
      pathname: "/projectdetails/projectdetails",
      params: { projectId },
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600">Loading invitations...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center mb-4">
            Error loading invitations. Please try again.
          </Text>
        </View>
      );
    }
    if (invitations.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20 px-4">
          <EmptyScreenComponent
            title={
              selectedFilter !== "all"
                ? `No "${capitalize(selectedFilter)}" Invitations`
                : "No Invitations Found"
            }
            description={
              selectedFilter !== "all"
                ? "Try a different filter to see more results"
                : "Invitations from clients will appear here"
            }
          />
        </View>
      );
    }
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="mt-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {invitations.map((item: any) => (
          <View key={item.id} className="mb-3">
            <InvitationCard
              invitation={item}
              onAccept={() => onAccept(item.id, item.project?.id)}
              onDecline={() => onDecline(item.id)}
              onViewProject={() => onViewProject(item.project?.id)}
              isResponding={
                respondToBidInvitationMutation.isPending &&
                respondingId === item.id
              }
            />
          </View>
        ))}
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
