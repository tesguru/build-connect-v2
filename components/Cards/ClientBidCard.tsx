import { formatCurrency } from "@/core/utils";
import { useRouter } from "expo-router";
import React, { memo, useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";

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
  project: any;
}

const getStatusConfig = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "accepted")
    return { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-400", label: "Accepted" };
  if (s === "rejected" || s === "declined")
    return { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400", label: "Rejected" };
  if (s === "pending")
    return { bg: "bg-blue-100", text: "text-blue-600", dot: "bg-blue-400", label: "New" };
  return { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: status };
};

export const ClientBidCard: React.FC<ClientBidCardProps> = memo(({ bid, project }) => {
  const router = useRouter();
  const companyName = `${bid.contractor.firstName} ${bid.contractor.lastName}`.trim();
  const isAccepted = bid.status?.toLowerCase() === "accepted";
  const statusConfig = getStatusConfig(bid.status);

  const handleNavigateToProposal = useCallback(() => {
    router.push({
      pathname: "/proposalscreen/proposalscreen",
      params: {
        bidId: bid.id,
        companyName,
        projectTitle: project?.title,
           projectId: project?.id,
      },
    });
  }, [router, bid.id, companyName, project]);

  return (
    <TouchableOpacity
      onPress={handleNavigateToProposal}
      className="bg-white rounded-2xl p-5 border border-gray-200 mb-4"
      activeOpacity={0.7}
    >
    
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-interbold text-gray-900 flex-1 mr-2" numberOfLines={1}>
          {companyName}
        </Text>
        <View className={`flex-row items-center gap-1.5 rounded-full px-3 py-1 ${statusConfig.bg}`}>
          <View className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
          <Text className={`text-xs font-intersemibold ${statusConfig.text}`}>
            {statusConfig.label}
          </Text>
        </View>
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

        {isAccepted ? (
          <View className="bg-green-600 rounded-lg px-4 py-2">
            <Text className="text-sm font-intersemibold text-white">View Accepted Bid</Text>
          </View>
        ) : (
          <View className="bg-gray-100 rounded-lg px-4 py-2">
            <Text className="text-sm font-intersemibold text-gray-700">View Bid</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});