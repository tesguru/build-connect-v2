import InvitationCard from '@/components/Cards/InvitationCard'
import EmptyScreenComponent from '@/components/Miscallaneous/EmptyScreenComponent'
import { useBids } from '@/core/hooks/UseBids'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'

type InvitationQueryParams = {
  page: number
  limit: number
  status?: 'pending' | 'accepted' | 'declined' | 'expired'
}

const InvitedInvitations = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [queryParams, setQueryParams] = useState<InvitationQueryParams>({
    page: 1,
    limit: 20,
  })

  // Track which invitation is currently being acted on
  const [respondingId, setRespondingId] = useState<string | null>(null)

  const { myInvitations, respondToBidInvitationMutation } = useBids()
  const router = useRouter()

  const {
    data: apiResponse,
    isLoading,
    error,
  } = myInvitations(queryParams)

  const invitationsList = apiResponse?.data?.data?.invitations ?? []

  // --- Filter counts ---
  const statusFilters = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      accepted: 0,
      declined: 0,
      expired: 0,
    }

    for (const inv of invitationsList) {
      if (inv.status && counts[inv.status] !== undefined) {
        counts[inv.status]++
      }
    }

    return [
      { id: 'all', label: 'All', count: invitationsList.length },
      { id: 'pending', label: 'Pending', count: counts.pending },
      { id: 'accepted', label: 'Accepted', count: counts.accepted },
      { id: 'declined', label: 'Declined', count: counts.declined },
      { id: 'expired', label: 'Expired', count: counts.expired },
    ]
  }, [invitationsList])

  // --- Filter handler ---
  const handleStatusFilter = (status: string) => {
    setSelectedFilter(status)

    const newParams: InvitationQueryParams = { page: 1, limit: 20 }

    if (status !== 'all') {
      newParams.status = status as InvitationQueryParams['status']
    }

    setQueryParams(newParams)
  }

  const filteredInvitations = useMemo(() => {
    if (selectedFilter === 'all') return invitationsList
    return invitationsList.filter((inv) => inv.status === selectedFilter)
  }, [invitationsList, selectedFilter])

  const pagination = apiResponse?.data?.pagination

  // ── Accept ──────────────────────────────────────────────────────────────────
  const handleAccept = (id: string) => {
    setRespondingId(id)
    respondToBidInvitationMutation.mutate(
      { id, status: 'accepted' },
      {
        onSuccess: () => {
          setRespondingId(null)
        },
        onError: () => {
          setRespondingId(null)
        },
      }
    )
  }

  // ── Decline ─────────────────────────────────────────────────────────────────
  const handleDecline = (id: string) => {
    setRespondingId(id)
    respondToBidInvitationMutation.mutate(
      { id, status: 'declined' },
      {
        onSuccess: () => {
          setRespondingId(null)
        },
        onError: () => {
          setRespondingId(null)
        },
      }
    )
  }

  // ── View Project ─────────────────────────────────────────────────────────────
  const handleViewProject = (projectId: string) => {
    router.push({
      pathname: '/projectdetails/projectdetails',
      params: { projectId },
    })
  }

  return (
    <View className="flex-1">
      <View className="mt-8 flex-1">

        {/* ── Filter Pills ── */}
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
                selectedFilter === filter.id
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => handleStatusFilter(filter.id)}
            >
              <Text
                className={`text-md font-inter font-medium text-center ${
                  selectedFilter === filter.id ? 'text-white' : 'text-gray-800'
                }`}
              >
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── States ── */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#2463EB" />
            <Text className="mt-4 text-gray-600">Loading invitations...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-red-500 text-center mb-4">
              Error loading invitations. Please try again.
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-lg"
              onPress={() => setQueryParams((prev) => ({ ...prev }))}
            >
              <Text className="text-white font-medium">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredInvitations.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20 px-4">
            <EmptyScreenComponent
              message={
                selectedFilter !== 'all'
                  ? `No "${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}" Invitations`
                  : 'No Invitations Found'
              }
            />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {filteredInvitations.map((invitation) => (
              <View key={invitation.id} className="mb-3">
                <InvitationCard
                  invitation={invitation}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onViewProject={handleViewProject}
                  isResponding={
                    respondToBidInvitationMutation.isPending &&
                    respondingId === invitation.id
                  }
                  respondingAction={respondingId === invitation.id
                    ? (respondToBidInvitationMutation.variables?.status ?? null)
                    : null
                  }
                />
              </View>
            ))}

            {/* ── Pagination ── */}
            {pagination && (
              <View className="py-6 items-center">
                <Text className="text-gray-500 text-sm mb-2">
                  Showing {filteredInvitations.length} of {pagination.total} invitations
                </Text>
                {pagination.page < pagination.totalPages && (
                  <TouchableOpacity
                    className="bg-blue-600 px-6 py-3 rounded-lg"
                    onPress={() =>
                      setQueryParams((prev) => ({
                        ...prev,
                        page: (prev.page || 1) + 1,
                      }))
                    }
                  >
                    <Text className="text-white font-medium">Load More</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

export default InvitedInvitations