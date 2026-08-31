import AppLayout from "@/components/Layouts/AppLayout";
import { useBids } from "@/core/hooks/UseBids";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── Sub-components ────────────────────────────────────────────────────────────
const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View className="bg-white rounded-2xl p-5 mb-4">
    <Text className="text-lg font-interbold text-gray-900 mb-4">{title}</Text>
    {children}
  </View>
);

const BreakdownRow = ({
  label,
  amount,
  isLast,
  currencySymbol,
}: {
  label: string;
  amount: string;
  isLast?: boolean;
  currencySymbol: string;
}) => {
  const formatAmount = (value: number) =>
    `${currencySymbol}${value.toLocaleString()}`;

  return (
    <View
      className={`flex-row justify-between py-3 ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      <Text className="text-[15px] text-gray-600 font-inter flex-1 mr-4">
        {label}
      </Text>
      <Text className="text-[15px] font-interbold text-gray-900">
        {formatAmount(parseFloat(amount || "0"))}
      </Text>
    </View>
  );
};

const TimelineItem = ({
  milestone,
  date,
  index,
  isLast,
}: {
  milestone: string;
  date: string;
  index: number;
  isLast: boolean;
}) => {
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
      <View className={`flex-1 ${!isLast ? "pb-5" : ""}`}>
        <Text className="text-[15px] font-interbold text-gray-900">
          {milestone}
        </Text>
        <Text className="text-[13px] text-gray-500 font-inter mt-0.5">
          {formatDate(date)}
        </Text>
      </View>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const ViewBidDetails = () => {
  const { bidId, currency } = useLocalSearchParams<{
    bidId: string;
    currency?: string;
  }>();

  const { singleBidQuery } = useBids();
  const { data, isLoading, error } = singleBidQuery(bidId);
  const router = useRouter();
  const { setCurrency, currencySymbol } = useCurrencyStore();

  useEffect(() => {
    if (currency) {
      setCurrency(currency);
    }
  }, [currency, setCurrency]);
  const bidsData = data?.data?.data ?? {};
  const projectTitle = bidsData?.project?.name ?? "Review summary";
  const handleRevision = () =>
    router.push({
      pathname: "/(builders)/reviewsummary/reviewsummary",
      params: { projectTitle, bidId, currencySymbol },
    });

  if (isLoading) {
    return (
      <AppLayout screenName="Bid Details">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-500 font-inter">
            Loading bid details...
          </Text>
        </View>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout screenName="Bid Details">
        <View className="flex-1 justify-center items-center py-20 px-6">
          <Text className="text-red-500 text-center font-inter">
            Failed to load bid details. Please try again.
          </Text>
        </View>
      </AppLayout>
    );
  }

  const milestones = bidsData.milestones ?? [];

  const bidStatus = bidsData.status?.toLowerCase();
  const firstName = bidsData.contractor?.firstName ?? "";
  const lastName = bidsData.contractor?.lastName ?? "";
  const companyName = `${firstName} ${lastName}`.trim() || "Unknown Contractor";

  const totalAmount = milestones.reduce(
    (sum: number, item: any) => sum + parseFloat(item.paymentAmount || 0),
    0,
  );

  return (
    <AppLayout screenName="Bid Details">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 40,
        }}
      >
        {/* ── Bid Overview ── */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <View className="flex-row justify-between items-start mb-3">
            <Text className="text-xl font-interbold text-gray-900 flex-1 mr-3">
              {companyName}
            </Text>
            <View
              className={`rounded-full px-3 py-1 ${
                bidStatus === "accepted"
                  ? "bg-green-50"
                  : bidStatus === "declined" || bidStatus === "rejected"
                    ? "bg-red-50"
                    : "bg-blue-50"
              }`}
            >
              <Text
                className={`text-xs font-interbold capitalize ${
                  bidStatus === "accepted"
                    ? "text-green-600"
                    : bidStatus === "declined" || bidStatus === "rejected"
                      ? "text-red-500"
                      : "text-blue-600"
                }`}
              >
                {bidsData.status || "Pending"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-2">
            <Text className="text-[14px] text-gray-500 font-inter">
              Bid Amount:{" "}
            </Text>
            <Text className="text-[14px] font-interbold text-green-600">
              {currencySymbol}
              {parseFloat(bidsData.bidAmount || "0").toLocaleString()}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <Text className="text-[14px] text-gray-500 font-inter">
              Proposed Timeline:{" "}
            </Text>
            <Text className="text-[14px] font-interbold text-gray-900">
              {bidsData.proposedTimeline ?? "—"}
            </Text>
          </View>

          {!!bidsData.proposal && (
            <View className="bg-gray-50 rounded-xl p-3 mt-1">
              <Text className="text-[13px] text-gray-600 font-inter leading-5">
                {bidsData.proposal}
              </Text>
            </View>
          )}
        </View>

        {/* ── Project Breakdown ── */}
        <SectionCard title="Project Breakdown">
          {milestones.length > 0 ? (
            <>
              {milestones.map((item: any, index: number) => (
                <BreakdownRow
                  key={index}
                  label={item.milestoneName}
                  amount={item.paymentAmount}
                  isLast={index === milestones.length - 1}
                  currencySymbol={currencySymbol}
                />
              ))}
              <View className="flex-row justify-between pt-4 mt-1 border-t-2 border-gray-900">
                <Text className="text-base font-interbold text-gray-900">
                  Total
                </Text>
                <Text className="text-base font-interbold text-gray-900">
                  {currencySymbol}
                  {totalAmount.toLocaleString()}
                </Text>
              </View>
            </>
          ) : (
            <Text className="text-sm text-gray-400 text-center py-4 font-inter">
              No breakdown available
            </Text>
          )}
        </SectionCard>

        {/* ── Project Timeline ── */}
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
      </ScrollView>
    </AppLayout>
  );
};

export default ViewBidDetails;
