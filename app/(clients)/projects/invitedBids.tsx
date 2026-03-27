import InvitationCard from '@/components/Cards/InvitationCard'
import AppLayout from '@/components/Layouts/AppLayout'
import EmptyScreenComponent from '@/components/Miscallaneous/EmptyScreenComponent'
import { useBids } from '@/core/hooks/UseBids'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'

type InvitationQueryParams = {
  page: number
  limit: number
  projectId?: string
  status?: 'pending' | 'accepted' | 'declined' | 'expired'
}

type Props = {
  projectId: string
}

const ClientBidInvitations = ({ projectId }: Props) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [queryParams, setQueryParams] = useState<InvitationQueryParams>({
    page: 1,
    limit: 100,
    projectId,
  })

  const [respondingId, setRespondingId] = useState<string | null>(null)

  const { clientInvitations, respondToBidInvitationMutation } = useBids()
  const router = useRouter()

  const {
    data: apiResponse,
    isLoading,
    error,
  } = clientInvitations(queryParams)

  const invitationsList = apiResponse?.data?.data?.invitations ?? []

  // --- Filter counts with proper status mapping ---
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

    const allCount = invitationsList.length
    
    return [
      { id: 'all',      label: 'All Invitations', count: allCount           },
      { id: 'pending',  label: 'Pending',         count: counts.pending      },
      { id: 'accepted', label: 'Accepted',        count: counts.accepted     },
      { id: 'declined', label: 'Declined',        count: counts.declined     },
      { id: 'expired',  label: 'Expired',         count: counts.expired      },
    ]
  }, [invitationsList])

  // --- Filter handler — always preserve projectId ---
  const handleStatusFilter = (status: string) => {
    setSelectedFilter(status)

    const newParams: InvitationQueryParams = {
      page: 1,
      limit: 100,
      projectId,
    }

    if (status !== 'all') {
      newParams.status = status as InvitationQueryParams['status']
    }

    setQueryParams(newParams)
  }

  const filteredInvitations = useMemo(() => {
    if (selectedFilter === 'all') return invitationsList
    return invitationsList.filter((inv: any) => inv.status === selectedFilter)
  }, [invitationsList, selectedFilter])

  const pagination = apiResponse?.data?.pagination

  // Format status label for display
  const formatStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'declined': 'Declined',
      'expired': 'Expired',
      'all': 'All Invitations'
    }
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
  }

  // Handle view more navigation
  const handleViewMore = () => {
    router.push({
      pathname: '/bids/invitations',
      params: { projectId }
    })
  }

  // ── Accept ──
  const handleAccept = (id: string) => {
    setRespondingId(id)
    respondToBidInvitationMutation.mutate(
      { id, status: 'accepted' },
      {
        onSuccess: () => setRespondingId(null),
        onError: () => setRespondingId(null),
      }
    )
  }

  // ── Decline ──
  const handleDecline = (id: string) => {
    setRespondingId(id)
    respondToBidInvitationMutation.mutate(
      { id, status: 'declined' },
      {
        onSuccess: () => setRespondingId(null),
        onError: () => setRespondingId(null),
      }
    )
  }

  // ── View Project ──
  const handleViewProject = (pid: string) => {
    router.push({
      pathname: '/projectdetails/projectdetails',
      params: { projectId: pid },
    })
  }

  return (
    <AppLayout screenName="Bid Invitations" fullHeightContent>
      <View className="flex-1 mt-4">
        <View className="flex-1">
       
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingHorizontal: 8, 
              paddingVertical: 1, 
              gap: 10, 
              alignItems: 'center' 
            }}
            style={{ maxHeight: 60, marginBottom: 16 }}
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

       
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
              <Text className="mt-4 text-gray-600 font-inter">
                Loading invitations...
              </Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center p-4">
              <View className="bg-red-50 rounded-xl p-6 items-center max-w-md">
                <Text className="text-red-500 text-center mb-4 font-inter">
                  {error.message || 'Error loading invitations. Please try again.'}
                </Text>
                <TouchableOpacity
                  className="bg-blue-600 px-6 py-3 rounded-lg"
                  onPress={() => setQueryParams((prev) => ({ ...prev, page: 1 }))}
                >
                  <Text className="text-white font-medium font-inter">Retry</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : filteredInvitations.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20 px-4">
              <EmptyScreenComponent
                title={
                  selectedFilter !== 'all'
                    ? `No ${formatStatusLabel(selectedFilter)} Invitations`
                    : 'No Bid Invitations Found'
                }
                description={
                  selectedFilter !== 'all'
                    ? `You don't have any ${formatStatusLabel(selectedFilter).toLowerCase()} bid invitations`
                    : 'You haven\'t received any bid invitations for this project yet'
                }
                buttonText="View Project"
                onButtonPress={() => handleViewProject(projectId)}
              />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="mt-2"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Display invitations - show all when filtered, respect view more logic */}
              {(selectedFilter !== 'all' ? filteredInvitations : filteredInvitations.slice(0, 2)).map((invitation: any) => (
                <View key={invitation.id} className="mb-4 px-4">
                  <InvitationCard
                    invitation={invitation}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    isResponding={respondingId === invitation.id}
                  />
                </View>
              ))}

              
              {pagination && pagination.page < pagination.totalPages && (
                <View className="py-6 items-center">
                  <Text className="text-gray-500 text-sm mb-2 font-inter">
                    Showing {filteredInvitations.length} of {pagination.total} invitations
                  </Text>
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
                      Load More Invitations
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
        </View>

      </View>
    </AppLayout>
  )
}

export default ClientBidInvitations