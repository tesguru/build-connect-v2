import PrimaryButton from '@/components/Buttons/Button'
import GradientButton from '@/components/Buttons/GradientButton'
import AppLayout from '@/components/Layouts/AppLayout'
import { useBids } from '@/core/hooks/UseBids'
import axiosInstance from '@/core/services/axios'
import * as FileSystem from 'expo-file-system'
import { useLocalSearchParams } from 'expo-router'
import * as Sharing from 'expo-sharing'
import React from 'react'
import { Image, Text, View } from 'react-native'

const ClientContractdetailsScreen = () => {
  const { projectTitle, companyName, bidsData, contractData } = useLocalSearchParams<{
    bidId: string
    projectTimeline: string
    companyName: string
    projectTitle: string
    bidsData: string
    contractData: string
  }>()

  const parsedBidsData = bidsData ? JSON.parse(bidsData) : {}
  const parsedcontractData = contractData ? JSON.parse(contractData) : {}
  const milestones = parsedBidsData?.milestones || []
  const startDate = milestones[0]?.completionDate
  const endDate = milestones[milestones.length - 1]?.completionDate
  const contractStatus = parsedcontractData?.status

  const isClientSigned = contractStatus === 'client_signed' || contractStatus === 'contractor_signed'
  const isBuilderSigned = contractStatus === 'contractor_signed'

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const { sendContractMutation, downloadContractMutation, signContractMutation } = useBids()

  const sendContract = () => {
    sendContractMutation.mutate(parsedcontractData.id)
  }

  const signContract = () => {
    signContractMutation.mutate(parsedcontractData.id)
  }

  const downloadContract = async () => {
    try {
      const response = await downloadContractMutation.mutateAsync(parsedcontractData.id)

      // Build full URL from axiosInstance base URL + returned path
      const baseURL = axiosInstance.defaults.baseURL
      const fileUrl = `${baseURL}${response.url}`

      // Grab auth token from axiosInstance headers
      const token = axiosInstance.defaults.headers.common['Authorization']

      const fileName = `contract_${parsedcontractData.id}.pdf`
      const localUri = FileSystem.documentDirectory + fileName

      // Download the PDF binary directly to device
      const { uri } = await FileSystem.downloadAsync(fileUrl, localUri, {
        headers: {
          Authorization: `${token}`,
        },
      })

      // Open share/save dialog
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
    <AppLayout screenName='Contract Details'>
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
            <Text className="font-inter pt-2 text-center">You've selected {companyName}</Text>
          </View>
        </View>

        {/* Contract Details */}
        <View className="mx-4 mt-10 px-2 mb-2 bg-white">
          <Text className="font-interbold p-4 text-xl">{projectTitle}</Text>

          <View className="flex-row justify-between">
            <Text className="text-gray-500 font-inter">Contractor:</Text>
            <Text className="font-interbold">{companyName}</Text>
          </View>

          <View className="flex-row py-2 justify-between">
            <Text className="text-gray-500 font-inter">Total Amount:</Text>
            <Text className="font-interbold">{parsedBidsData?.bidAmount}</Text>
          </View>

          <View className="flex-row py-2 justify-between">
            <Text className="text-gray-500 font-inter">Timeline:</Text>
            <Text className="font-interbold">{parsedBidsData?.proposedTimeline}</Text>
          </View>

          <View className="flex-row py-2 justify-between">
            <Text className="text-gray-500 font-inter">Start Date:</Text>
            <Text className="font-interbold">{formatDate(startDate)}</Text>
          </View>

          <View className="flex-row py-2 justify-between">
            <Text className="text-gray-500 font-inter">End Date:</Text>
            <Text className="font-interbold">{formatDate(endDate)}</Text>
          </View>
        </View>

        
        <View className="mx-4 pb-4 mt-2  bg-white px-4 rounded-xl">
          <Text className="font-interbold text-xl py-5">Contract Status</Text>


          <View className="flex-row py-2 gap-4 items-center">
            <Image style={{ width: 20, height: 20 }} source={MarkCircle} />
            <Text className="font-inter">Contract generated</Text>
          </View>

      
          <View className="flex-row py-2 gap-4 items-center">
            <Image style={{ width: 20, height: 20 }} source={isClientSigned ? MarkCircle : MarkPending} />
            <Text className="font-inter">
              {isClientSigned ? 'Client signed' : 'Awaiting client signature'}
            </Text>
          </View>

       
          <View className="flex-row py-2 gap-4 items-center">
            <Image style={{ width: 20, height: 20 }} source={isBuilderSigned ? MarkCircle : MarkPending} />
            <Text className="font-inter">
              {isBuilderSigned ? 'Builder signed' : 'Awaiting builder signature'}
            </Text>
          </View>
        </View>

        <View className="mx-4 pt-8">
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
    </AppLayout>
  )
}

export default ClientContractdetailsScreen