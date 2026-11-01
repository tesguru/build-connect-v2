import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Building2,
  Calendar,
  FileText,
  MapPin,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";

import AppLayout from "@/components/Layouts/AppLayout";
import { useCurrencyStore } from "@/store/useCurrencyStore";

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStatusConfig(status: string | null | undefined) {
  const normalized = status?.toLowerCase();
  switch (normalized) {
    case "generated":
      return {
        dot: "bg-amber-400",
        label: "Generated",
        labelColor: "text-amber-500",
      };
    case "builder_signed":
      return {
        dot: "bg-purple-400",
        label: "Builder Signed",
        labelColor: "text-purple-500",
      };
    case "client_signed":
      return {
        dot: "bg-blue-400",
        label: "Client Signed",
        labelColor: "text-blue-500",
      };
    case "active":
      return {
        dot: "bg-green-400",
        label: "Active",
        labelColor: "text-green-500",
      };
    default:
      return {
        dot: "bg-gray-400",
        label: status || "—",
        labelColor: "text-gray-500",
      };
  }
}

function safeParse(value: any) {
  if (typeof value !== "string") {
    return value || {};
  }
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export default function ClientContractViewScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { companyName, projectTitle, bidsData, contractData } =
    useLocalSearchParams<{
      companyName: string;
      projectTitle: string;
      bidsData: string;
      contractData: string;
    }>();
  const { currencySymbol } = useCurrencyStore();

  const formatAmount = (value: any) => {
    if (!value) return "—";
    const amount = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(amount)) return "—";
    return `${currencySymbol}${amount.toLocaleString("en-NG")}`;
  };

  const bid = safeParse(bidsData);
  const contract = safeParse(contractData);
  const milestones = bid?.milestones || [];

  const statusConfig = getStatusConfig(contract?.status);
  const isActive = contract?.status?.toLowerCase() === "active";
  const isClientSigned = ["client_signed", "active"].includes(
    contract?.status?.toLowerCase(),
  );
  const isBuilderSigned = [
    "builder_signed",
    "client_signed",
    "active",
  ].includes(contract?.status?.toLowerCase());

  const timelineSteps = [
    {
      label: "Contract Generated",
      sub: "Contract was created and ready",
      date: contract?.createdAt,
      done: true,
    },
    {
      label: isBuilderSigned ? "Builder Signed" : "Awaiting builder signature",
      sub: isBuilderSigned
        ? "Builder has signed the contract"
        : "Waiting on the builder to sign",
      date: contract?.contractorSignedAt,
      done: isBuilderSigned,
    },
    {
      label: isClientSigned ? "Client Signed" : "Awaiting client signature",
      sub: isClientSigned
        ? "You have signed the contract"
        : "Waiting on you to sign",
      date: contract?.clientSignedAt,
      done: isClientSigned,
    },
    {
      label: "Contract Active",
      sub: "Both parties have signed",
      date: contract?.activatedAt,
      done: isActive,
    },
  ];

  const canDownload =
    contract?.document?.publicUrl &&
    !contract.document.publicUrl.includes("localhost");

  const downloadFilename = canDownload
    ? contract.document.publicUrl.split("/").pop()?.split("?")[0]
    : "";

  const handleDownload = () => {
    if (contract?.document?.publicUrl) {
      Linking.openURL(contract.document.publicUrl);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <AppLayout screenName="Contract">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Contract Overview Card ── */}
        <View className="pt-4 bg-white m-4 rounded-xl">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <View className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
              <FileText size={13} color="#64748B" />
              <Text className="text-slate-500 text-xs font-inter">
                Contract
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
              <Text
                className={`text-xs font-interbold ${statusConfig.labelColor}`}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>

          <Text className="font-interbold text-xl px-4 pb-1" numberOfLines={2}>
            {contract?.project?.title}
          </Text>

          <View className="flex-row items-center gap-1.5 px-4 pb-4">
            <MapPin size={13} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm font-inter">
              {contract?.project?.location}
            </Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between items-center">
            <Text className="font-inter text-gray-500">Contract Value</Text>
            <Text className="font-interbold text-lg">
              {formatAmount(bid?.bidAmount ?? contract?.bidAmount)}
            </Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between items-center">
            <Text className="font-inter text-gray-500">Proposed Timeline</Text>
            <Text className="font-interbold text-base">
              {bid?.proposedTimeline || "—"}
            </Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between items-center">
            <Text className="font-inter text-gray-500">Date Issued</Text>
            <View className="flex-row items-center gap-1.5">
              <Calendar size={14} color="#9CA3AF" />
              <Text className="font-interbold text-base">
                {formatDate(contract?.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Parties Involved Card ── */}
        <View className="bg-white mx-4 mb-4 rounded-xl">
          <Text className="font-interbold px-4 pt-4 text-xl pb-3">
            Parties Involved
          </Text>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row items-center gap-3">
            <View className="bg-blue-50 rounded-lg p-2">
              <User size={16} color="#2463EB" />
            </View>
            <View className="flex-1">
              <Text className="font-interbold text-blue-600 text-xs mb-1">
                CLIENT
              </Text>
              <Text className="font-interbold text-base">
                {contract?.client?.name || "—"}
              </Text>
              {contract?.client?.email ? (
                <Text className="text-gray-400 text-xs font-inter mt-0.5">
                  {contract.client.email}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row items-center gap-3">
            <View className="bg-green-50 rounded-lg p-2">
              <Building2 size={16} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="font-interbold text-green-600 text-xs mb-1">
                CONTRACTOR
              </Text>
              <Text className="font-interbold text-base">
                {companyName || "—"}
              </Text>
              {contract?.contractor?.email ? (
                <Text className="text-gray-400 text-xs font-inter mt-0.5">
                  {contract.contractor.email}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── Milestones Card ── */}
        {milestones.length > 0 && (
          <View className="bg-white mx-4 mb-4 rounded-xl">
            <View className="flex-row justify-between items-center px-4 pt-4 pb-3">
              <Text className="font-interbold text-xl">Milestones</Text>
              <View className="bg-blue-50 rounded-full px-2.5 py-1">
                <Text className="text-blue-600 text-xs font-interbold">
                  {milestones.length} total
                </Text>
              </View>
            </View>

            <View className="h-px bg-gray-100 mx-4" />

            <View className="px-4 py-2">
              {milestones.map((milestone: any, index: number) => (
                <View
                  key={index}
                  className={`flex-row gap-3 py-3 ${
                    index < milestones.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center mt-0.5">
                    <Text className="text-white text-xs font-interbold">
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-interbold text-sm" numberOfLines={1}>
                      {milestone.milestoneName}
                    </Text>
                    {milestone.description ? (
                      <Text
                        className="text-gray-400 text-xs font-inter mt-0.5"
                        numberOfLines={2}
                      >
                        {milestone.description}
                      </Text>
                    ) : null}
                    <View className="flex-row items-center gap-2 mt-2">
                      <View className="bg-gray-100 rounded-md px-2 py-1">
                        <Text className="text-gray-500 text-xs font-inter">
                          Due: {formatDate(milestone.completionDate)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text className="font-interbold text-sm">
                    {formatAmount(milestone.paymentAmount)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Contract Timeline Card ── */}
        <View className="mx-4 mb-4 bg-white rounded-xl p-4">
          <Text className="font-interbold text-xl mb-4">Contract Timeline</Text>
          <View className="h-px bg-gray-100 mb-4" />

          {timelineSteps.map((step, index) => (
            <View key={index} className="flex-row gap-4">
              <View className="items-center">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    step.done ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  {step.done ? (
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      ✓
                    </Text>
                  ) : (
                    <Text style={{ color: "#94A3B8", fontSize: 10 }}>○</Text>
                  )}
                </View>
                {index < timelineSteps.length - 1 && (
                  <View
                    className={`w-0.5 flex-1 my-1 ${
                      step.done ? "bg-blue-100" : "bg-gray-100"
                    }`}
                    style={{ minHeight: 40 }}
                  />
                )}
              </View>
              <View className="flex-1 pb-6">
                <Text
                  className={`font-interbold text-base ${
                    step.done ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </Text>
                <Text className="text-gray-400 text-sm font-inter mt-0.5 mb-2">
                  {step.sub}
                </Text>
                {step.done && step.date && (
                  <View className="bg-blue-50 self-start rounded-lg px-3 py-1.5">
                    <Text className="text-blue-600 text-sm font-interbold">
                      {formatDate(step.date)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* ── Footer Notice ── */}
        <View className="mx-4 mb-4 bg-gray-50 rounded-xl py-4 px-4">
          <Text className="text-gray-400 text-xs text-center font-inter">
            This contract is legally binding once signed by both parties.
          </Text>
          <Text className="text-gray-400 text-xs text-center font-inter mt-1">
            Contract ID: ...{contract?.id?.slice(-7) || "—"}
          </Text>
        </View>
      </ScrollView>
    </AppLayout>
  );
}
