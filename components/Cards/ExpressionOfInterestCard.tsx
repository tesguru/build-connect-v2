import { useProjects } from "@/core/hooks/useProjects";
import { useRouter } from "expo-router";
import { CheckCircle2, ChevronRight, XCircle } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_CONFIG: Record<
  string,
  { bg: string; border: string; dot: string; text: string; label: string }
> = {
  approved: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    label: "Approved",
  },
  accepted: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    label: "Approved",
  },
  pending: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    text: "text-amber-600",
    label: "Pending",
  },
  rejected: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-red-500",
    text: "text-red-600",
    label: "Rejected",
  },
};

function getStatusConfig(status: string | null | undefined) {
  const normalized = status?.toLowerCase();
  return (
    (normalized && STATUS_CONFIG[normalized]) || {
      bg: "bg-gray-50",
      border: "border-gray-200",
      dot: "bg-gray-400",
      text: "text-gray-500",
      label: "Pending",
    }
  );
}

function formatSubmittedDate(date: string | null | undefined) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Interest = {
  id: string;
  status: string;
  message?: string;
  createdAt?: string | null;
  builder: {
    id: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
  } | null;
};

type ExpressionOfInterestCardProps = {
  interest: Interest;
  projectId: string;
};

export default function ExpressionOfInterestCard({
  interest,
  projectId,
}: ExpressionOfInterestCardProps) {
  const [modalAction, setModalAction] = useState<"accept" | "reject" | null>(
    null,
  );
  const [reviewNote, setReviewNote] = useState("");
  const router = useRouter();
  const { reviewExpressionOfInterestMutation } = useProjects();

  const builder = interest.builder;
  const fullName = [builder?.firstName, builder?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const displayName = fullName || builder?.businessName || "Unknown Builder";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const statusConfig = getStatusConfig(interest.status);
  const isPending = (interest.status || "").toLowerCase() === "pending";
  const submittedDate = formatSubmittedDate(interest.createdAt);

  const handleViewBuilder = () => {
    if (!builder?.id) return;
    router.push({
      pathname: "/projects/inviteprofilescreen",
      params: { projectId, contractorId: builder.id },
    });
  };

  const handleOpenModal = (action: "accept" | "reject") => {
    setReviewNote("");
    setModalAction(action);
  };

  const modalConfig =
    modalAction === "accept"
      ? {
          title: "Accept Interest",
          message: `Add a review note for ${displayName} (optional)`,
          confirmBg: "bg-blue-700",
          confirmLabel: "Accept",
          inputPlaceholder:
            "e.g. Great profile, looking forward to working together...",
        }
      : {
          title: "Reject Interest",
          message: `Add a review note for ${displayName} (optional)`,
          confirmBg: "bg-red-600",
          confirmLabel: "Reject",
          inputPlaceholder: "e.g. Not the right fit for this project...",
        };

  const handleConfirm = () => {
    if (!modalAction) return;
    reviewExpressionOfInterestMutation.mutate(
      {
        interestId: interest.id,
        projectId,
        action: modalAction === "accept" ? "approved" : "rejected",
        reviewNote: reviewNote.trim(),
      },
      {
        onSuccess: () => {
          setModalAction(null);
          setReviewNote("");
        },
      },
    );
  };

  const isConfirming = reviewExpressionOfInterestMutation.isPending;

  return (
    <>
      <View className="bg-white rounded-3xl p-5 mb-3 shadow-md shadow-black/10">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3.5 flex-1 mr-3">
            <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center">
              <Text className="text-lg font-interbold text-blue-700">
                {initials}
              </Text>
            </View>

            <View className="flex-1">
              <TouchableOpacity onPress={handleViewBuilder}>
                <Text
                  className="text-lg font-interbold text-gray-900"
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
              </TouchableOpacity>
              {submittedDate && (
                <Text className="text-sm text-gray-400 font-inter mt-0.5">
                  Submitted {submittedDate}
                </Text>
              )}
              {interest.message && (
                <Text
                  className="text-sm text-gray-500 font-inter mt-1"
                  numberOfLines={2}
                >
                  {interest.message}
                </Text>
              )}
            </View>
          </View>

          <View
            className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 border ${statusConfig.bg} ${statusConfig.border}`}
          >
            <View className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            <Text
              className={`text-sm font-inter font-semibold ${statusConfig.text}`}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View className="h-px bg-gray-100 mt-4 mb-4" />

        <View className="flex-row items-center gap-2.5">
          {isPending && (
            <>
              <TouchableOpacity
                onPress={() => handleOpenModal("accept")}
                className="flex-row items-center gap-2 bg-blue-700 rounded-full px-5 py-3"
              >
                <CheckCircle2 size={18} color="#fff" />
                <Text className="text-[12px] text-white font-intersemibold font-semibold">
                  Accept
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleOpenModal("reject")}
                className="flex-row items-center gap-2 rounded-full px-5 py-3 border border-gray-200"
              >
                <XCircle size={18} color="#94a3b8" />
                <Text className="text-[12px] text-gray-500 font-intersemibold font-semibold">
                  Reject
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={handleViewBuilder}
            className="flex-row items-center gap-0.5 ml-auto"
          >
            <Text className="text-[12px] text-indigo-600 font-intersemibold font-semibold">
              View Builder
            </Text>
            <ChevronRight size={17} color="#4f46e5" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={!!modalAction}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAction(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View className="bg-white rounded-2xl p-5">
            <Text className="font-interbold text-lg text-gray-900 mb-2">
              {modalConfig.title}
            </Text>
            <Text className="font-inter text-sm text-gray-500 mb-3">
              {modalConfig.message}
            </Text>
            <TextInput
              value={reviewNote}
              onChangeText={setReviewNote}
              placeholder={modalConfig.inputPlaceholder}
              multiline
              className="font-inter border border-gray-200 rounded-xl p-3 mb-4"
              style={{ minHeight: 80, textAlignVertical: "top" }}
            />
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => setModalAction(null)}
                className="flex-1 items-center justify-center rounded-xl py-3.5 border border-gray-200"
              >
                <Text className="text-sm text-slate-600 font-intersemibold font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={isConfirming}
                activeOpacity={0.85}
                className={`flex-1 items-center justify-center rounded-xl py-3.5 ${modalConfig.confirmBg} ${
                  isConfirming ? "opacity-70" : ""
                }`}
              >
                {isConfirming ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-sm text-white font-intersemibold font-semibold">
                    {modalConfig.confirmLabel}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
