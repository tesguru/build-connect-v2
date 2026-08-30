import { useAuthStore } from "@/store/Authstore";
import { Calendar, ChevronRight, MapPin, User } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type Invitation = {
  id: string;
  project: {
    id: string;
    title: string;
    location?: string;
    description?: string;
  };

  invitedBy?: {
    firstName: string;
    lastName: string;
  } | null;

  contractor?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  } | null;
  status: "pending" | "accepted" | "declined" | "expired";
  expiresAt: string;
  message?: string;
  sentAt?: string;
  respondedAt?: string;
  createdAt?: string;
};

type Props = {
  invitation: Invitation;
  onAccept?: (id: string, projectId: string) => void;
  onDecline?: (id: string) => void;
  onViewProject?: (projectId: string) => void;
  isResponding?: boolean;
  respondingAction?: "accepted" | "declined" | null;
};

const STATUS_STYLES: Record<
  string,
  { dot: string; text: string; label: string }
> = {
  pending: { dot: "bg-amber-400", text: "text-amber-500", label: "Pending" },
  accepted: { dot: "bg-green-400", text: "text-green-500", label: "Accepted" },
  declined: { dot: "bg-red-400", text: "text-red-500", label: "Declined" },
  expired: { dot: "bg-gray-300", text: "text-gray-400", label: "Expired" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InvitationCard({
  invitation,
  onAccept,
  onDecline,
  onViewProject,
  isResponding = false,
  respondingAction = null,
}: Props) {
  const { user } = useAuthStore();
  const isClient = user?.role === "client";

  const { project, invitedBy, contractor, status, expiresAt, id } = invitation;
  const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.pending;

  // Client sees who they invited (contractor)
  // Builder sees who invited them (invitedBy)
  const personName = isClient
    ? contractor
      ? `${contractor.firstName ?? ""} ${contractor.lastName ?? ""}`.trim()
      : "Unknown"
    : invitedBy
      ? `${invitedBy.firstName ?? ""} ${invitedBy.lastName ?? ""}`.trim()
      : "Unknown";

  const isAccepting = isResponding && respondingAction === "accepted";
  const isDeclining = isResponding && respondingAction === "declined";

  return (
    <View className="bg-white rounded-3xl mx-1 my-2 p-5 shadow-md shadow-black/10">
      {/* ── Title + Status badge ── */}
      <View className="flex-row items-center justify-between mb-4">
        <Text
          className="text-gray-900 text-lg font-interbold flex-1 mr-3"
          numberOfLines={1}
        >
          {project?.name ?? "—"}
        </Text>

        <View className="flex-row items-center gap-2">
          <View className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
          <Text
            className={`text-xs font-inter font-semibold ${statusStyle.text}`}
          >
            {statusStyle.label}
          </Text>
        </View>
      </View>

      {/* ── Location ── */}
      {project?.location ? (
        <View className="flex-row items-center gap-2 mb-2">
          <MapPin size={14} color="#9CA3AF" />
          <Text className="text-gray-500 font-inter text-sm">
            {project.location}
          </Text>
        </View>
      ) : null}

      {/* ── Person label — client: "Invited: <contractor>", builder: "Invited by <person>" ── */}
      <View className="flex-row items-center gap-2 mb-2">
        <User size={14} color="#9CA3AF" />
        <Text className="text-gray-500 font-inter text-sm">
          {isClient ? `Invited: ${personName}` : `Invited by ${personName}`}
        </Text>
      </View>

      {/* ── Expires ── */}
      <View className="flex-row items-center gap-2 mb-4">
        <Calendar size={14} color="#9CA3AF" />
        <Text className="text-gray-400 font-inter text-xs">
          Expires {expiresAt ? formatDate(expiresAt) : "—"}
        </Text>
      </View>

      {/* ── Divider ── */}
      <View className="h-px bg-gray-100 mb-4" />

      {/* ── Action Buttons ── */}
      <View className="flex-row items-center gap-3">
        {/* 
          Builder only — Accept / Decline + View Project
          Client sees nothing (they sent the invite, nothing to action)
        */}
        {!isClient && (
          <>
            {status === "pending" && (
              <>
                {/* Accept */}
                <TouchableOpacity
                  onPress={() => onAccept?.(id, project.id)}
                  disabled={isResponding}
                  className={`flex-row items-center gap-2 px-5 py-2 rounded-full ${
                    isResponding ? "bg-blue-400" : "bg-blue-700"
                  }`}
                >
                  {isAccepting && (
                    <ActivityIndicator size="small" color="#fff" />
                  )}
                  <Text className="text-white text-sm font-inter">
                    {isAccepting ? "Accepting..." : "Accept"}
                  </Text>
                </TouchableOpacity>

                {/* Decline */}
                <TouchableOpacity
                  onPress={() => onDecline?.(id)}
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

            <TouchableOpacity
              onPress={() => onViewProject?.(project?.id)}
              className="ml-auto flex-row items-center gap-1"
            >
              <Text className="text-indigo-600 text-sm font-inter">
                View Project
              </Text>
              <ChevronRight size={15} color="#4F46E5" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
