import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export type PaymentStatus =
  | 'instruction_sent'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'reversed'
  | 'cancelled';

export interface PaymentInstructionCardProps {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  note?: string;
  instructionSentAt?: string;
  createdAt?: string;
  project?: { id: string; title: string };
  milestone?: { id: string; name: string; completionDate?: string };
  client?: { id: string; name: string; email: string };
  builder?: { id: string; name: string; email: string };
  onPress?: () => void;
  onRetry?: () => void;
}

type StatusConfig = {
  dot: string;
  label: string;
  labelColor: string;
};

const getStatusConfig = (status: PaymentStatus): StatusConfig => {
  switch (status) {
    case 'paid':
      return { dot: 'bg-green-400', label: 'Paid', labelColor: 'text-green-500' };
    case 'failed':
      return { dot: 'bg-red-400', label: 'Failed', labelColor: 'text-red-500' };
    case 'processing':
      return { dot: 'bg-amber-400', label: 'Processing', labelColor: 'text-amber-500' };
    case 'instruction_sent':
      return { dot: 'bg-blue-400', label: 'Instruction Sent', labelColor: 'text-blue-500' };
    case 'reversed':
      return { dot: 'bg-purple-400', label: 'Reversed', labelColor: 'text-purple-500' };
    case 'cancelled':
      return { dot: 'bg-gray-400', label: 'Cancelled', labelColor: 'text-gray-500' };
    default:
      return { dot: 'bg-gray-400', label: status, labelColor: 'text-gray-500' };
  }
};

const formatAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount?.toFixed(2) ?? '0.00'}`;
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const PaymentInstructionCard: React.FC<PaymentInstructionCardProps> = ({
  id,
  amount,
  currency,
  status,
  note,
  instructionSentAt,
  createdAt,
  project,
  milestone,
  client,
  builder,
  onPress,
  onRetry,
}) => {
  const sc = getStatusConfig(status);
  const shortId = id?.slice(0, 8).toUpperCase() ?? '—';

  return (
    <View className="bg-white rounded-2xl mx-2 px-5 py-5 shadow-sm shadow-black/10">

      {/* ── Row 1: Category tag + Status ── */}
      <View className="flex-row items-center justify-between mb-4">

        {/* Category pill */}
        <View className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
          <Ionicons name="receipt-outline" size={13} color="#64748B" />
          <Text className="text-slate-500 text-xs font-inter">Payment</Text>
        </View>

        {/* Status — dot + label only, no pill */}
        <View className="flex-row items-center gap-1.5">
          <View className={`w-2 h-2 rounded-full ${sc.dot}`} />
          <Text className={`text-xs font-inter ${sc.labelColor}`}>{sc.label}</Text>
        </View>

      </View>

      {/* ── Project title ── */}
      <Text className="text-gray-900 text-lg font-interbold mb-3" numberOfLines={1}>
        {project?.title || '—'}
      </Text>

      {/* ── Amount + Date ── */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-800 text-base font-interbold">
          {formatAmount(amount, currency)}
        </Text>

        <View className="flex-row items-center gap-1.5">
          <Ionicons name="time-outline" size={14} color="#9CA3AF" />
          <Text className="text-gray-400 text-sm font-inter">
            {formatDate(instructionSentAt ?? createdAt)}
          </Text>
        </View>
      </View>

      {/* ── Note snippet ── */}
      {!!note && (
        <Text className="text-gray-500 text-sm font-inter leading-5 mb-4" numberOfLines={2}>
          {note}{' '}
          <Text className="text-blue-600 font-inter">...more</Text>
        </Text>
      )}

      {/* ── Footer: Milestone + CTA ── */}
      <View className="flex-row items-center justify-between mt-1">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="flag-outline" size={14} color="#9CA3AF" />
          <Text className="text-gray-400 text-sm font-inter" numberOfLines={1}>
            {milestone?.name || '—'}
          </Text>
        </View>

        {status === 'failed' && onRetry ? (
          <TouchableOpacity
            onPress={onRetry}
            activeOpacity={0.8}
            className="bg-red-600 rounded-full px-5 py-2"
          >
            <Text className="text-white text-sm font-inter">Retry</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className="bg-blue-600 rounded-full px-5 py-2"
          >
            <Text className="text-white text-sm font-inter">View Details</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
};

export default PaymentInstructionCard;