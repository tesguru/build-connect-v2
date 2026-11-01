import AppLayout from "@/components/Layouts/AppLayout";
import { useAuth } from "@/core/hooks/useAuth";
import { handleApiError } from "@/core/utils/handleapierror";
import {
    AlertTriangle,
    CalendarDays,
    Clock,
    ShieldAlert,
    Trash2,
    X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getDeletionStatusConfig = (status?: string) => {
  const s = status?.toLowerCase();
  if (s === "pending")
    return {
      dot: "bg-amber-400",
      label: "Deletion Pending",
      labelColor: "text-amber-600",
      tagBg: "bg-amber-50",
    };
  if (s === "cancelled")
    return {
      dot: "bg-gray-400",
      label: "Cancelled",
      labelColor: "text-gray-500",
      tagBg: "bg-gray-50",
    };
  if (s === "completed" || s === "deleted")
    return {
      dot: "bg-red-400",
      label: "Deleted",
      labelColor: "text-red-500",
      tagBg: "bg-red-50",
    };
  return {
    dot: "bg-gray-400",
    label: "No Active Request",
    labelColor: "text-gray-500",
    tagBg: "bg-gray-50",
  };
};

const Divider = () => <View className="h-px bg-gray-100 mx-4" />;

const InfoRow = ({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) => (
  <>
    <View className="px-4 py-4 flex-row justify-between items-center">
      <Text className="font-inter text-gray-500">{label}</Text>
      <Text
        className="font-interbold text-base text-gray-900 flex-1 text-right ml-4"
        numberOfLines={3}
      >
        {value || "—"}
      </Text>
    </View>
    {!last && <Divider />}
  </>
);

// ─── Reason Modal ──────────────────────────────────────────────────────────
const DeleteReasonModal = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isSubmitting: boolean;
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      Alert.alert(
        "Reason required",
        "Please tell us why you want to delete your account.",
      );
      return;
    }
    onSubmit(reason.trim());
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="bg-white rounded-t-3xl p-5 pb-8">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="font-interbold text-xl text-gray-900">
              Delete Account
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-1">
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <Text className="font-inter text-sm text-gray-500 mb-4">
            This schedules your account for permanent deletion. You can cancel
            this request any time before it's processed. Please tell us why
            you're leaving.
          </Text>

          <View className="flex-row items-start gap-2 bg-red-50 rounded-xl p-3 mb-4">
            <AlertTriangle size={16} color="#EF4444" />
            <Text className="font-inter text-xs text-red-600 flex-1">
              Once processed, this action cannot be undone and all your data
              will be permanently removed.
            </Text>
          </View>

          <Text className="font-interbold text-sm text-gray-700 mb-2">
            Reason for deletion
          </Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Tell us why you're deleting your account..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="font-inter bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 min-h-[100px]"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
            className={`mt-5 rounded-xl py-3.5 items-center ${
              isSubmitting ? "bg-red-300" : "bg-red-600"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-interbold text-white">
                Submit Deletion Request
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose} className="mt-3 items-center">
            <Text className="font-interbold text-gray-500">
              Keep My Account
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────
const AccountDeletionScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const {
    getAccountDeletion,
    createDeleteMutation,
    cancelProfileDeleteMutation,
  } = useAuth();

  const { data, isLoading, error, refetch } = getAccountDeletion();

  const deletionData = data?.data?.data ?? null;
  const status = deletionData?.status;
  const isPending = status?.toLowerCase() === "pending";
  const sc = getDeletionStatusConfig(status);

  const handleSubmitRequest = (reason: string) => {
    createDeleteMutation.mutate(
      { reason },
      {
        onSuccess: () => {
          setModalVisible(false);
          refetch();
        },
        onError: (err: any) => {
          handleApiError(err, "Please try again.", {
            title: "Something Went Wrong",
            fallbackMessage: "Please try again.",
          });
        },
      },
    );
  };

  const handleCancelRequest = () => {
    Alert.alert(
      "Cancel Deletion Request",
      "Your account will remain active and no data will be deleted. Continue?",
      [
        { text: "Back", style: "cancel" },
        {
          text: "Cancel Deletion",
          onPress: () => {
            cancelProfileDeleteMutation.mutate(undefined, {
              onSuccess: () => refetch(),
              onError: (err: any) => {
                handleApiError(err, "Please try again.", {
                  title: "Something Went Wrong",
                  fallbackMessage: "Please try again.",
                });
              },
            });
          },
        },
      ],
      { cancelable: true },
    );
  };

  if (isLoading) {
    return (
      <AppLayout screenName="Delete Account">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600 font-inter">Loading...</Text>
        </View>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout screenName="Delete Account">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center font-inter">
            Failed to load account deletion status. Please try again.
          </Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout screenName="Delete Account">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Status Overview Card */}
        <View className="pt-4 bg-white m-4 rounded-xl">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <View className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
              <ShieldAlert size={13} color="#64748B" />
              <Text className="text-slate-500 text-xs font-inter">
                Account Deletion
              </Text>
            </View>
            <View
              className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${sc.tagBg}`}
            >
              <View className={`w-2 h-2 rounded-full ${sc.dot}`} />
              <Text className={`text-xs font-interbold ${sc.labelColor}`}>
                {sc.label}
              </Text>
            </View>
          </View>

          <Text className="font-interbold text-xl px-4 pb-1">
            {isPending
              ? "Deletion Request Submitted"
              : "Manage Account Deletion"}
          </Text>
          <Text className="font-inter text-gray-400 text-sm px-4 pb-4">
            {isPending
              ? "Your account is scheduled for deletion. You can cancel this any time before it is processed."
              : "Permanently delete your account and all associated data."}
          </Text>

          {isPending && (
            <>
              <Divider />
              <View className="px-4 py-4 flex-row justify-between items-center">
                <Text className="font-inter text-gray-500">Requested On</Text>
                <View className="flex-row items-center gap-1.5">
                  <CalendarDays size={14} color="#9CA3AF" />
                  <Text className="font-interbold text-base">
                    {formatDate(deletionData?.createdAt)}
                  </Text>
                </View>
              </View>

              {deletionData?.scheduledFor && (
                <>
                  <Divider />
                  <View className="px-4 py-4 flex-row justify-between items-center">
                    <Text className="font-inter text-gray-500">
                      Scheduled For
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <Clock size={14} color="#9CA3AF" />
                      <Text className="font-interbold text-base">
                        {formatDate(deletionData?.scheduledFor)}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {deletionData?.reason && (
                <InfoRow label="Reason" value={deletionData.reason} last />
              )}
            </>
          )}
        </View>

        {/* Action Card */}
        <View className="mx-4 mt-2">
          {isPending ? (
            <TouchableOpacity
              onPress={handleCancelRequest}
              disabled={cancelProfileDeleteMutation.isPending}
              activeOpacity={0.8}
              className="bg-blue-600 rounded-xl py-3.5 items-center"
            >
              {cancelProfileDeleteMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-interbold text-white">
                  Cancel Deletion Request
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
              className="flex-row items-center justify-center gap-2 bg-red-600 rounded-xl py-3.5"
            >
              <Trash2 size={16} color="#fff" />
              <Text className="font-interbold text-white">
                Request Account Deletion
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <DeleteReasonModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitRequest}
        isSubmitting={createDeleteMutation.isPending}
      />
    </AppLayout>
  );
};

export default AccountDeletionScreen;
