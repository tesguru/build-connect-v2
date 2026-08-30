import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: '#10b981', label: 'Approved' },
  accepted: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: '#10b981', label: 'Approved' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: '#f59e0b', label: 'Pending' },
  rejected: { bg: 'bg-red-50', text: 'text-red-500', dot: '#ef4444', label: 'Rejected' },
};

function getStatusConfig(status: string | null | undefined) {
  const normalized = status?.toLowerCase();
  if (normalized && STATUS_CONFIG[normalized]) return STATUS_CONFIG[normalized];
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';
  return { bg: 'bg-gray-100', text: 'text-gray-500', dot: '#9ca3af', label };
}

function formatDate(date: string | null) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
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
  status = 'pending',
  message,
  reviewNote,
  createdAt,
}: EOICardProps) {
  const router = useRouter();
  const [showReviewNote, setShowReviewNote] = useState(false);

  const normalizedStatus = status?.toLowerCase();
  const isDecided = normalizedStatus === 'approved' || normalizedStatus === 'accepted' || normalizedStatus === 'rejected';
  const isApproved = normalizedStatus === 'approved' || normalizedStatus === 'accepted';
  const statusConfig = getStatusConfig(status);

  const bannerConfig = isApproved
    ? { borderColor: '#a7f3d0', bg: '#ecfdf5', iconColor: '#059669', textColor: '#059669', icon: 'checkmark-circle-outline' }
    : { borderColor: '#fecaca', bg: '#fff1f2', iconColor: '#ef4444', textColor: '#ef4444', icon: 'close-circle-outline' };

  const iconConfig = isApproved
    ? { iconBg: '#ecfdf5', iconColor: '#059669', icon: 'checkmark-circle' }
    : { iconBg: '#fff1f2', iconColor: '#ef4444', icon: 'close-circle' };

  const onPress = () => {
    router.push({ pathname: '/projectdetails/projectdetails', params: { projectId, eoiId } });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl p-4"
      style={{
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#94a3b8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center gap-3 mb-2">
        <View style={{ backgroundColor: iconConfig.iconBg, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={iconConfig.icon as any} size={20} color={iconConfig.iconColor} />
        </View>
        <View className="flex-1">
          <Text className="font-interbold text-gray-900 text-base" numberOfLines={1}>
            {projectName}
          </Text>
          {projectLocation && <Text className="text-gray-400 text-xs font-inter">{projectLocation}</Text>}
        </View>
        <View className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig.bg}`}>
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: statusConfig.dot }} />
          <Text className={`font-interbold text-xs ${statusConfig.text}`}>{statusConfig.label}</Text>
        </View>
      </View>

      {message && (
        <Text className="text-gray-600 font-inter text-sm mt-1" numberOfLines={2}>
          {message}
        </Text>
      )}

      {isDecided && (
        <View
          className="flex-row items-center gap-2 mt-3 p-3 rounded-xl"
          style={{ borderWidth: 1, borderColor: bannerConfig.borderColor, backgroundColor: bannerConfig.bg }}
        >
          <Ionicons name={bannerConfig.icon as any} size={18} color={bannerConfig.iconColor} />
          <Text className="flex-1 text-sm font-inter" style={{ color: bannerConfig.textColor }}>
            {isApproved
              ? "You've been approved to bid on this project."
              : 'Your expression of interest was not approved.'}
          </Text>
        </View>
      )}

      {reviewNote && (
        <TouchableOpacity onPress={() => setShowReviewNote(true)} className="mt-2">
          <Text className="text-blue-600 font-intersemibold text-xs">View review note</Text>
        </TouchableOpacity>
      )}

      {createdAt && <Text className="text-gray-300 font-inter text-xs mt-2">{formatDate(createdAt)}</Text>}

      <Modal visible={showReviewNote} transparent animationType="fade" onRequestClose={() => setShowReviewNote(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20 }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ fontFamily: 'InterBold', fontSize: 18, fontWeight: '700', color: '#0f172a' }}>
                Review Note
              </Text>
              <TouchableOpacity
                onPress={() => setShowReviewNote(false)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#334155', lineHeight: 20 }}>
              {reviewNote}
            </Text>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}
