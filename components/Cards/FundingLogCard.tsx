import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export type FundingStatus =
  | 'pending_verification'
  | 'successful'  // Changed from 'verified' to 'successful'
  | 'rejected'
// Removed 'cancelled' since API doesn't support it

export interface ProofDocument {
  id: string
  fileName: string
  originalName: string
  mimeType: string
  fileSize: number
  publicUrl: string
}

export interface FundingLogCardProps {
  id: string
  amount: number
  currency: string
  paymentDate: string
  reference: string
  note?: string
  status: FundingStatus
  statusUpdatedAt?: string
  verifiedAt?: string
  statusUpdateNote?: string
  proofDocument?: ProofDocument
  createdAt?: string
  onPress?: () => void
}

// Update status config to match API values
const STATUS_CONFIG: Record<
  FundingStatus,
  { label: string; dot: string; labelColor: string }
> = {
  pending_verification: {
    label: 'Pending Verification',
    dot: 'bg-amber-400',
    labelColor: 'text-amber-500',
  },
  successful: {  // Changed from 'verified' to 'successful'
    label: 'Successful',
    dot: 'bg-green-400',
    labelColor: 'text-green-600',
  },
  rejected: {
    label: 'Rejected',
    dot: 'bg-red-400',
    labelColor: 'text-red-500',
  },
}

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
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const FundingLogCard: React.FC<FundingLogCardProps> = ({
  amount,
  currency,
  paymentDate,
  reference,
  note,
  status,
  statusUpdateNote,
  createdAt,
  onPress,
}) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['pending_verification']

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="bg-white rounded-xl px-4 pt-4 pb-4"
    >
      {/* Amount and Status */}
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-xl font-interbold text-gray-900">
          {formatAmount(amount, currency)}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <View className={`w-2 h-2 rounded-full ${config.dot}`} />
          <Text className={`text-xs font-inter ${config.labelColor}`}>{config.label}</Text>
        </View>
      </View>

      {/* Reference */}
      <Text className="text-gray-500 font-inter mb-3" numberOfLines={1}>
        Ref: {reference || '—'}
      </Text>

      {/* Payment Date */}
      <View className="flex-row items-baseline mb-4">
        <Text className="text-gray-500 font-inter mr-2">Payment Date:</Text>
        <Text className="text-base font-interbold text-gray-900">
          {formatDate(paymentDate || createdAt)}
        </Text>
      </View>

      {/* Note */}
      <View className="bg-blue-50 rounded-xl px-3 py-2.5 flex-row items-center gap-2">
        <Ionicons name="document-text-outline" size={14} color="#2463EB" />
        <Text className="text-blue-600 text-xs font-inter flex-1" numberOfLines={1}>
          {note || `Wallet funding · ${formatDate(createdAt)}`}
        </Text>
      </View>

      {/* Status Update Note (for rejected payments) */}
      {!!statusUpdateNote && (
        <View className="mt-2 bg-amber-50 rounded-xl px-3 py-2.5 flex-row items-start gap-2">
          <Ionicons name="information-circle-outline" size={14} color="#D97706" style={{ marginTop: 1 }} />
          <Text className="text-xs font-inter text-amber-700 flex-1" numberOfLines={2}>
            {statusUpdateNote}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default FundingLogCard