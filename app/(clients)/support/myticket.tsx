import AppLayout from '@/components/Layouts/AppLayout'
import EmptyScreenComponent from '@/components/Miscallaneous/EmptyScreenComponent'
import { useSupport } from '@/core/hooks/useSupport'
import { useRouter } from 'expo-router'
import { ChevronRight, Plus, TicketCheck } from 'lucide-react-native'
import React, { useMemo, useState } from 'react'
import {
    ActivityIndicator,
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

interface Ticket {
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

interface TicketQueryParams {
  page?: number
  limit?: number
  status?: TicketStatus
  priority?: TicketPriority
}


// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; bg: string; text: string }
> = {
  open:        { label: 'Open',        bg: 'bg-blue-100',   text: 'text-blue-600'  },
  in_progress: { label: 'In Progress', bg: 'bg-amber-100',  text: 'text-amber-600' },
  resolved:    { label: 'Resolved',    bg: 'bg-green-100',  text: 'text-green-600' },
  closed:      { label: 'Closed',      bg: 'bg-gray-200',   text: 'text-gray-500'  },
}

const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; dot: string }
> = {
  low:    { label: 'Low',    dot: 'bg-green-400' },
  medium: { label: 'Medium', dot: 'bg-amber-400' },
  high:   { label: 'High',   dot: 'bg-red-500'   },
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────

const TicketCard = ({
  ticket,
  onPress,
}: {
  ticket: Ticket
  onPress: () => void
}) => {
  const statusCfg = STATUS_CONFIG[ticket.status] ?? {
    label: ticket.status,
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  }
  const priorityCfg = PRIORITY_CONFIG[ticket.priority]

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-white rounded-2xl px-4 py-4 mb-4 mx-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-start">
        {/* Icon */}
        <View className="bg-blue-50 rounded-xl p-2.5 mr-3 mt-0.5">
          <TicketCheck size={22} color="#2563eb" />
        </View>

        {/* Content */}
        <View className="flex-1">
          {/* Ticket number + subject */}
          <Text className="font-interbold text-gray-900 text-base leading-snug pr-2">
            {ticket.ticketNumber}: {ticket.subject}
          </Text>

          {/* Project name */}
          {ticket.projectName ? (
            <Text className="font-inter text-gray-400 text-xs mt-0.5" numberOfLines={1}>
              {ticket.projectName}
            </Text>
          ) : null}

          {/* Status + Priority row */}
          <View className="flex-row items-center gap-2 mt-2.5 flex-wrap">
            {/* Status badge */}
            <View className={`px-3 py-1 rounded-full ${statusCfg.bg}`}>
              <Text className={`text-xs font-inter font-medium ${statusCfg.text}`}>
                {statusCfg.label}
              </Text>
            </View>

            {/* Priority badge */}
            {priorityCfg && (
              <View className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-gray-100">
                <View className={`w-2 h-2 rounded-full ${priorityCfg.dot}`} />
                <Text className="text-xs font-inter text-gray-600">
                  {priorityCfg.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Chevron */}
        <ChevronRight size={20} color="#9ca3af" className="mt-1" />
      </View>
    </TouchableOpacity>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const MyTicketsScreen = () => {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [queryParams, setQueryParams] = useState<TicketQueryParams>({
    page: 1,
    limit: 20,
  })

  const { getAllTicketsQuery } = useSupport()

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = getAllTicketsQuery(queryParams)

  const ticketsList: Ticket[] =
    apiResponse?.data?.data?.tickets ??
    []

  const pagination =
    apiResponse?.data?.data?.pagination ??
    apiResponse?.data?.pagination

  // ── Filter counts ────────────────────────────────────────────────────────────

  const statusFilters = useMemo(() => {
    const counts: Record<string, number> = {
      open: 0, in_progress: 0, resolved: 0, closed: 0,
    }
    for (const t of ticketsList) {
      if (t.status && counts[t.status] !== undefined) counts[t.status]++
    }
    return [
      { id: 'all',         label: 'All',         count: ticketsList.length },
      { id: 'open',        label: 'Open',        count: counts.open        },
      { id: 'in_progress', label: 'In Progress', count: counts.in_progress },
      { id: 'resolved',    label: 'Resolved',    count: counts.resolved    },
      { id: 'closed',      label: 'Closed',      count: counts.closed      },
    ]
  }, [ticketsList])

  const priorityFilters = [
    { id: 'all',    label: 'All Priority' },
    { id: 'high',   label: '🔴 High'      },
    { id: 'medium', label: '🟡 Medium'    },
    { id: 'low',    label: '🟢 Low'       },
  ]

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
    const newParams: TicketQueryParams = { ...queryParams, page: 1 }
    if (status === 'all') delete newParams.status
    else newParams.status = status as TicketStatus
    setQueryParams(newParams)
  }

  const handlePriorityFilter = (priority: string) => {
    setSelectedPriority(priority)
    const newParams: TicketQueryParams = { ...queryParams, page: 1 }
    if (priority === 'all') delete newParams.priority
    else newParams.priority = priority as TicketPriority
    setQueryParams(newParams)
  }

  const filteredTickets = ticketsList.filter((t) => {
    const statusMatch = selectedStatus === 'all' || t.status === selectedStatus
    const priorityMatch = selectedPriority === 'all' || t.priority === selectedPriority
    return statusMatch && priorityMatch
  })

  const handleTicketPress = (ticketId: string) => {
    router.push({
      pathname: '/support/myticketdetails',
      params: { ticketId },
    })
  }

  const handleCreateTicket = () => {
    router.push('/support/submitticket')
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <AppLayout screenName="My Tickets" fullHeightContent>
      <View className="flex-1">
        <View className="mt-8 flex-1">

          {/* ── Status filter pills ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 8,
              paddingVertical: 1,
              gap: 10,
              alignItems: 'center',
            }}
            style={{ maxHeight: 60 }}
          >
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                className={`px-5 py-3.5 rounded-full border min-w-[90px] items-center justify-center ${
                  selectedStatus === filter.id
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-200'
                }`}
                onPress={() => handleStatusFilter(filter.id)}
              >
                <Text
                  className={`text-sm font-inter font-medium text-center ${
                    selectedStatus === filter.id ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Priority filter pills ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 8,
              paddingVertical: 1,
              gap: 8,
              alignItems: 'center',
            }}
            style={{ maxHeight: 52, marginTop: 8 }}
          >
            {priorityFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                className={`px-4 py-2 rounded-full border items-center justify-center ${
                  selectedPriority === filter.id
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-white border-gray-200'
                }`}
                onPress={() => handlePriorityFilter(filter.id)}
              >
                <Text
                  className={`text-xs font-inter font-medium ${
                    selectedPriority === filter.id
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Body ── */}
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
              <Text className="mt-4 text-gray-600 font-inter">Loading tickets...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center p-4">
              <Text className="text-red-500 text-center mb-4 font-inter">
                Error loading tickets. Please try again.
              </Text>
              <TouchableOpacity
                className="bg-blue-600 px-6 py-3 rounded-lg"
                onPress={() => refetch()}
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredTickets.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20 px-4">
              <EmptyScreenComponent
                title={
                  selectedStatus !== 'all' || selectedPriority !== 'all'
                    ? 'No Matching Tickets'
                    : 'No Tickets Found'
                }
                description={
                  selectedStatus !== 'all' || selectedPriority !== 'all'
                    ? 'Try adjusting your filters'
                    : "You haven't submitted any tickets yet"
                }
                buttonText="Submit a Ticket"
                onButtonPress={handleCreateTicket}
              />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="mt-4"
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onPress={() => handleTicketPress(ticket.id)}
                />
              ))}

              {/* Pagination */}
              {pagination && (
                <View className="py-4 items-center">
                  <Text className="text-gray-500 text-sm mb-3 font-inter">
                    Showing {filteredTickets.length} of {pagination.totalItems} tickets
                  </Text>
                  {pagination.hasNextPage && (
                    <TouchableOpacity
                      className="bg-blue-600 px-6 py-3 rounded-lg"
                      onPress={() =>
                        setQueryParams((prev) => ({
                          ...prev,
                          page: (prev.page || 1) + 1,
                        }))
                      }
                    >
                      <Text className="text-white font-medium font-inter">
                        Load More
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* ── FAB ── */}
        <TouchableOpacity
          onPress={handleCreateTicket}
          activeOpacity={0.9}
          className="absolute right-5 bottom-6 bg-blue-600 flex-row items-center justify-center rounded-full px-5 py-4 shadow-lg"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <Plus size={18} color="#fff" />
          <Text className="text-white font-inter text-base font-medium ml-1">
            New Ticket
          </Text>
        </TouchableOpacity>
      </View>
    </AppLayout>
  )
}

export default MyTicketsScreen