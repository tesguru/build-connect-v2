import AppLayout from '@/components/Layouts/AppLayout'
import { useSupport } from '@/core/hooks/useSupport'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
    AlertCircle,
    ArrowDownToLine,
    Calendar,
    Clock,
    FileText,
    FolderOpen,
    Hash,
    TicketCheck
} from 'lucide-react-native'
import React from 'react'
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

// ─── Types ────────────────────────────────────────────────────────────────────

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high'

interface TicketAttachment {
  id: string
  fileId: string
  originalName: string
  fileName: string
  mimeType: string
  fileSize: number
  publicUrl: string
  createdAt: string
}

interface TicketDetail {
  id: string
  ticketNumber: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  projectName: string
  attachments: TicketAttachment[]
  createdAt: string
  updatedAt: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  open:        { label: 'Open',        bg: 'bg-blue-50',   text: 'text-blue-600',  border: 'border-blue-200'  },
  in_progress: { label: 'In Progress', bg: 'bg-amber-50',  text: 'text-amber-600', border: 'border-amber-200' },
  resolved:    { label: 'Resolved',    bg: 'bg-green-50',  text: 'text-green-600', border: 'border-green-200' },
  closed:      { label: 'Closed',      bg: 'bg-gray-100',  text: 'text-gray-500',  border: 'border-gray-200'  },
}

const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; dot: string; bg: string; text: string }
> = {
  low:    { label: 'Low',    dot: 'bg-green-400', bg: 'bg-green-50',  text: 'text-green-600' },
  medium: { label: 'Medium', dot: 'bg-amber-400', bg: 'bg-amber-50',  text: 'text-amber-600' },
  high:   { label: 'High',   dot: 'bg-red-500',   bg: 'bg-red-50',    text: 'text-red-600'   },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word')) return '📝'
  return '📎'
}

// ─── Section Card ─────────────────────────────────────────────────────────────

const SectionCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <View
    className={`bg-white rounded-2xl px-4 py-4 mb-4 ${className}`}
    style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    }}
  >
    {children}
  </View>
)

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) => (
  <View className="flex-row items-start py-3 border-b border-gray-50">
    <View className="w-8 mt-0.5">{icon}</View>
    <View className="flex-1">
      <Text className="font-inter text-gray-400 text-xs mb-0.5">{label}</Text>
      <Text className="font-inter text-gray-800 text-sm">{value}</Text>
    </View>
  </View>
)

// ─── Screen ───────────────────────────────────────────────────────────────────

