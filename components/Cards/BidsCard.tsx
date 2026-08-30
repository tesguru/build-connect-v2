import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface BidsCardProps {
  projectName: string;
  bidId: string | number;
  projectId: string | number;
  amount: string | number;
  bidStatus?: string;
  paymentStatus?: string;
  image?: any;
  currency?: string;
  contractId?: string;
  onStartWork?: () => void;
}

export const BidsCard = ({
  projectName,
  bidId,
  projectId,
  amount,
  currency,
  bidStatus = "pending",
  contractId,
}: BidsCardProps) => {
  const router = useRouter();

  // Helper function to format number with commas
  const formatAmount = (amount: string | number): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "0";
    return num.toLocaleString("en-NG");
  };

  const gotoProjectDetails = () => {
    if (contractId) {
      router.push({
        pathname: "/(builders)/mybids/ProjectDetails/projectdetails",
        params: { contractId, bidId, projectId },
      });
      return;
    }

    router.push({
      pathname: "/projectdetails/projectdetails",
      params: { contractId, bidId, projectId },
    });
  };

  const viewBidDetails = () => {
    router.push({
      pathname: "/mybids/viewbidsdetails",
      params: { bidId },
    });
  };

  const getStatusConfig = (status?: string) => {
    if (!status)
      return {
        bg: "bg-gray-100",
        text: "text-gray-500",
        dot: "#9ca3af",
        label: "Pending",
      };
    switch (status.toLowerCase()) {
      case "accepted":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-600",
          dot: "#10b981",
          label: "Accepted",
        };
      case "pending":
        return {
          bg: "bg-amber-50",
          text: "text-amber-600",
          dot: "#f59e0b",
          label: "Pending",
        };
      case "rejected":
        return {
          bg: "bg-red-50",
          text: "text-red-500",
          dot: "#ef4444",
          label: "Rejected",
        };
      case "under_review":
        return {
          bg: "bg-blue-50",
          text: "text-blue-600",
          dot: "#3b82f6",
          label: "Under Review",
        };
      case "shortlisted":
        return {
          bg: "bg-purple-50",
          text: "text-purple-600",
          dot: "#9333ea",
          label: "Shortlisted",
        };
      case "withdrawn":
        return {
          bg: "bg-gray-100",
          text: "text-gray-500",
          dot: "#9ca3af",
          label: "Withdrawn",
        };
      case "revision_requested":
        return {
          bg: "bg-orange-50",
          text: "text-orange-500",
          dot: "#f97316",
          label: "Revision Requested",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-500",
          dot: "#9ca3af",
          label: status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
        };
    }
  };

  const statusConfig = getStatusConfig(bidStatus);

  return (
    <View
      className="mx-1 bg-white rounded-2xl overflow-hidden"
      style={{
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#94a3b8",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row p-3 gap-3">
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 16,
            backgroundColor: "#f8fafc",
            borderWidth: 1,
            borderColor: "#e2e8f0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="hammer-outline" size={32} color="#1e293b" />
          <Text
            style={{
              color: "#94a3b8",
              fontSize: 8,
              letterSpacing: 2,
              marginTop: 5,
              fontWeight: "600",
            }}
          >
            BID
          </Text>
        </View>

        <View className="flex-1 justify-between py-1">
          <View className="flex-row justify-between items-start">
            <Text
              className="font-interbold text-gray-900 text-base flex-1 pr-2"
              numberOfLines={2}
            >
              {projectName}
            </Text>
            <View
              className={`flex-row items-center gap-1 px-2 py-1 rounded-full ${statusConfig.bg}`}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: statusConfig.dot,
                }}
              />
              <Text
                className={`font-intersemibold text-xs ${statusConfig.text}`}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>

          <View className="mt-2">
            <Text className="font-inter text-xs text-gray-400">Bid Amount</Text>
            <Text className="font-interbold text-blue-600 text-base mt-0.5">
              {currency} {formatAmount(amount)}
            </Text>
          </View>
        </View>
      </View>

      <View className="mx-3 h-px bg-slate-100" />

      <View className="flex-row gap-2 px-3 py-3">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1 bg-blue-600 rounded-xl py-2.5"
          onPress={gotoProjectDetails}
          activeOpacity={0.85}
        >
          <Ionicons name="document-text-outline" size={13} color="#fff" />
          <Text className="text-white font-intersemibold text-xs">
            View Project
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1 rounded-xl py-2.5 border border-slate-200 bg-slate-50"
          onPress={viewBidDetails}
          activeOpacity={0.85}
        >
          <Ionicons name="eye-outline" size={13} color="#475569" />
          <Text className="text-slate-600 font-intersemibold text-xs">
            Bid Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
