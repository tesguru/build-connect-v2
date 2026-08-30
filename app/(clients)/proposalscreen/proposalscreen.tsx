import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import PrimaryButton from "@/components/Buttons/Button";
import GradientButton from "@/components/Buttons/GradientButton";

import AppLayout from "@/components/Layouts/AppLayout";
import AcceptProposalModal from "@/components/Miscallaneous/AcceptProposalModal";
import DeclineProposalModal from "@/components/Miscallaneous/DeclineProposalModal";
import { useBids } from "@/core/hooks/UseBids";
import { useProjects } from "@/core/hooks/useProjects";
import { useCurrencyStore } from "@/store/useCurrencyStore";

function formatCurrency(amount: number, symbol: string) {
  return `${symbol}${(amount || 0).toLocaleString()}`;
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-white rounded-2xl p-5 mb-4">
      <Text className="text-lg font-interbold text-gray-900 mb-4">{title}</Text>
      {children}
    </View>
  );
}

function BreakdownRow({
  label,
  amount,
  currencySymbol,
  isLast,
}: {
  label: string;
  amount: number;
  currencySymbol: string;
  isLast: boolean;
}) {
  return (
    <View
      className={`flex-row justify-between py-3 ${isLast ? "" : "border-b border-gray-100"}`}
    >
      <Text className="text-[15px] text-gray-600 font-inter flex-1 mr-4">
        {label}
      </Text>
      <Text className="text-[15px] font-interbold text-gray-900">
        {formatCurrency(amount, currencySymbol)}
      </Text>
    </View>
  );
}

function TimelineItem({
  milestone,
  date,
  index,
  isLast,
}: {
  milestone: string;
  date: string;
  index: number;
  isLast: boolean;
}) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View className="flex-row">
      <View className="items-center mr-4">
        <View className="w-9 h-9 rounded-full bg-blue-50 border-2 border-blue-200 items-center justify-center">
          <Text className="text-blue-600 font-interbold text-xs">
            {index + 1}
          </Text>
        </View>
        {!isLast && <View className="w-0.5 flex-1 bg-gray-200 mt-1 mb-1" />}
      </View>
      <View className={`flex-1 ${isLast ? "" : "pb-5"}`}>
        <Text className="text-[15px] font-interbold text-gray-900">
          {milestone}
        </Text>
        <Text className="text-[13px] text-gray-500 font-inter mt-0.5">
          {formatDate(date)}
        </Text>
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isAccepted = status === "accepted";
  const isRejected = status === "declined" || status === "rejected";
  const bg = isAccepted
    ? "bg-green-50"
    : isRejected
      ? "bg-red-50"
      : "bg-blue-50";
  const text = isAccepted
    ? "text-green-600"
    : isRejected
      ? "text-red-500"
      : "text-blue-600";
  return (
    <View className={`rounded-full px-3 py-1 ${bg}`}>
      <Text className={`text-xs font-interbold capitalize ${text}`}>
        {status || "Pending"}
      </Text>
    </View>
  );
}

