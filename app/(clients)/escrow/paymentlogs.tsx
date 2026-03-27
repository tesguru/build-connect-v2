import FundingLogCard from '@/components/Cards/FundingLogCard'
import AppLayout from '@/components/Layouts/AppLayout'
import EmptyScreenComponent from '@/components/Miscallaneous/EmptyScreenComponent'
import { useEscrow } from '@/core/hooks/useEscrow'
import { FundingLogQueryParams, FundingStatus } from '@/core/types/api'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const FundingLogsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [queryParams, setQueryParams] = useState<FundingLogQueryParams>({
    page: 1,
    limit: 20,
  })

  const { getWalletFunding } = useEscrow()
  const router = useRouter()

  const { data: apiResponse, isLoading, error } = getWalletFunding(queryParams)

  const fundingsList = apiResponse?.data?.data?.fundings ?? []
  const pagination = apiResponse?.data?.pagination

  // Update status filters to match API expectations
  const statusFilters = useMemo(() => {
    const counts: Record<string, number> = {
      pending_verification: 0,
      successful: 0,
      rejected: 0,
    }

    for (const item of fundingsList) {
      const val = item.status as string
      if (val === 'pending_verification') counts.pending_verification++
      else if (val === 'successful') counts.successful++
      else if (val === 'rejected') counts.rejected++
    }

    return [
      { id: 'all', label: 'All', count: fundingsList.length },
      { id: 'pending_verification', label: 'Pending', count: counts.pending_verification },
      { id: 'successful', label: 'Successful', count: counts.successful },
      { id: 'rejected', label: 'Rejected', count: counts.rejected },
    ]
  }, [fundingsList])

  const handleStatusFilter = (status: string) => {
    setSelectedFilter(status)
    const newParams: FundingLogQueryParams = { ...queryParams, page: 1 }
    if (status === 'all') {
      delete newParams.status
    } else {
      newParams.status = status as FundingStatus
    }
    setQueryParams(newParams)
  }

  const filteredFundings =
    selectedFilter === 'all'
      ? fundingsList
      : fundingsList.filter((item) => item.status === selectedFilter)

  const formatStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      all: 'All',
      pending_verification: 'Pending Verification',
      successful: 'Successful',
      rejected: 'Rejected',
    }
    return map[status] ?? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
  }

  const handleFundingPress = (fundingId: string) => {
    router.push({
      pathname: '/escrow/logpaymentdetails',
      params: { fundingId },
    })
  }

  return (
    <AppLayout screenName="Payment Logs" fullHeightContent>
      <View className="flex-1">
        <View className="mt-8 flex-1">
          {/* Filter Chips */}
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

          {/* Loading State */}
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
              <Text className="mt-4 text-gray-600">Loading payment logs...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center p-4">
              <Text className="text-red-500 text-center mb-4">
                Error loading payment logs. Please try again.
              </Text>
              <TouchableOpacity
                className="bg-blue-600 px-6 py-3 rounded-lg"
                onPress={() => setQueryParams({ ...queryParams, page: 1 })}
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredFundings.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20 px-4">
              <EmptyScreenComponent
                title={
                  selectedFilter !== 'all'
                    ? `No "${formatStatusLabel(selectedFilter)}" Logs`
                    : 'No Payment Logs'
                }
                description={
                  selectedFilter !== 'all'
                    ? `You don't have any ${formatStatusLabel(selectedFilter).toLowerCase()} payment logs yet`
                    : 'Your payment funding logs will appear here'
                }
                buttonText={undefined}
                onButtonPress={undefined}
              />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="mt-4"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {filteredFundings.map((item) => (
                <View key={item.id} className="mb-4 px-4">
                  <FundingLogCard
                    id={item.id}
                    amount={item.amount}
                    currency={item.currency}
                    paymentDate={item.paymentDate}
                    reference={item.reference}
                    note={item.note}
                    status={item.status as FundingStatus}
                    statusUpdatedAt={item.statusUpdatedAt}
                    verifiedAt={item.verifiedAt}
                    statusUpdateNote={item.statusUpdateNote}
                    proofDocument={item.proofDocument}
                    createdAt={item.createdAt}
                    onPress={() => handleFundingPress(item.id)}
                  />
                </View>
              ))}

              {/* Pagination */}
              {pagination && (
                <View className="py-6 items-center">
                  <Text className="text-gray-500 text-sm mb-2">
                    Showing {filteredFundings.length} of {pagination.totalItems} logs
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
                      <Text className="text-white font-medium">Load More</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </AppLayout>
  )
}

export default FundingLogsScreen