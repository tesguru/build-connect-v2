import { formatCurrency } from "@/core/utils";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { memo, useCallback } from "react";
import React from "react";

interface Bid {
  company: string;
  isNew: boolean;
  duration: number;
  description: string;
  amount: number;
}

interface ClientBidCardProps {
  bid: Bid;
  bidId: string;
}

export const ClientBidCard: React.FC<ClientBidCardProps> = memo(({ bid, bidId }) => {
  const router = useRouter();

  const handleNavigateToProposal = useCallback(() => {
    router.push({
      pathname: "/proposal",
      params: { id: bidId }
    });
  }, [router, bidId]);

  return (
    <TouchableOpacity 
      onPress={handleNavigateToProposal} 
      className="bg-white rounded-2xl p-5 border border-gray-200 mb-4"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-interbold text-gray-900" numberOfLines={1}>
          {bid.company}
        </Text>
        {bid.isNew && (
          <View className="bg-blue-100 rounded-full px-3 py-1">
            <Text className="text-blue-600 text-xs font-intersemibold">
              New
            </Text>
          </View>
        )}
      </View>

      <Text className="text-sm font-inter text-gray-500 mb-3">
        Estimated Duration: {bid.duration} {bid.duration === 1 ? 'month' : 'months'}
      </Text>

      <Text className="text-sm font-inter text-gray-600 leading-5 mb-4" numberOfLines={2}>
        {bid.description}
      </Text>

      <View className="flex-row justify-between items-center">
        <Text className="text-xl font-interbold text-green-600">
          {formatCurrency(bid.amount)}
        </Text>
        <View className="bg-gray-100 rounded-lg px-4 py-2">
          <Text className="text-base font-intersemibold text-gray-700">
            View Bid
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

ClientBidCard.displayName = 'ClientBidCard';