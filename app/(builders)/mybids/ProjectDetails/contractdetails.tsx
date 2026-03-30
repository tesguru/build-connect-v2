import PrimaryButton from '@/components/Buttons/Button'
import GradientButton from '@/components/Buttons/GradientButton'
import SuccessScreen from '@/components/Notifications/SucessScreen'
import { MarkEmoji } from '@/constants/icon'
import { useBids } from '@/core/hooks/UseBids'
import React, { useEffect } from 'react'
import { ActivityIndicator, Alert, Image, Text, View } from 'react-native'

type Props = {
  contractId: string;
  bidId: string;
};

const BuilderContractdetailsScreen = ({ bidId, contractId }: Props) => {
  const {
    singleContractQuery,
    singleBidQuery,
    sendContractMutation,
    signContractMutation,
    signSuccess,
    sendSuccess
  } = useBids()

  const {
    data: contractApiResponse,
    isLoading: isLoadingContract,
    error: contractError
  } = singleContractQuery(contractId)

  const {
    data: bidApiResponse,
    isLoading: isLoadingBid,
    error: bidError
  } = singleBidQuery(bidId)

  // Handle errors
  useEffect(() => {
    if (contractError) {
      Alert.alert('Error', 'Failed to load contract details. Please try again.')
    }
  }, [contractError])

  useEffect(() => {
    if (bidError) {
      Alert.alert('Error', 'Failed to load bid details. Please try again.')
    }
  }, [bidError])

  // Handle mutation errors
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

  if (isLoadingContract || isLoadingBid) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-500 font-inter">Loading contract...</Text>
      </View>
    )
  }

  const contractDataApi = contractApiResponse?.data?.data ?? {}
  const bidDataApi = bidApiResponse?.data?.data ?? {}
  const milestones = bidDataApi?.milestones || []
  const startDate = milestones[0]?.completionDate
  const endDate = milestones[milestones.length - 1]?.completionDate
  const contractStatus = contractDataApi?.status
  const isClientSigned = contractStatus === 'client_signed'
  const isActive = contractStatus === 'active'
  const isBuilderSigned = contractStatus === 'builder_signed'
  const isDraft = contractStatus === 'draft'

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

  const sendContract = () => {
    if (!contractDataApi?.id) {
      Alert.alert('Error', 'Contract ID not found')
      return
    }
    sendContractMutation.mutate(contractDataApi.id)
  }

  const signContract = () => {
    if (!contractDataApi?.id) {
      Alert.alert('Error', 'Contract ID not found')
      return
    }
    signContractMutation.mutate(contractDataApi.id)
  }

  // Show success screens after mutations
  if (signSuccess) {
    return (
      <SuccessScreen
        title="Contract Signed!"
        message="You have successfully signed the contract."
        navigateTo="/(clients)/mybids/bids"
        buttonTitle="Return to my bids"
      />
    )
  }

  if (sendSuccess) {
    return (
      <SuccessScreen
        title="Contract Sent!"
        message="The contract has been successfully sent via email."
        navigateTo="/(clients)/mybids/bids"
        buttonTitle="Return to my bids"
      />
    )
  }

  // Show error state if both queries failed
  if (contractError || bidError) {
    return (
      <View className="flex-1 justify-center items-center py-20 px-4">
        <Text className="text-red-500 text-center mb-4 font-inter">
          Failed to load contract details
        </Text>
        <PrimaryButton
          onPress={() => {
            singleContractQuery.refetch?.()
            singleBidQuery.refetch?.()
          }}
          title="Retry"
          textColor="white"
          backgroundColor="#2563EB"
        />
      </View>
    )
  }

  return (
    <View className="pt-4">
      {/* Header */}
      <View className="items-center mb-6">
        <Image style={{ width: 90, height: 90 }} source={MarkEmoji} resizeMode="contain" />
        <Text className="font-interbold pt-2 text-center">Bid Selected</Text>
        <Text className="font-inter pt-1 text-center text-gray-500">
          You've selected {contractDataApi?.contractor?.name || 'Contractor'}
        </Text>
      </View>

      {/* Contract Details */}
      <View className="mx-4 mb-4 bg-white rounded-xl px-4">
        <Text className="font-interbold py-4 text-xl">{bidDataApi?.project?.title || 'Project Title'}</Text>

        <View className="flex-row py-3 justify-between border-b border-gray-100">
          <Text className="text-gray-500 font-inter">Contractor</Text>
          <Text className="font-interbold">{contractDataApi?.contractor?.name || '—'}</Text>
        </View>

        <View className="flex-row py-3 justify-between border-b border-gray-100">
          <Text className="text-gray-500 font-inter">Total Amount</Text>
          <Text className="font-interbold">{bidDataApi?.bidAmount || '—'}</Text>
        </View>

        <View className="flex-row py-3 justify-between border-b border-gray-100">
          <Text className="text-gray-500 font-inter">Timeline</Text>
          <Text className="font-interbold">{bidDataApi?.proposedTimeline || '—'}</Text>
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
            done: !!contractDataApi?.id 
          },
          { 
            label: isClientSigned || isActive ? 'Client signed' : 'Awaiting client signature', 
            done: isClientSigned || isActive 
          },
          { 
            label: isActive || isBuilderSigned ? 'Builder signed' : 'Awaiting builder signature', 
            done: isActive || isBuilderSigned 
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

        {isActive  && (
          <GradientButton
            loading={sendContractMutation.isPending}
            onPress={sendContract}
            title="Send Contract Via Email"
          />
        )}

        {/* Sign Contract - Builder can sign if client has signed and contract not active */}
        {!isActive && isClientSigned && !isBuilderSigned && (
          <PrimaryButton
            loading={signContractMutation.isPending}
            onPress={signContract}
            title="Sign Contract"
            textColor="white"
            backgroundColor="#16a34a"
          />
        )}

        {/* Show waiting state if client hasn't signed yet */}
        {!isActive && !isClientSigned && contractDataApi?.id && (
          <View className="bg-yellow-50 p-4 rounded-lg">
            <Text className="text-yellow-700 font-interbold text-center">⏳ Waiting for Client</Text>
            <Text className="text-yellow-600 text-center text-sm mt-1">
              Waiting for client to sign the contract
            </Text>
          </View>
        )}

        {/* Active Contract Status */}
        {isActive && (
          <View className="bg-green-50 p-4 rounded-lg">
            <Text className="text-green-700 font-interbold text-center">✓ Contract Active</Text>
            <Text className="text-green-600 text-center text-sm mt-1">Both parties have signed</Text>
          </View>
        )}

        {/* Loading state for mutations */}
        {(sendContractMutation.isPending || signContractMutation.isPending) && (
          <View className="bg-gray-50 p-4 rounded-lg">
            <ActivityIndicator size="small" color="#2563EB" />
            <Text className="text-gray-600 text-center text-sm mt-2">
              {sendContractMutation.isPending ? 'Sending contract...' : 'Signing contract...'}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default BuilderContractdetailsScreen