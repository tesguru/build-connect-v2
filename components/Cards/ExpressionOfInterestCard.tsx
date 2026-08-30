import { useProjects } from "@/core/hooks/useProjects";
import { useRouter } from "expo-router";
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
    bg: "#ecfdf5",
    border: "#a7f3d0",
    dot: "#10b981",
    text: "#059669",
    label: "Approved",
  },
  accepted: {
    bg: "#ecfdf5",
    border: "#a7f3d0",
    dot: "#10b981",
    text: "#059669",
    label: "Approved",
  },
  pending: {
    bg: "#fffbeb",
    border: "#fde68a",
    dot: "#f59e0b",
    text: "#d97706",
    label: "Pending",
  },
  rejected: {
    bg: "#fff1f2",
    border: "#fecaca",
    dot: "#ef4444",
    text: "#dc2626",
    label: "Rejected",
  },
};

function getStatusConfig(status: string | null | undefined) {
  const normalized = status?.toLowerCase();
  return (
    (normalized && STATUS_CONFIG[normalized]) || {
      bg: "#f8fafc",
      border: "#e2e8f0",
      dot: "#94a3b8",
      text: "#64748b",
      label: "Pending",
    }
  );
}

type Interest = {
  id: string;
  status: string;
  message?: string;
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
          iconBg: "#eff6ff",
          iconColor: "#1d4ed8",
          title: "Accept Interest",
          message: `Add a review note for ${displayName} (optional)`,
          confirmBg: "#1d4ed8",
          confirmLabel: "Yes, Accept",
          inputPlaceholder:
            "e.g. Great profile, looking forward to working together...",
        }
      : {
          iconBg: "#fff1f2",
          iconColor: "#dc2626",
          title: "Reject Interest",
          message: `Add a review note for ${displayName} (optional)`,
          confirmBg: "#dc2626",
          confirmLabel: "Yes, Reject",
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
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#f1f5f9",
          marginBottom: 12,
          shadowColor: "#94a3b8",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            padding: 14,
            gap: 12,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#eff6ff",
              borderWidth: 1,
              borderColor: "#bfdbfe",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#1d4ed8",
                fontFamily: "InterBold",
              }}
            >
              {initials}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity onPress={handleViewBuilder}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    fontFamily: "InterBold",
                    color: "#0f172a",
                  }}
                >
                  {displayName}
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: statusConfig.bg,
                  borderWidth: 1,
                  borderColor: statusConfig.border,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: statusConfig.dot,
                  }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: statusConfig.text,
                  }}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>
            {interest.message && (
              <Text
                style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}
                numberOfLines={2}
              >
                {interest.message}
              </Text>
            )}
          </View>
        </View>

        {isPending && (
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              padding: 14,
              paddingTop: 0,
            }}
          >
            <TouchableOpacity
              onPress={() => handleOpenModal("reject")}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: "#fecaca",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#dc2626",
                  fontFamily: "InterSemiBold",
                  fontWeight: "600",
                }}
              >
                Reject
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOpenModal("accept")}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                paddingVertical: 12,
                backgroundColor: "#1d4ed8",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#fff",
                  fontFamily: "InterSemiBold",
                  fontWeight: "600",
                }}
              >
                Accept
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
          <View
            style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20 }}
          >
            <Text
              style={{
                fontFamily: "InterBold",
                fontSize: 18,
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: 8,
              }}
            >
              {modalConfig.title}
            </Text>
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 13,
                color: "#64748b",
                marginBottom: 12,
              }}
            >
              {modalConfig.message}
            </Text>
            <TextInput
              value={reviewNote}
              onChangeText={setReviewNote}
              placeholder={modalConfig.inputPlaceholder}
              multiline
              style={{
                borderWidth: 1,
                borderColor: "#e2e8f0",
                borderRadius: 12,
                padding: 12,
                minHeight: 80,
                marginBottom: 16,
                textAlignVertical: "top",
              }}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setModalAction(null)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 12,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#475569",
                    fontFamily: "InterSemiBold",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={isConfirming}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: modalConfig.confirmBg,
                  borderRadius: 12,
                  paddingVertical: 14,
                  opacity: isConfirming ? 0.7 : 1,
                }}
              >
                {isConfirming ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#fff",
                      fontFamily: "InterSemiBold",
                      fontWeight: "600",
                    }}
                  >
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
