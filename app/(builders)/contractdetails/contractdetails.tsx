import PrimaryButton from '@/components/Buttons/Button'
import GradientButton from '@/components/Buttons/GradientButton'
import AppLayout from '@/components/Layouts/AppLayout'
import { MarkCircle, MarkEmoji, MarkPending } from '@/constants/icon'
import { useBids } from '@/core/hooks/UseBids'
import axiosInstance from '@/core/services/axios'
import * as FileSystem from 'expo-file-system'
import { useLocalSearchParams } from 'expo-router'
import * as Sharing from 'expo-sharing'
import React from 'react'
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native'

const ClientContractdetailsScreen = () => {
  const { contractId, bidId } = useLocalSearchParams<{
    bidId: string
    contractId: string
  }>()

  const {
    singleContractQuery,
    singleBidQuery,
    sendContractMutation,
    downloadContractMutation,
    signContractMutation,
  } = useBids()

  const {
    data: contractApiResponse,
    isLoading: isLoadingContract,
  } = singleContractQuery(contractId)

  const {
    data: bidApiResponse,
    isLoading: isLoadingBid,
  } = singleBidQuery(bidId)


  if (isLoadingContract || isLoadingBid) {
    return (
      <AppLayout screenName="Contract Details">
        <View className="flex-1 items-center justify-center py-60">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </AppLayout>
    )
  }

  const contractDataApi = contractApiResponse?.data?.data ?? {}
  const bidDataApi = bidApiResponse?.data?.data ?? {}

  const milestones = bidDataApi?.milestones || []
  const startDate = milestones[0]?.completionDate
  const endDate = milestones[milestones.length - 1]?.completionDate
  const contractStatus = contractDataApi?.status

  const isClientSigned = contractStatus === 'client_signed' || contractStatus === 'contractor_signed'
  const isBuilderSigned = contractStatus === 'contractor_signed'

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const sendContract = () => {
    sendContractMutation.mutate(contractDataApi.id)
  }

  const signContract = () => {
    signContractMutation.mutate(contractDataApi.id)
  }

  const downloadContract = async () => {
    try {
      const response = await downloadContractMutation.mutateAsync(contractDataApi.id)
      const baseURL = axiosInstance.defaults.baseURL
      const fileUrl = `${baseURL}${response.url}`
      const token = axiosInstance.defaults.headers.common['Authorization']
      const fileName = `contract_${contractDataApi.id}.pdf`
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

  return (
    <AppLayout screenName="Contract Details">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="pt-4">

          {/* Header */}
          <View className="flex-row justify-center">
            <View>
              <View className="pl-10">
                <Image
                  style={{ width: 90, height: 90 }}
                  source={MarkEmoji}
                  resizeMode="contain"
                />
              </View>
              <Text className="font-interbold pt-2 text-center">Bid Selected</Text>
              <Text className="font-inter pt-2 text-center">
                You've selected {contractDataApi?.contractor?.name}
              </Text>
            </View>
          </View>

      
          <View className="mx-4 mt-10 px-4 mb-2 bg-white rounded-xl">
            <Text className="font-interbold p-4 text-xl">
              {bidDataApi?.project?.title}
            </Text>

            <View className="flex-row justify-between py-2">
              <Text className="text-gray-500 font-inter">Contractor:</Text>
              <Text className="font-interbold">{contractDataApi?.contractor?.name}</Text>
            </View>

            <View className="flex-row py-2 justify-between">
              <Text className="text-gray-500 font-inter">Total Amount:</Text>
              <Text className="font-interbold">{bidDataApi?.bidAmount}</Text>
            </View>

            <View className="flex-row py-2 justify-between">
              <Text className="text-gray-500 font-inter">Timeline:</Text>
              <Text className="font-interbold">{bidDataApi?.proposedTimeline}</Text>
            </View>

            <View className="flex-row py-2 justify-between">
              <Text className="text-gray-500 font-inter">Start Date:</Text>
              <Text className="font-interbold">{formatDate(startDate)}</Text>
            </View>

            <View className="flex-row py-2 justify-between pb-4">
              <Text className="text-gray-500 font-inter">End Date:</Text>
              <Text className="font-interbold">{formatDate(endDate)}</Text>
            </View>
          </View>

          {/* Contract Status */}
          <View className="mx-4 pb-4 mt-2 bg-white px-4 rounded-xl">
            <Text className="font-interbold text-xl py-5">Contract Status</Text>

            {/* Contract Generated */}
            <View className="flex-row py-2 gap-4 items-center">
              <Image style={{ width: 20, height: 20 }} source={MarkCircle} />
              <Text className="font-inter">Contract generated</Text>
            </View>

            {/* Client Signed */}
            <View className="flex-row py-2 gap-4 items-center">
              <Image
                style={{ width: 20, height: 20 }}
                source={isClientSigned ? MarkCircle : MarkPending}
              />
              <Text className="font-inter">
                {isClientSigned ? 'Client signed' : 'Awaiting client signature'}
              </Text>
            </View>

            <View className="flex-row py-2 gap-4 items-center">
              <Image
                style={{ width: 20, height: 20 }}
                source={isBuilderSigned ? MarkCircle : MarkPending}
              />
              <Text className="font-inter">
                {isBuilderSigned ? 'Builder signed' : 'Awaiting builder signature'}
              </Text>
            </View>
          </View>

       
          <View className="mx-4 pt-8 pb-10">
            <GradientButton
              loading={sendContractMutation.isPending}
              onPress={sendContract}
              title="Send Contract Via Email"
            />

            {!isClientSigned && (
              <View className="pt-4">
                <PrimaryButton
                  loading={signContractMutation.isPending}
                  onPress={signContract}
                  title="Sign Contract"
                  textColor="white"
                  backgroundColor="#16a34a"
                />
              </View>
            )}

            <View className="pt-4">
              <PrimaryButton
                loading={downloadContractMutation.isPending}
                onPress={downloadContract}
                title="Download Contract"
                textColor="black"
                backgroundColor="white"
                className="border border-gray-300"
              />
            </View>
          </View>

        </View>
      </ScrollView>
    </AppLayout>
  )
}

export default ClientContractdetailsScreen