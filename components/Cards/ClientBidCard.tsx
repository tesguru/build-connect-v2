import { formatCurrency } from "@/core/utils";
import { useRouter } from "expo-router";
import React, { memo } from "react";
import { useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface Bid {
  id: string;
  contractor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileUrl: string;
  };
  bidAmount: string;
  proposedTimeline: string;
  proposal: string;
  status: string;
  milestones: any[];
  submittedAt: string;
}

interface ClientBidCardProps {
  bid: Bid;
}

export const ClientBidCard: React.FC<ClientBidCardProps> = memo(({ bid, project }) => {
  const router = useRouter();

  const handleNavigateToProposal = useCallback(() => {
    router.push({
      pathname: "/proposalscreen/proposalscreen",
      params: { bidId: bid.id, companyName:companyName, projectTitle:project.title }
    });
  }, [router, bid.id]);

  const isNew = bid.status === "pending";
  const companyName = `${bid.contractor.firstName} ${bid.contractor.lastName}`.trim();

  return (
    <TouchableOpacity 
      onPress={handleNavigateToProposal} 
      className="bg-white rounded-2xl p-5 border border-gray-200 mb-4"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-interbold text-gray-900" numberOfLines={1}>
          {companyName}
        </Text>
        {isNew && (
          <View className="bg-blue-100 rounded-full px-3 py-1">
            <Text className="text-blue-600 text-xs font-intersemibold">New</Text>
          </View>
        )}
      </View>

      <Text className="text-sm font-inter text-gray-500 mb-3">
        Timeline: {bid.proposedTimeline}
      </Text>

      <Text className="text-sm font-inter text-gray-600 leading-5 mb-4" numberOfLines={2}>
        {bid.proposal}
      </Text>

      <View className="flex-row justify-between items-center">
        <Text className="text-xl font-interbold text-green-600">
          {formatCurrency(parseFloat(bid.bidAmount))}
        </Text>
        <View className="bg-gray-100 rounded-lg px-4 py-2">
          <Text className="text-base font-intersemibold text-gray-700">View Bid</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});