function RejectedBanner() {
  return (
    <View className="mt-2 p-5 bg-red-50 rounded-2xl items-center">
      <Text className="font-interbold text-red-500 text-base mb-1">
        Proposal Rejected
      </Text>
      <Text className="font-inter text-gray-500 text-sm text-center leading-5">
        This proposal has been rejected. No further actions are available.
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function Proposalscreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAcceptModalVisible, setIsAcceptModalVisible] = useState(false);
  const [isDeclineModalVisible, setIsDeclineModalVisible] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const { bidId, companyName, projectTitle, projectId } = useLocalSearchParams<{
    bidId: string;
    companyName: string;
    projectTitle: string;
    projectId: string;
  }>();

  const { singleBidQuery, respondToBidMutation, createContractMutation } =
    useBids();
  const { getSingleProjectQuery } = useProjects();
  const { currencySymbol } = useCurrencyStore();

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: projectData } = getSingleProjectQuery(projectId);
  const project = projectData?.data?.data || projectData?.data || {};
  const projectStatus = (project?.status || "").toLowerCase();

  const { data, isLoading, error, refetch } = singleBidQuery(bidId);
  const bid = data?.data?.data || data?.data || {};
  const milestones = bid.milestones || [];
  const hasCreatedContract = bid.hasCreatedContract;
  const bidStatus = (bid.status || "").toLowerCase();

  const totalAmount = milestones.reduce(
    (sum: number, m: any) => sum + (m.paymentAmount || 0),
    0,
  );

  const isRejectedOrDeclined =
    bidStatus === "declined" || bidStatus === "rejected";
  const isAccepted = bidStatus === "accepted";
  const projectLocked = ["in_progress", "completed", "cancelled"].includes(
    projectStatus,
  );
  const canRespond = isAccepted
    ? false
    : isRejectedOrDeclined
      ? false
      : !projectLocked;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showError = (message: string) => {
    Toast.show({ type: "error", text1: "Error", text2: message });
  };

  const showSuccess = (message: string, description?: string) => {
    Toast.show({ type: "success", text1: message, text2: description });
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreateContract = async () => {
    setIsSubmitting(true);
    createContractMutation.mutate(
      { bidId },
      {
        onSuccess: () => {
          setIsSubmitting(false);
          router.push({
            pathname: "/projects/contractscreen",
            params: {
              companyName,
              bidId,
              proposedTimeline: bid.proposedTimeline,
              bidsData: JSON.stringify(bid),
              projectTitle,
              projectId,
            },
          });
        },
        onError: (err: any) => {
          setIsSubmitting(false);
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to create contract";
          showError(message);
        },
      },
    );
  };

  const handleConfirmAccept = async () => {
    setIsAccepting(true);
    try {
      const result = await respondToBidMutation.mutateAsync({
        status: "accepted",
        bidId,
      });
      const ok =
        result?.data?.success === true ||
        result?.data?.statusCode === 200 ||
        result?.statusCode === 201;
      if (ok) {
        showSuccess(
          "Bid Accepted Successfully",
          "You can now move to sign the contract agreement",
        );
        setIsAcceptModalVisible(false);
      } else {
        showError("Failed to accept bid. Please try again.");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      showError(message);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleConfirmDecline = async () => {
    setIsDeclining(true);
    try {
      await respondToBidMutation.mutateAsync({ status: "rejected", bidId });
      showSuccess("Bid Declined", "The builder has been notified");
      setIsDeclineModalVisible(false);
      router.back();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to decline bid. Please try again.";
      showError(message);
    } finally {
      setIsDeclining(false);
    }
  };

  const handleAcceptPress = () => setIsAcceptModalVisible(true);
  const handleDeclinePress = () => setIsDeclineModalVisible(true);

  const handleRevision = () => {
    router.push({
      pathname: "/(clients)/reviewsummary/reviewsummary",
      params: { bidId, companyName, projectTitle, projectId },
    });
  };

  const isLoadingContract = isSubmitting || createContractMutation.isPending;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <AppLayout screenName="Project Proposal">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 40,
          }}
        >
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
              <Text className="mt-4 text-gray-500 font-inter">
                Loading proposal...
              </Text>
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center py-20 px-4">
              <Text className="text-red-500 text-center font-inter mb-4">
                Failed to load proposal. Please try again.
              </Text>
              <PrimaryButton
                onPress={refetch}
                title="Retry"
                textColor="white"
                backgroundColor="#2563eb"
              />
            </View>
          ) : (
            <>
              {/* Header */}
              <View className="bg-white rounded-2xl p-5 mb-4">
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="text-xl font-interbold text-gray-900 flex-1 mr-3">
                    {companyName}
                  </Text>
                  <StatusBadge status={bidStatus} />
                </View>

                <View className="flex-row items-center mb-2">
                  <Text className="text-[14px] text-gray-500 font-inter">
                    Bid Amount:{" "}
                  </Text>
                  <Text className="text-[14px] font-interbold text-green-600">
                    {formatCurrency(bid.bidAmount || 0, currencySymbol)}
                  </Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <Text className="text-[14px] text-gray-500 font-inter">
                    Proposed Timeline:{" "}
                  </Text>
                  <Text className="text-[14px] font-interbold text-gray-900">
                    {bid.proposedTimeline || "—"}
                  </Text>
                </View>

                {bid.proposal && (
                  <View className="bg-gray-50 rounded-xl p-3 mt-1">
                    <Text className="text-[13px] text-gray-600 font-inter leading-5">
                      {bid.proposal}
                    </Text>
                  </View>
                )}
              </View>

              {/* Project Milestones Breakdown */}
              <SectionCard title="Project Breakdown">
                {milestones.length > 0 ? (
                  <>
                    {milestones.map((item: any, index: number) => (
                      <BreakdownRow
                        key={index}
                        label={item.milestoneName}
                        amount={item.paymentAmount}
                        currencySymbol={currencySymbol}
                        isLast={index === milestones.length - 1}
                      />
                    ))}
                    <View className="flex-row justify-between pt-4 mt-1 border-t-2 border-gray-900">
                      <Text className="text-base font-interbold text-gray-900">
                        Total
                      </Text>
                      <Text className="text-base font-interbold text-gray-900">
                        {formatCurrency(totalAmount, currencySymbol)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text className="text-sm text-gray-400 text-center py-4 font-inter">
                    No breakdown available
                  </Text>
                )}
              </SectionCard>

              {/* Project Timeline */}
              <SectionCard title="Project Timeline">
                {milestones.length > 0 ? (
                  milestones.map((item: any, index: number) => (
                    <TimelineItem
                      key={index}
                      milestone={item.milestoneName}
                      date={item.completionDate}
                      index={index}
                      isLast={index === milestones.length - 1}
                    />
                  ))
                ) : (
                  <Text className="text-sm text-gray-400 text-center py-4 font-inter">
                    No timeline available
                  </Text>
                )}
              </SectionCard>

              {/* Contract Actions */}
              {isAccepted && (
                <View className="mt-2">
                  {!hasCreatedContract ? (
                    <GradientButton
                      loading={isLoadingContract}
                      onPress={handleCreateContract}
                      title="Generate Contract"
                    />
                  ) : (
                    <GradientButton
                      onPress={() => {
                        router.push({
                          pathname: "/projects/contractscreen",
                          params: {
                            companyName,
                            bidId,
                            proposedTimeline: bid.proposedTimeline,
                            bidsData: JSON.stringify(bid),
                            projectTitle,
                            projectId,
                          },
                        });
                      }}
                      title="Go to Contract Page"
                    />
                  )}
                </View>
              )}

              {/* Rejected Banner */}
              {isRejectedOrDeclined && <RejectedBanner />}

              {/* Action Buttons */}
              {canRespond && (
                <View className="gap-3 mt-2">
                  <GradientButton
                    title="Accept Proposal"
                    onPress={handleAcceptPress}
                    loading={isAccepting}
                    disabled={isAccepting}
                  />
                  <PrimaryButton
                    onPress={handleDeclinePress}
                    title="Decline Proposal"
                    textColor="#374151"
                    backgroundColor="white"
                    loading={isDeclining}
                    disabled={isDeclining}
                  />
                  <TouchableOpacity
                    onPress={handleRevision}
                    className="items-center py-3"
                  >
                    <Text className="font-inter text-gray-400 text-sm">
                      Not satisfied?{" "}
                      <Text className="text-green-600 font-interbold">
                        Request a revision
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </AppLayout>

      {/* Accept Proposal Modal */}
      <AcceptProposalModal
        visible={isAcceptModalVisible}
        companyName={companyName ?? ""}
        bidAmount={bid.bidAmount ?? 0}
        onCancel={() => setIsAcceptModalVisible(false)}
        onConfirm={handleConfirmAccept}
        isLoading={isAccepting}
      />

      <DeclineProposalModal
        visible={isDeclineModalVisible}
        companyName={companyName ?? ""}
        onCancel={() => setIsDeclineModalVisible(false)}
        onConfirm={handleConfirmDecline}
        isLoading={isDeclining}
      />
    </>
  );
}
