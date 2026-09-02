import { useAuthStore } from "@/store/Authstore";
import { Calendar, ChevronRight, MapPin, User } from "lucide-react-native";
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
  { dot: string; text: string; label: string }
> = {
  pending: { dot: "bg-amber-400", text: "text-amber-500", label: "Pending" },
  accepted: { dot: "bg-green-400", text: "text-green-500", label: "Accepted" },
  declined: { dot: "bg-red-400", text: "text-red-500", label: "Declined" },
  expired: { dot: "bg-gray-300", text: "text-gray-400", label: "Expired" },
};

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Invitation = {
  id: string;
  project: {
    id: string;
    name: string;
    hasStarted?: boolean;
    location?: string;
  } | null;
  invitedBy: { name: string; firstName?: string; lastName?: string } | null;
  contractor: { name: string; firstName?: string; lastName?: string } | null;
  status: "pending" | "accepted" | "declined" | "expired";
  expiresAt: string | null;
  bidSubmissionDeadline: string | null;
};

type InvitationCardProps = {
  invitation: Invitation;
  onAccept?: () => void;
  onDecline?: (reason?: string) => void;
  onViewProject?: () => void;
  isResponding?: boolean;
  respondingAction?: "accept" | "decline" | null;
};

export default function InvitationCard({
  invitation,
  onAccept,
  onDecline,
  onViewProject,
  isResponding = false,
  respondingAction = null,
}: InvitationCardProps) {
  const role = useAuthStore().user?.role;
  const isClient = role === "client";
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const statusConfig =
    STATUS_CONFIG[invitation.status] || STATUS_CONFIG.pending;
  const isPending = invitation.status === "pending";
  const isAccepted = invitation.status === "accepted";

  // Get person name based on role
  const getPersonName = () => {
    if (isClient) {
      const contractor = invitation.contractor;
      if (contractor?.firstName && contractor?.lastName) {
        return `${contractor.firstName} ${contractor.lastName}`;
      }
      return contractor?.name || "Unknown";
    } else {
      const invitedBy = invitation.invitedBy;
      if (invitedBy?.firstName && invitedBy?.lastName) {
        return `${invitedBy.firstName} ${invitedBy.lastName}`;
      }
      return invitedBy?.name || "Unknown";
    }
  };

  const personName = getPersonName();

  // Title: clients see the contractor's name, builders/contractors see the project name
  const cardTitle = isClient
    ? personName
    : invitation.project?.name || "Untitled Project";

  const handleDeclineConfirm = () => {
    if (onDecline) onDecline(declineReason);
    setShowDeclineModal(false);

    setDeclineReason("");
  };

  const isAccepting = isResponding && respondingAction === "accept";
  const isDeclining = isResponding && respondingAction === "decline";

  return (
    <>
      <View className="bg-white rounded-3xl mx-3 my-2 p-4 shadow-md shadow-black/10">
        {/* ── Title + Status badge ── */}
        <View className="flex-row items-center justify-between mb-4">
          <Text
            className="text-gray-900 text-lg font-interbold flex-1 mr-3"
            numberOfLines={1}
          >
            {cardTitle}
          </Text>

          <View className="flex-row items-center gap-2">
            <View className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
            <Text
              className={`text-xs font-inter font-semibold ${statusConfig.text}`}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* ── Location ── */}
        {invitation.project?.location ? (
          <View className="flex-row items-center gap-2 mb-2">
            <MapPin size={14} color="#9CA3AF" />
            <Text className="text-gray-500 font-inter text-sm">
              {invitation.project.location}
            </Text>
          </View>
        ) : null}

        {/* ── Person label ── */}
        <View className="flex-row items-center gap-2 mb-2">
          <User size={14} color="#9CA3AF" />
          <Text className="text-gray-500 font-inter text-sm">
            {isClient ? `Invited: ${personName}` : `Invited by ${personName}`}
          </Text>
        </View>

        {/* ── Bid Deadline (only for pending invitations) ── */}
        {invitation.bidSubmissionDeadline && isPending && (
          <View className="flex-row items-center gap-2 mb-2">
            <Calendar size={14} color="#9CA3AF" />
            <Text className="text-gray-500 font-inter text-sm">
              Bid deadline: {formatDate(invitation.bidSubmissionDeadline)}
            </Text>
          </View>
        )}

        {/* ── Expires ── */}
        {invitation.expiresAt && isPending && (
          <View className="flex-row items-center gap-2 mb-4">
            <Calendar size={14} color="#9CA3AF" />
            <Text className="text-gray-400 font-inter text-xs">
              Expires {formatDate(invitation.expiresAt)}
            </Text>
          </View>
        )}

        {/* ── Divider ── */}
        <View className="h-px bg-gray-100 mb-4" />

        {/* ── Action Buttons ── */}
        <View className="flex-row items-center gap-3">
          {isPending && !isClient && (
            <>
              {/* Accept */}
              <TouchableOpacity
                onPress={onAccept}
                disabled={isResponding}
                className={`flex-row items-center gap-2 px-5 py-2 rounded-full ${
                  isResponding ? "bg-blue-400" : "bg-blue-700"
                }`}
              >
                {isAccepting && <ActivityIndicator size="small" color="#fff" />}
                <Text className="text-white text-sm font-inter">
                  {isAccepting ? "Accepting..." : "Accept"}
                </Text>
              </TouchableOpacity>

              {/* Decline */}
              <TouchableOpacity
                onPress={() => setShowDeclineModal(true)}
                disabled={isResponding}
                className={`flex-row items-center gap-2 border px-5 py-2 rounded-full ${
                  isResponding
                    ? "border-gray-100 bg-gray-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {isDeclining && (
                  <ActivityIndicator size="small" color="#9CA3AF" />
                )}
                <Text
                  className={`text-sm font-inter ${
                    isResponding ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {isDeclining ? "Declining..." : "Decline"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* View Project - show for accepted invitations or always for clients */}
          {(isAccepted || isClient) && (
            <TouchableOpacity
              onPress={onViewProject}
              className="ml-auto flex-row items-center gap-1"
            >
              <Text className="text-indigo-600 text-sm font-inter">
                {isAccepted && invitation.project?.hasStarted
                  ? "Project has started"
                  : "View Project"}
              </Text>
              {!isAccepted || !invitation.project?.hasStarted ? (
                <ChevronRight size={15} color="#4F46E5" />
              ) : null}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Decline Modal ── */}
      <Modal
        visible={showDeclineModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeclineModal(false)}
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
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-interbold text-lg text-gray-900">
                Decline Invitation
              </Text>
              <TouchableOpacity onPress={() => setShowDeclineModal(false)}>
                <Text
                  className="font-inter"
                  style={{ fontSize: 18, color: "#94a3b8" }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              className="font-inter text-sm text-gray-500 mb-4"
              style={{ lineHeight: 20 }}
            >
              Optionally let them know why you're declining this invitation.
            </Text>
            <TextInput
              value={declineReason}
              onChangeText={setDeclineReason}
              placeholder="Reason (optional)"
              multiline
              className="font-inter"
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
            <TouchableOpacity
              onPress={handleDeclineConfirm}
              style={{
                backgroundColor: "#ef4444",
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text className="text-white font-intersemibold">
                Confirm Decline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
