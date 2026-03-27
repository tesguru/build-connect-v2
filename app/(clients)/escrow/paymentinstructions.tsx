
import PaymentInstructionCard from '@/components/Cards/PaymentsCard'
import AppLayout from '@/components/Layouts/AppLayout'
import EmptyScreenComponent from '@/components/Miscallaneous/EmptyScreenComponent'
import { useEscrow } from '@/core/hooks/useEscrow'
import { PaymentInstructionQueryParams, PaymentStatus } from '@/core/types/api'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const PaymentInstructionsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [queryParams, setQueryParams] = useState<PaymentInstructionQueryParams>({
    page: 1,
    limit: 20,
  })

  const { getPaymentInstructions } = useEscrow()
  const router = useRouter()

  const { data: apiResponse, isLoading, error } = getPaymentInstructions(queryParams)

  /* ── Normalise response: data.instructions ── */
  const instructionsList = apiResponse?.data?.data?.instructions ?? []

  /* ── Build filter tabs with live counts ── */
  const statusFilters = useMemo(() => {
    const counts: Record<PaymentStatus, number> = {
      instruction_sent: 0,
      processing: 0,
      paid: 0,
      failed: 0,
      reversed: 0,
      cancelled: 0,
    }

    for (const item of instructionsList) {
      const val = item.status as PaymentStatus
      if (val && counts[val] !== undefined) counts[val]++
    }

    return [
      { id: 'all',              label: 'All',         count: instructionsList.length },
      { id: 'instruction_sent', label: 'Sent',        count: counts.instruction_sent },
      { id: 'processing',       label: 'Processing',  count: counts.processing       },
      { id: 'paid',             label: 'Paid',        count: counts.paid             },
      { id: 'failed',           label: 'Failed',      count: counts.failed           },
      { id: 'reversed',         label: 'Reversed',    count: counts.reversed         },
      { id: 'cancelled',        label: 'Cancelled',   count: counts.cancelled        },
    ]
  }, [instructionsList])

  /* ── Filter handler (also updates API query param) ── */
  const handleStatusFilter = (status: string) => {
    setSelectedFilter(status)
    const newParams: PaymentInstructionQueryParams = { ...queryParams, page: 1 }
    if (status === 'all') {
      delete newParams.status
    } else {
      newParams.status = status as PaymentStatus
    }
    setQueryParams(newParams)
  }


  const filteredInstructions =
    selectedFilter === 'all'
      ? instructionsList
      : instructionsList.filter((item) => item.status === selectedFilter)


  const pagination = apiResponse?.data?.pagination


  const formatStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      all: 'All',
      instruction_sent: 'Instruction Sent',
      processing: 'Processing',
      paid: 'Paid',
      failed: 'Failed',
      reversed: 'Reversed',
      cancelled: 'Cancelled',
    }
    return map[status] ?? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
  }

  const handlePaymentPress = (instructionId: string) => {
    router.push({
      pathname: '/escrow/paymentdetails',
      params: { instructionId },
    })
  }

  const handleRetry = (instructionId: string) => {
    router.push({
      pathname: '/payments/retry',
      params: { instructionId },
    })
  }


  return (
    <AppLayout screenName="Payment Instructions" fullHeightContent>
      <View className="flex-1">
        <View className="mt-8 flex-1">

        
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

     
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
              <Text className="mt-4 text-gray-600">Loading instructions...</Text>
            </View>

      
          ) : error ? (
            <View className="flex-1 justify-center items-center p-4">
              <Text className="text-red-500 text-center mb-4">
                Error loading payment instructions. Please try again.
              </Text>
              <TouchableOpacity
                className="bg-blue-600 px-6 py-3 rounded-lg"
                onPress={() => setQueryParams({ ...queryParams })}
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </View>

      
          ) : filteredInstructions.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20 px-4">
              <EmptyScreenComponent
                title={
                  selectedFilter !== 'all'
                    ? `No "${formatStatusLabel(selectedFilter)}" Instructions`
                    : 'No Payment Instructions'
                }
                description={
                  selectedFilter !== 'all'
                    ? `You don't have any ${formatStatusLabel(selectedFilter).toLowerCase()} payment instructions yet`
                    : 'Payment instructions will appear here once they are created'
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
              {filteredInstructions.map((item) => (
                <View key={item.id} className="mb-4 px-4">
                  <PaymentInstructionCard
                    /* ── direct API fields ── */
                    id={item.id}
                    amount={item.amount}
                    currency={item.currency}
                    status={item.status as PaymentStatus}
                    note={item.note}
                    instructionSentAt={item.instructionSentAt}
                    createdAt={item.createdAt}
                    /* ── nested objects ── */
                    project={item.project}
                    milestone={item.milestone}
                    client={item.client}
                    builder={item.builder}
                    /* ── callbacks ── */
                    onPress={() => handlePaymentPress(item.id)}
                    onRetry={
                      item.status === 'failed'
                        ? () => handleRetry(item.id)
                        : undefined
                    }
                  />
                </View>
              ))}

              {/* ── Pagination ── */}
              {pagination && (
                <View className="py-6 items-center">
                  <Text className="text-gray-500 text-sm mb-2">
                    Showing {filteredInstructions.length} of {pagination.totalItems} instructions
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

export default PaymentInstructionsScreen