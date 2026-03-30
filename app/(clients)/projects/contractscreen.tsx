import PrimaryButton from '@/components/Buttons/Button'
import GradientButton from '@/components/Buttons/GradientButton'
import AppLayout from '@/components/Layouts/AppLayout'
import SuccessScreen from '@/components/Notifications/SucessScreen'
import { MarkEmoji } from '@/constants/icon'
import { useBids } from '@/core/hooks/UseBids'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Image, Text, View } from 'react-native'

const ClientContractdetailsScreen = () => {
  const { 
    bidId, 
    projectId, 
    projectTitle, 
    companyName, 
    bidsData 
  } = useLocalSearchParams<{
    bidId: string
    companyName: string
    projectTitle: string
    bidsData: string
    projectId: string
  }>()

  const [parsedBidsData, setParsedBidsData] = useState<any>({})
  const [milestones, setMilestones] = useState<any[]>([])
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Parse bidsData safely
  useEffect(() => {
    if (bidsData) {
      try {
        const parsed = typeof bidsData === 'string' ? JSON.parse(bidsData) : bidsData
        setParsedBidsData(parsed)
        const milestoneData = parsed?.milestones || []
        setMilestones(milestoneData)
        setStartDate(milestoneData[0]?.completionDate || '')
        setEndDate(milestoneData[milestoneData.length - 1]?.completionDate || '')
      } catch (error) {
        console.error('Error parsing bidsData:', error)
        setParsedBidsData({})
        setMilestones([])
      }
    }
  }, [bidsData])

  const {
    sendContractMutation,
    sendSuccess,
    signSuccess,
    signContractMutation,
    getContractByBidQuery,
  } = useBids()

  const { 
    data: contractResponse, 
    isLoading: isLoadingContract,
    error: contractError 
  } = getContractByBidQuery(bidId as string)

 
  const parsedcontractData = contractResponse?.data?.data || contractResponse?.data || {}
  const contractStatus = parsedcontractData?.status
  const contractId = parsedcontractData?.id

  const isClientSigned = contractStatus === 'client_signed'
  const isActive = contractStatus === 'active'
  const isContractReady = contractStatus === 'draft' || contractStatus === 'pending'

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
      })
    } catch (error) {
      return '—'
    }
  }

  const formatAmount = (amount: string | number) => {
    if (!amount) return '—'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return '—'
    return `₦${numAmount.toLocaleString('en-NG')}`
  }

  const sendContract = () => {
    if (!contractId) {
      Alert.alert('Error', 'Contract ID not found')
      return
    }
    sendContractMutation.mutate(contractId)
  }

  const signContract = () => {
    if (!contractId) {
      Alert.alert('Error', 'Contract ID not found')
      return
    }
    signContractMutation.mutate(contractId)
  }

  // Handle errors from mutations
  useEffect(() => {
    if (sendContractMutation.error) {
      Alert.alert('Error', 'Failed to send contract. Please try again.')
    }
  }, [sendContractMutation.error])

  useEffect(() => {
    if (signContractMutation.error) {
      Alert.alert('Error', 'Failed to sign contract. Please try again.')
    }
  }, [signContractMutation.error])

  // Success screens
  if (sendSuccess) {
    return (
      <SuccessScreen
        title="Contract Sent!"
        message="The contract has been successfully sent via email."
        navigateTo="/(clients)/proposalscreen/proposalscreen"
        params={{ 
          bidId: bidId as string, 
          projectTitle: projectTitle as string, 
          projectId: projectId as string, 
          companyName: companyName as string, 
          bidsData: bidsData as string 
        }}
        buttonTitle="Return to Proposal"
      />
    )
  }

  if (signSuccess) {
    return (
      <SuccessScreen
        title="Contract Signed!"
        message="You have successfully signed the contract."
        navigateTo="/(tab)"
        params={{ 
          bidId: bidId as string, 
          projectTitle: projectTitle as string, 
          companyName: companyName as string, 
          projectId: projectId as string, 
          bidsData: bidsData as string 
        }}
        buttonTitle="Return to Home"
      />
    )
  }

  if (isLoadingContract) {
    return (
      <AppLayout screenName="Contract Details">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-500 font-inter">Loading contract...</Text>
        </View>
      </AppLayout>
    )
  }

  if (contractError) {
    return (
      <AppLayout screenName="Contract Details">
        <View className="flex-1 justify-center items-center py-20 px-4">
          <Text className="text-red-500 text-center mb-4 font-inter">
            Failed to load contract details
          </Text>
          <PrimaryButton
            onPress={() => getContractByBidQuery.refetch()}
            title="Retry"
            textColor="white"
            backgroundColor="#2563EB"
          />
        </View>
      </AppLayout>
    )
  }

  return (
    <AppLayout screenName="Contract Details">
      <View className="pt-4">

        {/* Header */}
        <View className="items-center mb-6">
          <Image style={{ width: 90, height: 90 }} source={MarkEmoji} resizeMode="contain" />
          <Text className="font-interbold pt-2 text-center">Bid Selected</Text>
          <Text className="font-inter pt-1 text-center text-gray-500">
            You've selected {companyName as string}
          </Text>
        </View>

        {/* Contract Details */}
        <View className="mx-4 mb-4 bg-white rounded-xl px-4">
          <Text className="font-interbold py-4 text-xl">{projectTitle as string}</Text>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Contractor</Text>
            <Text className="font-interbold">{companyName as string}</Text>
          </View>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Total Amount</Text>
            <Text className="font-interbold">{formatAmount(parsedBidsData?.bidAmount)}</Text>
          </View>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Timeline</Text>
            <Text className="font-interbold">{parsedBidsData?.proposedTimeline || '—'}</Text>
          </View>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Start Date</Text>
            <Text className="font-interbold">{formatDate(startDate)}</Text>
          </View>

          <View className="flex-row py-3 justify-between">
            <Text className="text-gray-500 font-inter">End Date</Text>
            <Text className="font-interbold">{formatDate(endDate)}</Text>
          </View>
        </View>

        {/* Contract Status */}
        <View className="mx-4 mb-4 bg-white rounded-xl px-4">
          <Text className="font-interbold text-xl py-4">Contract Status</Text>

          {[
            { 
              label: 'Contract generated', 
              done: !!contractId 
            },
            { 
              label: isClientSigned || isActive ? 'Client signed' : 'Awaiting client signature', 
              done: isClientSigned || isActive 
            },
            { 
              label: isActive ? 'Builder signed' : 'Awaiting builder signature', 
              done: isActive 
            },
          ].map((step, idx) => (
            <View key={idx} className="flex-row py-3 gap-3 items-center border-b border-gray-100 last:border-0">
              <View
                className={`w-5 h-5 rounded-full items-center justify-center ${
                  step.done ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                {step.done && (
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>✓</Text>
                )}
              </View>
              <Text className={`font-inter text-sm ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        <View className="mx-4 gap-4">
          {/* Send Contract - Show only if contract exists and not active */}
          { isClientSigned && (
            <GradientButton
              loading={sendContractMutation.isPending}
              onPress={sendContract}
              title="Send Contract Via Email"
            />
          )}

          {/* Sign Contract - Show only if contract exists and not signed by client */}
          {contractId && !isClientSigned && !isActive && (
            <PrimaryButton
              loading={signContractMutation.isPending}
              onPress={signContract}
              title="Sign Contract"
              textColor="white"
              backgroundColor="#16a34a"
            />
          )}

         
          {isActive && (
            <View className="bg-green-50 p-4 rounded-lg">
              <Text className="text-green-700 font-interbold text-center">✓ Contract Active</Text>
              <Text className="text-green-600 text-center text-sm mt-1">Both parties have signed</Text>
            </View>
          )}

        </View>

      </View>
    </AppLayout>
  )
}

export default ClientContractdetailsScreen