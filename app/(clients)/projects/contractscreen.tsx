import PrimaryButton from '@/components/Buttons/Button'
import GradientButton from '@/components/Buttons/GradientButton'
import AppLayout from '@/components/Layouts/AppLayout'
import { MarkCircle, MarkEmoji } from '@/constants/icon'
import React from 'react'
import { Image, View, Text } from 'react-native'

const ClientContractdetailsScreen = () => {
  return (
    <AppLayout screenName='Contract Details'>
    <View className="pt-4">
      <View className="flex-row justify-center">
         <View className="">
          <View className="pl-10">
       <Image className="" style={{width:90, height:90}} source={MarkEmoji} resizeMode="contain"/>
       </View>
        <Text className="font-interbold pt-2 text-center ">Bid Selected</Text>
         <Text className="font-inter pt-2 text-center">You've selected BuildRight Inc</Text>
      </View>
      </View>
     
      <View className="mx-4 pt-10">
        <Text className="font-interbold p-4 text-xl">Modern Bungalow Build</Text>
        <View className="flex-row justify-between">
          <Text className="text-gray-500 font-inter">Contractor:</Text>
           <Text className="font-interbold">BuildRight</Text>
        </View>
           <View className="flex-row py-2 justify-between">
          <Text className="text-gray-500 font-inter">Total Amount:</Text>
           <Text className="font-interbold">#56,000</Text>
        </View>
            <View className="flex-row py-2 justify-between">
          <Text className="text-gray-500 font-inter">Timeline:</Text>
           <Text className="font-interbold">12 months</Text>
        </View>

          <View className="flex-row py-2 justify-between">
          <Text className="text-gray-500 font-inter">StartDate:</Text>
           <Text className="font-interbold">Oct 15, 2024</Text>
        </View>

          <View className="flex-row py-2 justify-between">
          <Text className="text-gray-500 font-inter">End Date:</Text>
           <Text className="font-interbold">Oct 15, 2024</Text>
        </View>
      </View>

      <View className="mx-4 pt-5">
        <Text className="font-interbold text-xl p-4">Contract Status</Text>

           <View className="flex-row py-2 gap-4">
         <View><Image style={{width:20, height:20}} source={MarkCircle}/></View>
           <Text className="font-inter">Client generated</Text>
        </View>
           <View className="flex-row gap-4">
         <View><Image style={{width:20, height:20}}  source={MarkCircle}/></View>
           <Text className="font-inter">Client generated</Text>
        </View>  
      </View>

      <View className="mx-4 pt-8">
        
       <GradientButton title="Send Contract Via Email" />
     
     <View className="pt-4">
        <PrimaryButton title="Download Contract" textColor="black" backgroundColor="white" className="border  border-gray-300"/>
        </View>
      </View>
    </View>
    </AppLayout>
  )
}

export default ClientContractdetailsScreen