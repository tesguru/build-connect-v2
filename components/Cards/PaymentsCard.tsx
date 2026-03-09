import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export type PaymentStatus =
  | 'instruction_sent'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'reversed'
  | 'cancelled'

export interface PaymentInstructionCardProps {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  note?: string
  instructionSentAt?: string
  createdAt?: string
  project?: { id: string; title: string }
  milestone?: { id: string; name: string; completionDate?: string }
  client?: { id: string; name: string; email: string }
  builder?: { id: string; name: string; email: string }
  onPress?: () => void
  onRetry?: () => void
}

/* ─── Status config ─────────────────────────────────────── */
const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; bg: string; text: string; dot: string; accentBar: string }
> = {
  instruction_sent: {
    label: 'Instruction Sent',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    dot: 'bg-blue-500',
    accentBar: 'bg-blue-600',
  },
  processing: {
    label: 'Processing',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-400',
    accentBar: 'bg-amber-400',
  },
  paid: {
    label: 'Paid',
    bg: 'bg-green-50',
    text: 'text-green-600',
    dot: 'bg-green-500',
    accentBar: 'bg-green-500',
  },
  failed: {
    label: 'Failed',
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-500',
    accentBar: 'bg-red-500',
  },
  reversed: {
    label: 'Reversed',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    dot: 'bg-purple-500',
    accentBar: 'bg-purple-500',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    dot: 'bg-gray-400',
    accentBar: 'bg-gray-400',
  },
}

/* ─── Helpers ───────────────────────────────────────────── */
const formatAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount?.toFixed(2) ?? '0.00'}`
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/* ─── Avatar initials chip ──────────────────────────────── */
const AvatarChip = ({ name, color }: { name: string; color: 'blue' | 'orange' }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <View
      className={`w-8 h-8 rounded-full items-center justify-center ${
        color === 'blue' ? 'bg-blue-100' : 'bg-orange-100'
      }`}
    >
      <Text
        className={`text-xs font-inter font-bold ${
          color === 'blue' ? 'text-blue-700' : 'text-orange-700'
        }`}
      >
        {initials}
      </Text>
    </View>
  )
}

/* ─── Card ──────────────────────────────────────────────── */
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
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['instruction_sent']
  const shortId = id?.slice(0, 8).toUpperCase() ?? '—'

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* ── Status accent bar ── */}
      <View className={`h-1 w-full ${config.accentBar}`} />

      <View className="px-4 pt-4 pb-4">

        {/* ── Row 1: ID + Status pill ── */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <View className="bg-blue-50 rounded-lg p-1.5">
              <Ionicons name="receipt-outline" size={15} color="#2463EB" />
            </View>
            <Text className="text-xs font-inter font-medium text-gray-400 tracking-wide">
              #{shortId}
            </Text>
          </View>

          <View
            className={`flex-row items-center px-3 py-1.5 rounded-full ${config.bg}`}
            style={{ gap: 5 }}
          >
            <View className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            <Text className={`text-xs font-inter font-semibold ${config.text}`}>
              {config.label}
            </Text>
          </View>
        </View>

        {/* ── Row 2: Amount hero ── */}
        <View className="mb-3">
          <Text className="text-2xl font-inter font-bold text-gray-900 tracking-tight">
            {formatAmount(amount, currency)}
          </Text>
          {note ? (
            <Text className="text-sm font-inter text-gray-500 mt-0.5" numberOfLines={1}>
              {note}
            </Text>
          ) : null}
        </View>

        {/* ── Divider ── */}
        <View className="h-px bg-gray-100 mb-3" />

        {/* ── Row 3: Project + Milestone ── */}
        <View className="flex-row items-start justify-between mb-3">
          {/* Project */}
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-0.5" style={{ gap: 4 }}>
              <Ionicons name="folder-outline" size={12} color="#9CA3AF" />
              <Text className="text-xs text-gray-400 font-inter">Project</Text>
            </View>
            <Text
              className="text-sm font-inter font-semibold text-gray-800"
              numberOfLines={1}
            >
              {project?.title ?? 'N/A'}
            </Text>
          </View>

          {/* Milestone */}
          <View className="items-end flex-1">
            <View
              className="flex-row items-center mb-0.5"
              style={{ gap: 4, justifyContent: 'flex-end' }}
            >
              <Ionicons name="flag-outline" size={12} color="#9CA3AF" />
              <Text className="text-xs text-gray-400 font-inter">Milestone</Text>
            </View>
            <Text
              className="text-sm font-inter font-semibold text-gray-800 text-right"
              numberOfLines={1}
            >
              {milestone?.name ?? 'N/A'}
            </Text>
            {milestone?.completionDate ? (
              <Text className="text-xs font-inter text-gray-400">
                Due {formatDate(milestone.completionDate)}
              </Text>
            ) : null}
          </View>
        </View>

        {/* ── Row 4: Client + Builder ── */}
        <View
          className="flex-row items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 mb-3"
        >
          {/* Client */}
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <AvatarChip name={client?.name ?? 'CL'} color="blue" />
            <View>
              <Text className="text-xs text-gray-400 font-inter">Client</Text>
              <Text className="text-sm font-inter font-semibold text-gray-800">
                {client?.name ?? 'N/A'}
              </Text>
            </View>
          </View>

          {/* Vertical divider */}
          <View className="w-px h-8 bg-gray-200" />

          {/* Builder */}
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <AvatarChip name={builder?.name ?? 'BL'} color="orange" />
            <View>
              <Text className="text-xs text-gray-400 font-inter">Builder</Text>
              <Text className="text-sm font-inter font-semibold text-gray-800">
                {builder?.name ?? 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Row 5: Date + CTA ── */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center" style={{ gap: 5 }}>
            <Ionicons name="time-outline" size={13} color="#9CA3AF" />
            <Text className="text-xs font-inter text-gray-400">
              {formatDate(instructionSentAt ?? createdAt)}
            </Text>
          </View>

          {status === 'failed' && onRetry ? (
            <TouchableOpacity
              onPress={onRetry}
              className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-full border border-red-200"
              style={{ gap: 4 }}
            >
              <Ionicons name="refresh-outline" size={13} color="#DC2626" />
              <Text className="text-xs font-inter font-semibold text-red-600">Retry</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onPress}
              className="flex-row items-center"
              style={{ gap: 3 }}
            >
              <Text className="text-xs font-inter font-semibold text-blue-600">
                View Details
              </Text>
              <Ionicons name="chevron-forward" size={13} color="#2463EB" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default PaymentInstructionCard