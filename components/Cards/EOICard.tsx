import { useRouter } from "expo-router";
import {
  Building2,
  CheckCircle2,
  FileText,
  Inbox,
  MapPin,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

const STATUS_CONFIG: Record<
  string,
  { dot: string; text: string; label: string }
> = {
  approved: { dot: "#10b981", text: "text-emerald-600", label: "Approved" },
  accepted: { dot: "#10b981", text: "text-emerald-600", label: "Approved" },
  pending: { dot: "#f59e0b", text: "text-amber-600", label: "Pending" },
  rejected: { dot: "#ef4444", text: "text-red-500", label: "Rejected" },
};

function getStatusConfig(status: string | null | undefined) {
  const normalized = status?.toLowerCase();
  if (normalized && STATUS_CONFIG[normalized]) return STATUS_CONFIG[normalized];
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Pending";
  return { dot: "#9ca3af", text: "text-gray-500", label };
}

function formatDate(date: string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type EOICardProps = {
  eoiId: string;
  projectId: string;
  projectName: string;
  projectLocation?: string;
  projectStatus?: string;
  status?: string;
  message?: string;
  reviewNote?: string;
  createdAt?: string;
};

export default function EOICard({
  eoiId,
  projectId,
  projectName,
  projectLocation,
  projectStatus,
  status = "pending",
  message,
  reviewNote,
  createdAt,
}: EOICardProps) {
  const router = useRouter();
  const [showReviewNote, setShowReviewNote] = useState(false);

  const normalizedStatus = status?.toLowerCase();
  const isApproved =
    normalizedStatus === "approved" || normalizedStatus === "accepted";
  const isRejected = normalizedStatus === "rejected";
  const statusConfig = getStatusConfig(status);

  const normalizedProjectStatus = projectStatus?.toLowerCase();
  const hasProjectStarted =
    normalizedProjectStatus === "started" ||
    normalizedProjectStatus === "in_progress" ||
    normalizedProjectStatus === "active";

  const viewProjectMessage = isApproved
    ? "You've been approved to bid on this project."
    : "Your expression of interest was not approved.";

  const onViewProject = () => {
    router.push({
      pathname: "/projectdetails/projectdetails",
      params: { projectId, eoiId },
    });
  };

  const showViewProjectButton = !isRejected && !hasProjectStarted;
  const showStartedText = !isRejected && hasProjectStarted;

  return (
    <View
      className="bg-white rounded-2xl p-4"
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
      {/* ── Header ── */}
      <View className="flex-row items-start gap-3">
        <View
          className="bg-gray-100 items-center justify-center"
          style={{ width: 56, height: 56, borderRadius: 14 }}
        >
          <Inbox size={20} color="#64748B" />
          <Text className="text-gray-400 text-[9px] font-interbold mt-0.5">
            EOI
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <Text
              className="font-interbold text-gray-900 text-base flex-1 mr-2"
              numberOfLines={1}
            >
              {projectName}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <View
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: statusConfig.dot }}
              />
              <Text className={`font-inter text-xs ${statusConfig.text}`}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {projectLocation && (
            <View className="flex-row items-center gap-1 mt-1">
              <MapPin size={12} color="#9CA3AF" />
              <Text className="text-gray-400 text-xs font-inter">
                {projectLocation}
              </Text>
            </View>
          )}

          {createdAt && (
            <Text className="text-gray-400 text-xs font-inter mt-1">
              Submitted {formatDate(createdAt)}
            </Text>
          )}
        </View>
      </View>

      {message && (
        <Text
          className="text-gray-600 font-inter text-sm mt-3"
          numberOfLines={2}
        >
          {message}
        </Text>
      )}

      {/* ── Actions ── */}
      {(showViewProjectButton || showStartedText || reviewNote) && (
        <>
          <View className="h-px bg-gray-100 mt-3 mb-3" />
          <View className="flex-row items-center gap-3">
            {showStartedText && (
              <Text className="flex-1 text-gray-400 font-inter text-sm text-center">
                Project has started
              </Text>
            )}

            {showViewProjectButton && (
              <TouchableOpacity
                onPress={onViewProject}
                activeOpacity={0.8}
                className="flex-1 bg-blue-700 rounded-xl py-3 flex-row items-center justify-center gap-2"
              >
                <FileText size={16} color="#fff" />
                <Text className="text-white font-inter text-sm">
                  View Project
                </Text>
              </TouchableOpacity>
            )}

            {reviewNote && (
              <TouchableOpacity
                onPress={() => setShowReviewNote(true)}
                activeOpacity={0.8}
                className="flex-1 bg-emerald-50 rounded-xl py-3 flex-row items-center justify-center gap-2"
                style={{ borderWidth: 1, borderColor: "#a7f3d0" }}
              >
                <CheckCircle2 size={16} color="#059669" />
                <Text className="text-emerald-700 font-inter text-sm">
                  Review Note
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {/* ── Review Note Bottom Sheet ── */}
      <Modal
        visible={showReviewNote}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReviewNote(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 10,
              paddingHorizontal: 20,
              paddingBottom: 32,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: "#e2e8f0",
                alignSelf: "center",
                marginBottom: 16,
              }}
            />

            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: "#ecfdf5",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle2 size={16} color="#059669" />
                </View>
                <Text className="font-intersemibold text-lg text-gray-900">
                  Review Note
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowReviewNote(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#f1f5f9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <View
              className="flex-row items-center gap-2"
              style={{
                backgroundColor: "#eff6ff",
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Building2 size={16} color="#2463EB" />
              <Text
                className="text-blue-700 font-interbold text-sm flex-1"
                numberOfLines={1}
              >
                {projectName}
              </Text>
            </View>

            <View className="h-px bg-gray-100 mb-4" />

            <Text
              className="font-inter text-sm text-slate-700"
              style={{ lineHeight: 20 }}
            >
              {reviewNote ||
                (isApproved
                  ? "Your interest has been accepted"
                  : viewProjectMessage)}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
