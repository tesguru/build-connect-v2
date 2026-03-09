import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Linking, Text, TouchableOpacity, View } from 'react-native'

export type FundingStatus =
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'cancelled'

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
  paymentDate: string        // "YYYY-MM-DD"
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


const STATUS_CONFIG: Record<
  FundingStatus,
  {
    label: string
    bg: string
    text: string
    border: string
    dot: string
    iconName: keyof typeof Ionicons.glyphMap
    iconColor: string
    accentBar: string
  }
> = {
  pending_verification: {
    label: 'Pending Verification',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
    iconName: 'hourglass-outline',
    iconColor: '#D97706',
    accentBar: 'bg-amber-400',
  },
  verified: {
    label: 'Verified',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
    iconName: 'shield-checkmark-outline',
    iconColor: '#16A34A',
    accentBar: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    iconName: 'close-circle-outline',
    iconColor: '#DC2626',
    accentBar: 'bg-red-500',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    iconName: 'ban-outline',
    iconColor: '#9CA3AF',
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

const formatPaymentDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileIcon = (mimeType?: string): keyof typeof Ionicons.glyphMap => {
  if (!mimeType) return 'document-outline'
  if (mimeType.startsWith('image/')) return 'image-outline'
  if (mimeType === 'application/pdf') return 'document-text-outline'
  return 'attach-outline'
}

/* ─── Info Row helper ───────────────────────────────────── */
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
}) => (
  <View className="flex-row items-center justify-between py-2.5 border-b border-gray-50">
    <View className="flex-row items-center" style={{ gap: 8 }}>
      <View className="w-7 h-7 rounded-lg bg-gray-50 items-center justify-center">
        <Ionicons name={icon} size={13} color="#6B7280" />
      </View>
      <Text className="text-xs font-inter text-gray-400">{label}</Text>
    </View>
    <Text className="text-sm font-inter font-semibold text-gray-700 max-w-[55%] text-right" numberOfLines={1}>
      {value}
    </Text>
  </View>
)

/* ─── Card ──────────────────────────────────────────────── */
const FundingLogCard: React.FC<FundingLogCardProps> = ({
  id,
  amount,
  currency,
  paymentDate,
  reference,
  note,
  status,
  statusUpdateNote,
  verifiedAt,
  proofDocument,
  createdAt,
  onPress,
}) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['pending_verification']
  const shortId = id?.slice(0, 8).toUpperCase() ?? '—'

  const handleOpenProof = () => {
    if (proofDocument?.publicUrl) {
      Linking.openURL(proofDocument.publicUrl)
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
   
      <View className="flex-row">
        <View className={`w-1 self-stretch rounded-l-2xl ${config.accentBar}`} />

        <View className="flex-1 px-4 pt-4 pb-4">

     
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center" style={{ gap: 7 }}>
              <View className="bg-blue-50 rounded-lg p-1.5">
                <Ionicons name="cash-outline" size={15} color="#2463EB" />
              </View>
              <Text className="text-xs font-inter font-medium text-gray-400 tracking-wide">
                #{shortId}
              </Text>
            </View>

            {/* Status pill */}
            <View
              className={`flex-row items-center px-3 py-1.5 rounded-full border ${config.bg} ${config.border}`}
              style={{ gap: 5 }}
            >
              <Ionicons name={config.iconName} size={12} color={config.iconColor} />
              <Text className={`text-xs font-inter font-semibold ${config.text}`}>
                {config.label}
              </Text>
            </View>
          </View>

          {/* ── Row 2: Amount hero ── */}
          <View className="mb-4">
            <Text className="text-3xl font-inter font-bold text-gray-900 tracking-tight">
              {formatAmount(amount, currency)}
            </Text>
            {note ? (
              <Text
                className="text-sm font-inter text-gray-500 mt-1"
                numberOfLines={2}
              >
                {note}
              </Text>
            ) : null}
          </View>

          {/* ── Divider ── */}
          <View className="h-px bg-gray-100 mb-1" />

          {/* ── Info rows ── */}
          <InfoRow
            icon="calendar-outline"
            label="Payment Date"
            value={formatPaymentDate(paymentDate)}
          />
          <InfoRow
            icon="pricetag-outline"
            label="Reference"
            value={reference || 'N/A'}
          />
          {verifiedAt ? (
            <InfoRow
              icon="shield-checkmark-outline"
              label="Verified At"
              value={formatPaymentDate(verifiedAt)}
            />
          ) : null}
          {statusUpdateNote ? (
            <View className="py-2.5">
              <View className="flex-row items-start" style={{ gap: 8 }}>
                <View className="w-7 h-7 rounded-lg bg-gray-50 items-center justify-center mt-0.5">
                  <Ionicons name="information-circle-outline" size={13} color="#6B7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-inter text-gray-400 mb-0.5">Admin Note</Text>
                  <Text className="text-sm font-inter text-gray-600" numberOfLines={2}>
                    {statusUpdateNote}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* ── Proof document chip ── */}
          {proofDocument ? (
            <TouchableOpacity
              onPress={handleOpenProof}
              className="flex-row items-center bg-blue-50 rounded-xl px-3 py-2.5 mt-2 border border-blue-100"
              style={{ gap: 10 }}
            >
              <View className="bg-blue-100 rounded-lg p-1.5">
                <Ionicons
                  name={getFileIcon(proofDocument.mimeType)}
                  size={15}
                  color="#2463EB"
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-sm font-inter font-semibold text-blue-700"
                  numberOfLines={1}
                >
                  {proofDocument.originalName || proofDocument.fileName}
                </Text>
                {proofDocument.fileSize ? (
                  <Text className="text-xs font-inter text-blue-400">
                    {formatFileSize(proofDocument.fileSize)}
                  </Text>
                ) : null}
              </View>
              <Ionicons name="open-outline" size={14} color="#2463EB" />
            </TouchableOpacity>
          ) : null}

          {/* ── Footer: date + view details ── */}
          <View className="flex-row items-center justify-between mt-3">
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Ionicons name="time-outline" size={12} color="#9CA3AF" />
              <Text className="text-xs font-inter text-gray-400">
                {formatPaymentDate(createdAt)}
              </Text>
            </View>

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
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default FundingLogCard