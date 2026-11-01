import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import GradientButton from "@/components/Buttons/GradientButton";
import AppLayout from "@/components/Layouts/AppLayout";
import SuccessScreen from "@/components/Notifications/SucessScreen";

import PrimaryButton from "@/components/Buttons/Button";
import { MarkEmoji } from "@/constants/icon";
import { useBids } from "@/core/hooks/UseBids";
import { handleApiError } from "@/core/utils/handleapierror";
import { useCurrencyStore } from "@/store/useCurrencyStore";

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions - Preserved from original
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ClientContractdetailsScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractData, setContractData] = useState<any>({});
  const [milestones, setMilestones] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { bidId, projectId, projectTitle, companyName, bidsData } =
    useLocalSearchParams<{
      bidId: string;
      projectId: string;
      projectTitle: string;
      companyName: string;
      bidsData: string;
    }>();

  const {
    sendContractMutation,
    sendSuccess,
    signSuccess,
    signContractMutation,
    getContractByBidQuery,
  } = useBids();

  const { currencySymbol } = useCurrencyStore();

  // ── Parse bidsData ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!bidsData) return;
    try {
      const parsed =
        typeof bidsData === "string" ? JSON.parse(bidsData) : bidsData;
      setContractData(parsed || {});
      const ms = parsed?.milestones || [];
      setMilestones(ms);
      setStartDate(ms[0]?.completionDate || "");
      setEndDate(ms[ms.length - 1]?.completionDate || "");
    } catch (err) {
      setContractData({});
      setMilestones([]);
    }
  }, [bidsData]);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading, error, refetch } = getContractByBidQuery(bidId);
  const contract = data?.data?.data || data?.data || {};
  const contractStatus = contract?.status;
  const contractId = contract?.id;

  const isClientSigned = contractStatus === "client_signed";
  const isActive = contractStatus === "active";
  const isContractorSigned = contractStatus === "contractor_signed";

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showError = (message: string) => {
    Alert.alert("Error", message);
  };

  const formatCurrency = (amount: any) => {
    if (!amount) return "—";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "—";
    return `${currencySymbol}${num.toLocaleString()}`;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const viewContract = () => {
    router.push({
      pathname: "/(clients)/projects/contractviewscreen",
      params: {
        projectTitle,
        companyName,
        bidsData,
        contractData: JSON.stringify(contract),
      },
    });
  };

  const sendContract = () => {
    if (!contractId) {
      showError("Contract ID not found");
      return;
    }
    setIsSubmitting(true);
    sendContractMutation.mutate(contractId, {
      onSettled: () => {
        setIsSubmitting(false);
      },
      onError: (err: any) => {
        handleApiError(err, "Failed to send contract. Please try again.", {
          title: "Contract Failed",
          fallbackMessage: "Failed to send contract. Please try again.",
        });
      },
    });
  };

  const signContract = () => {
    if (!contractId) {
      showError("Contract ID not found");
      return;
    }
    setIsSubmitting(true);
    signContractMutation.mutate(contractId, {
      onSettled: () => {
        setIsSubmitting(false);
      },
      onError: (err: any) => {
        handleApiError(err, "Failed to sign contract. Please try again.", {
          title: "Signature Failed",
          fallbackMessage: "Failed to sign contract. Please try again.",
        });
      },
    });
  };

  const startWork = () => {
    router.push({ pathname: "/share/startwork", params: { projectId } });
  };

  const handleBack = () => {
    router.back();
  };

  const isLoadingSend = isSubmitting || sendContractMutation.isPending;
  const isLoadingSign = isSubmitting || signContractMutation.isPending;

  const steps = [
    { label: "Contract generated", done: !!contractId },
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

  // ── Success States ──────────────────────────────────────────────────────
  if (sendSuccess) {
    return (
      <SuccessScreen
        title="Contract Sent!"
        message="The contract has been successfully sent via email."
        buttonTitle="Return to Contract"
        navigateTo="/(clients)/projects/contractscreen"
        params={{ bidId, projectId, projectTitle, companyName, bidsData }}
      />
    );
  }

  if (signSuccess) {
    return (
      <SuccessScreen
        title="Contract Signed!"
        message="You have successfully signed the contract."
        buttonTitle="Return to Contract"
        navigateTo="/(clients)/projects/contractscreen"
        params={{ bidId, projectId, projectTitle, companyName, bidsData }}
      />
    );
  }

  // ── Loading State ─────────────────────────────────────────────────────────
  if (isLoading) {
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

  // ── Error State ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <AppLayout screenName="Contract Details">
        <View className="flex-1 justify-center items-center py-20 px-4">
          <Text className="text-red-500 text-center mb-4 font-inter">
            Failed to load contract details
          </Text>
          <GradientButton title="Retry" onPress={() => refetch()} />
        </View>
      </AppLayout>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout screenName="Contract Details">
      <View className="pt-4">
        {/* Header */}
        <View className="items-center mb-6">
          <Image
            style={{ width: 90, height: 90 }}
            source={MarkEmoji}
            resizeMode="contain"
          />
          <Text className="font-interbold pt-2 text-center">Bid Selected</Text>
          <Text className="font-inter pt-1 text-center text-gray-500">
            You've selected {companyName}
          </Text>
        </View>

        {/* Contract Card */}
        <TouchableOpacity
          className="mx-4 mb-4 bg-white rounded-xl p-4"
          activeOpacity={0.8}
          onPress={viewContract}
        >
          <Text className="font-interbold text-xl">{projectTitle}</Text>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Contractor</Text>
            <Text className="font-interbold">{companyName}</Text>
          </View>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Total Amount</Text>
            <Text className="font-interbold">
              {formatCurrency(contractData.bidAmount)}
            </Text>
          </View>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Timeline</Text>
            <Text className="font-interbold">
              {contractData.proposedTimeline || "—"}
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

        {/* Contract Status */}
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

        {/* Action Buttons */}
        <View className="mx-4 gap-4">
          <GradientButton
            loading={sendContractMutation.isPending}
            onPress={sendContract}
            title="Send Contract Via Email"
            disabled={isLoadingSend}
          />

          {isContractorSigned && (
            <PrimaryButton
              loading={signContractMutation.isPending}
              onPress={signContract}
              title="Sign Contract"
              textColor="white"
              backgroundColor="#16a34a"
            />
          )}

          {isActive && (
            <PrimaryButton
              onPress={startWork}
              title="Start Project"
              backgroundColor="#4A5D75"
            />
          )}

          {isActive && (
            <View className="bg-green-50 p-4 rounded-lg">
              <Text className="text-green-700 font-interbold text-center">
                ✓ Contract Active
              </Text>
              <Text className="text-green-600 text-center text-sm mt-1">
                Both parties have signed
              </Text>
            </View>
          )}
        </View>
      </View>
    </AppLayout>
  );
}
