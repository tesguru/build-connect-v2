import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { BlueEscowBackground } from '@/constants/image'
import AppLayout from '@/components/Layouts/AppLayout'
import QuickAccessCard from '@/components/PagesComponent/Dashboard/Shared/QuickAccessCard'
import { PlusIcon, SupportIcon } from '@/constants/icon'
import ExpenseChart from './chart'
import { Ionicons } from '@expo/vector-icons'
import { Copy, Eye, Link2, Receipt } from 'lucide-react-native'

const EscrowAccount = () => {
  const router = useRouter();

  const handleDocument = () => {
  router.push("/escrow/escrowaccount" as any);
  };

  const handleSupport = () => {
    router.push("/support/support");
  };

  const handleEscrowLinkProject = () => {
    router.push("/escrow/escrowlinkproject");
  };

  const handleEscrowHistoryReciept = () => {
    router.push("/escrow/escrowhistoryreciept");
  };

  return (
    <AppLayout screenName='Escrow Account'>
      <View className="px-4 pt-4">
        <View className="relative rounded-2xl overflow-hidden">
          {/* Background Image */}
          <Image 
            resizeMode="cover" 
            className="absolute w-full h-full"
            source={BlueEscowBackground} 
          />
          
          {/* Content Overlay */}
          <View className="p-5 pb-6">
            {/* Header Section */}
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <View className="flex-row items-center">
                  <Text className="text-white/80 text-sm mb-1 font-inter">
                    My Wallet Balance | <Text className="font-intersemibold">2041467890</Text>
                  </Text>
                  <TouchableOpacity className="ml-2" activeOpacity={0.7}>
                    <Copy size={16} color="white" opacity={0.8} />
                  </TouchableOpacity>
                </View>
                <Text className="text-white text-base font-intersemibold tracking-wide">
                  ONABANJO ADEBOLANLE
                </Text>
              </View>
            </View>

            {/* Balance Section */}
            <View className="flex-row items-center mb-1">
              <Text className="text-white text-5xl font-interbold mr-3">₦0.00</Text>
              <TouchableOpacity className="bg-white/20 p-2 rounded-full">
                <Eye size={20} color="white" />
              </TouchableOpacity>
            </View>

            <Text className="text-white/70 text-xs mb-6 font-inter">
              Managed by HomeBase Mortgage Bank
            </Text>

            {/* Action Buttons */}
            <View className="flex-row justify-between">
              <TouchableOpacity onPress={handleEscrowLinkProject} className="bg-white rounded-full px-8 py-3 flex-row items-center">
                <Link2 size={18} color="#1f2937" strokeWidth={2.5} />
                <Text className="ml-2 font-inter text-xs text-gray-800">View project</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleEscrowHistoryReciept} className="bg-white/20 rounded-full px-8 py-3 flex-row items-center">
                <Receipt size={18} color="white" strokeWidth={2.5} />
                <Text className="ml-2 font-inter text-xs text-white">History & Receipts</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View className="px-4 pt-4">
        <Text className="font-interbold text-xl mb-4 text-gray-900">
          Quick Access
        </Text>
        <View className="flex-row gap-4">
          <QuickAccessCard
            icon={PlusIcon}
            title="Document"
            onPress={handleDocument}
          />
         
          <QuickAccessCard
            icon={SupportIcon}
            title="Support"
            onPress={handleSupport}
          />
        </View>
      </View>

      <View className="p-4 bg-gray-100">
        <Text className="font-interbold text-xl mb-4 text-gray-900">
          Reports
        </Text>
        
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 flex-row items-center bg-white rounded-xl p-4 active:opacity-70"
            onPress={() => console.log('Statement pressed')}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-lg bg-blue-500 justify-center items-center mr-3">
              <Ionicons name="document-text" size={20} color="#fff" />
            </View>
            <Text className="text-sm font-medium text-gray-700 flex-1">
              Statement
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center bg-white rounded-xl p-4 active:opacity-70"
            onPress={() => console.log('Daily Summary pressed')}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-lg bg-blue-500 justify-center items-center mr-3">
              <Ionicons name="bar-chart" size={20} color="#fff" />
            </View>
            <Text className="text-sm font-medium text-gray-700 flex-1">
              Daily Summary
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="pl-4 pt-4">
        <Text className="font-interbold text-xl mb-4 text-gray-900">
          Spending Trend
        </Text>
        <ExpenseChart/>
      </View>
    </AppLayout>
  )
}

export default EscrowAccount