const TicketDetailsScreen = () => {
  const router = useRouter()
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>()
  const { getTicketByIdQuery } = useSupport()

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = getTicketByIdQuery(ticketId)

  const ticket: TicketDetail | null =
    apiResponse?.data?.data ??
    apiResponse?.data ??
    null

  
  if (isLoading) {
    return (
      <AppLayout screenName="Ticket Details">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-500 font-inter">Loading ticket...</Text>
        </View>
      </AppLayout>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error || !ticket) {
    return (
      <AppLayout screenName="Ticket Details">
        <View className="flex-1 justify-center items-center px-6">
          <AlertCircle size={48} color="#ef4444" />
          <Text className="font-interbold text-gray-800 text-lg mt-4 text-center">
            Failed to load ticket
          </Text>
          <Text className="font-inter text-gray-500 text-sm mt-2 text-center">
            Something went wrong. Please try again.
          </Text>
          <TouchableOpacity
            className="mt-6 bg-blue-600 px-8 py-3 rounded-xl"
            onPress={() => refetch()}
          >
            <Text className="text-white font-inter font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </AppLayout>
    )
  }

  const statusCfg = STATUS_CONFIG[ticket.status] ?? {
    label: ticket.status,
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
  }
  const priorityCfg = PRIORITY_CONFIG[ticket.priority]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppLayout screenName="Ticket Details">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 }}
      >

       
        <SectionCard>
     
          <View className="flex-row items-center mb-3">
            <View className="bg-blue-50 rounded-xl p-3 mr-3">
              <TicketCheck size={26} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="font-inter text-gray-400 text-xs">
                Ticket Number
              </Text>
              <Text className="font-interbold text-gray-900 text-base">
                {ticket.ticketNumber}
              </Text>
            </View>
          </View>

       
          <Text className="font-interbold text-gray-900 text-lg leading-snug mb-4">
            {ticket.subject}
          </Text>

         
          <View className="flex-row gap-2 flex-wrap">
            <View
              className={`flex-row items-center px-3 py-1.5 rounded-full border ${statusCfg.bg} ${statusCfg.border}`}
            >
              <Text className={`text-xs font-inter font-semibold ${statusCfg.text}`}>
                {statusCfg.label}
              </Text>
            </View>

            {priorityCfg && (
              <View
                className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${priorityCfg.bg}`}
              >
                <View className={`w-2 h-2 rounded-full ${priorityCfg.dot}`} />
                <Text className={`text-xs font-inter font-semibold ${priorityCfg.text}`}>
                  {priorityCfg.label} Priority
                </Text>
              </View>
            )}
          </View>
        </SectionCard>

    
        <SectionCard>
          <Text className="font-interbold text-gray-800 text-base mb-1">
            Details
          </Text>

          <InfoRow
            icon={<Hash size={15} color="#9ca3af" />}
            label="Ticket Number"
            value={ticket.ticketNumber}
          />
          <InfoRow
            icon={<FolderOpen size={15} color="#9ca3af" />}
            label="Project"
            value={ticket.projectName || '—'}
          />
          <InfoRow
            icon={<Calendar size={15} color="#9ca3af" />}
            label="Created"
            value={formatDate(ticket.createdAt)}
          />
          <InfoRow
            icon={<Clock size={15} color="#9ca3af" />}
            label="Last Updated"
            value={formatDate(ticket.updatedAt)}
          />
        </SectionCard>

     
        <SectionCard>
          <Text className="font-interbold text-gray-800 text-base mb-3">
            Description
          </Text>
          <Text className="font-inter text-gray-600 text-sm leading-relaxed">
            {ticket.description}
          </Text>
        </SectionCard>

      
        {ticket.attachments && ticket.attachments.length > 0 && (
          <SectionCard>
            <Text className="font-interbold text-gray-800 text-base mb-3">
              Attachments ({ticket.attachments.length})
            </Text>

            {ticket.attachments.map((attachment, index) => (
              <TouchableOpacity
                key={attachment.id}
                onPress={() => Linking.openURL(attachment.publicUrl)}
                activeOpacity={0.75}
                className={`flex-row items-center py-3 ${
                  index < ticket.attachments.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                }`}
              >
               
                <View className="bg-blue-50 rounded-xl w-10 h-10 items-center justify-center mr-3">
                  <Text style={{ fontSize: 18 }}>
                    {getFileIcon(attachment.mimeType)}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text
                    className="font-inter text-gray-800 text-sm font-medium"
                    numberOfLines={1}
                  >
                    {attachment.originalName || attachment.fileName}
                  </Text>
                  <Text className="font-inter text-gray-400 text-xs mt-0.5">
                    {formatFileSize(attachment.fileSize)}
                  </Text>
                </View>

              
                <View className="bg-blue-50 rounded-lg p-2">
                  <ArrowDownToLine size={16} color="#2563eb" />
                </View>
              </TouchableOpacity>
            ))}
          </SectionCard>
        )}

      
        {(!ticket.attachments || ticket.attachments.length === 0) && (
          <SectionCard>
            <Text className="font-interbold text-gray-800 text-base mb-3">
              Attachments
            </Text>
            <View className="items-center py-4">
              <FileText size={32} color="#d1d5db" />
              <Text className="font-inter text-gray-400 text-sm mt-2">
                No attachments
              </Text>
            </View>
          </SectionCard>
        )}

      </ScrollView>
    </AppLayout>
  )
}

export default TicketDetailsScreen