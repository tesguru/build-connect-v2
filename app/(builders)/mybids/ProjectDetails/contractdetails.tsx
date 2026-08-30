import PrimaryButton from "@/components/Buttons/Button";
import GradientButton from "@/components/Buttons/GradientButton";
import AppLayout from "@/components/Layouts/AppLayout";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import { MarkEmoji } from "@/constants/icon";
import { useBids } from "@/core/hooks/UseBids";

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function formatDate(date: string) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function BuidlerContractdetailsScreen() {
  const {
    singleContractQuery,
    singleBidQuery,
    sendContractMutation,
    signContractMutation,
    signSuccess,
    sendSuccess,
  } = useBids();

  const { projectId, contractId, bidId } = useLocalSearchParams<{
    projectId: string;
    contractId: string;
    bidId: string;
  }>();
  const router = useRouter();

  const {
    data: contractResult,
    isLoading: contractLoading,
    error: contractError,
  } = singleContractQuery(contractId);
  const {
    data: bidResult,
    isLoading: bidLoading,
    error: bidError,
  } = singleBidQuery(bidId);

  useEffect(() => {
    if (contractError) {
      Alert.alert(
        "Error",
        "Failed to load contract details. Please try again.",
      );
    }
  }, [contractError]);

  useEffect(() => {
    if (bidError) {
      Alert.alert("Error", "Failed to load bid details. Please try again.");
    }
  }, [bidError]);

  useEffect(() => {
    if (sendContractMutation.error) {
      Alert.alert("Error", "Failed to send contract. Please try again.");
    }
  }, [sendContractMutation.error]);

  useEffect(() => {
    if (signContractMutation.error) {
      Alert.alert("Error", "Failed to sign contract. Please try again.");
    }
  }, [signContractMutation.error]);

  const contract = contractResult?.data?.data || contractResult?.data || {};
  const bid = bidResult?.data?.data || bidResult?.data || {};
  const milestones = bid?.milestones || [];
  const startDate = milestones[0]?.completionDate;
  const endDate = milestones[milestones.length - 1]?.completionDate;

  const contractStatus = contract?.status;
  const isClientSigned = contractStatus === "client_signed";
  const isActive = contractStatus === "active";
  const isContractorSigned = contractStatus === "contractor_signed";

  const viewContract = () => {
    router.push({
      pathname: "/(clients)/projects/contractviewscreen",
      params: {
        projectTitle: bid?.project?.title || "",
        companyName: contract?.contractor?.name || "",
        bidsData: JSON.stringify(bid),
        contractData: JSON.stringify(contract),
      },
    });
  };

  const startWork = () => {
    router.push({ pathname: "/share/startwork", params: { projectId } });
  };

  const signContract = () => {
    if (!contract?.id) {
      Alert.alert("Error", "Contract ID not found");
      return;
    }
    signContractMutation.mutate(contract.id);
  };

  if (contractLoading || bidLoading) {
    return (
      <AppLayout screenName="Contract Details">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-500 font-inter">
            Loading contract...
          </Text>
        </View>
      </AppLayout>
    );
  }

  if (contractError || bidError) {
    return (
      <AppLayout screenName="Contract Details">
        <View className="flex-1 justify-center items-center py-20 px-4">
          <Text className="text-red-500 text-center mb-4 font-inter">
            Failed to load contract details
          </Text>
        </View>
      </AppLayout>
    );
  }

  if (signSuccess || sendSuccess) {
    return (
      <SuccessScreen
        title="Contract Signed!"
        message="You have successfully signed the contract."
        navigateTo="/(builders)/mybids/bids"
        buttonTitle="Return to Bids"
      />
    );
  }

  const steps = [
    { label: "Contract generated", done: !!contract?.id },
    {
      label:
        isContractorSigned || isActive
          ? "Builder signed"
          : "Awaiting builder signature",
      done: isContractorSigned || isActive,
    },
    {
      label:
        isClientSigned || isActive
          ? "Client signed"
          : "Awaiting client signature",
      done: isClientSigned || isActive,
    },
  ];

  return (
    <AppLayout screenName="Contract Details">
      <View className="pt-4">
        <View className="items-center mb-6">
          <Image
            style={{ width: 90, height: 90 }}
            source={MarkEmoji}
            resizeMode="contain"
          />
          <Text className="font-interbold pt-2 text-center">Bid Selected</Text>
          <Text className="font-inter pt-1 text-center text-gray-500">
            You've selected {contract?.contractor?.name || "Contractor"}
          </Text>
        </View>

        <TouchableOpacity
          className="mx-4 mb-4 bg-white rounded-xl p-4"
          activeOpacity={0.8}
          onPress={viewContract}
        >
          <Text className="font-interbold text-xl py-4">
            {bid?.project?.title || "Project Title"}
          </Text>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Contractor</Text>
            <Text className="font-interbold">
              {contract?.contractor?.name || "—"}
            </Text>
          </View>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Total Amount</Text>
            <Text className="font-interbold">{bid?.bidAmount ?? "—"}</Text>
          </View>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Timeline</Text>
            <Text className="font-interbold">
              {bid?.proposedTimeline || "—"}
            </Text>
          </View>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Start Date</Text>
            <Text className="font-interbold">{formatDate(startDate)}</Text>
          </View>

          <View className="flex-row py-3 justify-between">
            <Text className="text-gray-500 font-inter">End Date</Text>
            <Text className="font-interbold">{formatDate(endDate)}</Text>
          </View>

          <View className="flex-row justify-end py-3">
            <Text className="text-[#2463EB] text-xs font-interbold">
              View Contract →
            </Text>
          </View>
        </TouchableOpacity>

        <View className="mx-4 mb-4 bg-white rounded-xl px-4">
          <Text className="font-interbold text-xl py-4">Contract Status</Text>
          {steps.map((step, i) => (
            <View
              key={i}
              className="flex-row py-3 gap-3 items-center border-b border-gray-100 last:border-0"
            >
              <View
                className={`w-5 h-5 rounded-full items-center justify-center ${
                  step.done ? "bg-green-500" : "bg-gray-200"
                }`}
              >
                {step.done && (
                  <Text
                    style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}
                  >
                    ✓
                  </Text>
                )}
              </View>
              <Text
                className={`font-inter text-sm ${step.done ? "text-gray-900" : "text-gray-400"}`}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        <View className="mx-4 gap-4">
          {!isActive && (
            <PrimaryButton
              loading={signContractMutation.isPending}
              onPress={signContract}
              title="Sign Contract"
              textColor="white"
              backgroundColor="#16a34a"
            />
          )}

          {isActive && (
            <>
              <GradientButton onPress={startWork} title="Start Project" />
              <View className="bg-green-50 p-4 rounded-lg">
                <Text className="text-green-700 font-interbold text-center">
                  ✓ Contract Active
                </Text>
                <Text className="text-green-600 text-center text-sm mt-1">
                  Both parties have signed
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </AppLayout>
  );
}
