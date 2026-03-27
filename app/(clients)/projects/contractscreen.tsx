import PrimaryButton from '@/components/Buttons/Button'
import GradientButton from '@/components/Buttons/GradientButton'
import AppLayout from '@/components/Layouts/AppLayout'
import { MarkEmoji } from '@/constants/icon'
import { useBids } from '@/core/hooks/UseBids'
import axiosInstance from '@/core/services/axios'
import * as FileSystem from 'expo-file-system'
import { useLocalSearchParams } from 'expo-router'
import * as Sharing from 'expo-sharing'
import React from 'react'
import { ActivityIndicator, Image, Text, View } from 'react-native'

const ClientContractdetailsScreen = () => {
  const { bidId, projectTitle, companyName, bidsData } = useLocalSearchParams<{
    bidId: string
    companyName: string
    projectTitle: string
    bidsData: string
  }>()

  const parsedBidsData = bidsData ? JSON.parse(bidsData) : {}
  const milestones     = parsedBidsData?.milestones || []
  const startDate      = milestones[0]?.completionDate
  const endDate        = milestones[milestones.length - 1]?.completionDate


  const {
    sendContractMutation,
    downloadContractMutation,
    signContractMutation,
    getContractByBidQuery,
  } = useBids()

  const { data: contractResponse, isLoading: isLoadingContract } = getContractByBidQuery(bidId)
  const parsedcontractData = contractResponse?.data?.data || contractResponse?.data || {}
  const contractStatus     = parsedcontractData?.status

  const isClientSigned  = contractStatus === 'client_signed' || contractStatus === 'contractor_signed'
  const isBuilderSigned = contractStatus === 'contractor_signed'

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  const sendContract     = () => sendContractMutation.mutate(parsedcontractData.id)
  const signContract     = () => signContractMutation.mutate(parsedcontractData.id)

  const downloadContract = async () => {
    try {
      const response = await downloadContractMutation.mutateAsync(parsedcontractData.id)
      const baseURL  = axiosInstance.defaults.baseURL
      const fileUrl  = `${baseURL}${response.url}`
      const token    = axiosInstance.defaults.headers.common['Authorization']
      const fileName = `contract_${parsedcontractData.id}.pdf`
      const localUri = FileSystem.documentDirectory + fileName

      const { uri } = await FileSystem.downloadAsync(fileUrl, localUri, {
        headers: { Authorization: `${token}` },
      })

      const isSharingAvailable = await Sharing.isAvailableAsync()
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save Contract',
          UTI: 'com.adobe.pdf',
        })
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
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

  return (
    <AppLayout screenName="Contract Details">
      <View className="pt-4">

        {/* Header */}
        <View className="items-center mb-6">
          <Image style={{ width: 90, height: 90 }} source={MarkEmoji} resizeMode="contain" />
          <Text className="font-interbold pt-2 text-center">Bid Selected</Text>
          <Text className="font-inter pt-1 text-center text-gray-500">
            You've selected {companyName}
          </Text>
        </View>

        {/* Contract Details */}
        <View className="mx-4 mb-4 bg-white rounded-xl px-4">
          <Text className="font-interbold py-4 text-xl">{projectTitle}</Text>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Contractor</Text>
            <Text className="font-interbold">{companyName}</Text>
          </View>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Total Amount</Text>
            <Text className="font-interbold">{parsedBidsData?.bidAmount}</Text>
          </View>

          <View className="flex-row py-3 justify-between border-b border-gray-100">
            <Text className="text-gray-500 font-inter">Timeline</Text>
            <Text className="font-interbold">{parsedBidsData?.proposedTimeline}</Text>
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
            { label: 'Contract generated',        done: true            },
            { label: isClientSigned  ? 'Client signed'  : 'Awaiting client signature',  done: isClientSigned  },
            { label: isBuilderSigned ? 'Builder signed' : 'Awaiting builder signature', done: isBuilderSigned },
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
          <GradientButton
            loading={sendContractMutation.isPending}
            onPress={sendContract}
            title="Send Contract Via Email"
          />

          
          {isClientSigned && !isBuilderSigned && (
            <PrimaryButton
              loading={signContractMutation.isPending}
              onPress={signContract}
              title="Sign Contract"
              textColor="white"
              backgroundColor="#16a34a"
            />
          )}

         
        </View>

      </View>
    </AppLayout>
  )
}

export default ClientContractdetailsScreen