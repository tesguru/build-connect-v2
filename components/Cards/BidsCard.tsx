import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { SampleImage21 } from '@/constants/image'
import { useRouter } from 'expo-router'

export const BidsCard = () => {
  const router = useRouter(); 

  const gotoContractDetails = () => {

    router.push('/contractdetails/contractdetails'); 
    
  };

  const handleStartWork = () => {

    console.log('Start work pressed');

  };

  return (
    <View className="flex-row mx-1">
      <View className="flex-row w-full">
        <View className="w-1/3 items-center">
          <Image 
            source={SampleImage21} 
            className="rounded-xl" 
            style={{ width: 100, height: 100 }} 
            resizeMode="cover" 
          />
        </View>

        <View className="w-1/3">
          <Text className="font-interbold shadow-xl text-lg">Kitchen ReModel</Text>
          <Text className="text-gray-400 pt-1">Project Id: 44382</Text>
          <Text className="font-interbold text-lg pt-1">#60,000</Text>
          <Text className="font-inter text-xs text-green-300 pt-6">Accepted</Text>
          <TouchableOpacity 
            style={{ width: 100 }} 
            className="bg-blue-600 rounded-lg py-2 mt-2 items-center"
            onPress={gotoContractDetails}
          >
            <Text className="text-white font-intersemibold text-xs">
              View Contract
            </Text>
          </TouchableOpacity>
        </View>

        <View className="w-1/3 rounded-xl">
          <Text className="font-inter text-xs text-green-300 pb-20 text-center">Accepted</Text>
          <Text className="font-inter text-xs text-gray-400 text-center">Pending</Text>
          <TouchableOpacity 
            style={{ width: 100 }} 
            className="bg-white border pt-3 border-gray-300 mt-2 rounded-lg py-2 items-center"
            onPress={handleStartWork}
          >
            <Text className="text-gray-800 font-intersemibold text-xs">
              Start work
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};