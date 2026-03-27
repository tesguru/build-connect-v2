import AppLayout from '@/components/Layouts/AppLayout';
import QuickAccessCard from '@/components/PagesComponent/Dashboard/Shared/QuickAccessCard';
import { PlusIcon, SupportIcon } from '@/constants/icon';
import { BlueEscowBackground } from '@/constants/image';
import { useEscrow } from '@/core/hooks/useEscrow';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Copy, Eye } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const EscrowAccount = () => {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  const handleLogPayment = () => router.push("/escrow/logpayments");
  const handleCreateAccount = () => router.push("/escrow/createaccount");
  const handleAccountDetails = () => router.push("/escrow/accountdetails");
  const handlePaymentInstructions = () => router.push("/escrow/paymentinstructions");
    const handlePaymentLogs = () => router.push("/escrow/paymentlogs");

  const { getWalletFunding, getEscrowAccount } = useEscrow();
  const { data: apiResponse, isLoading } = getWalletFunding({ page: 1, limit: 100 });
  const { data: accountDetailsResponse, isLoading: accountDetailsLoading } = getEscrowAccount();



  const accountDetails = accountDetailsResponse?.data?.data || null;
  const wallet = accountDetails?.wallet || null;



  const formatBalance = (amount) => {
    if (amount == null) return '0.00';
    return Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <AppLayout screenName='Escrow Account'>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
    
        <View className="px-4 pt-4">
          <View className="relative rounded-2xl overflow-hidden">
            <Image
              resizeMode="cover"
              className="absolute w-full h-full"
              source={BlueEscowBackground}
            />
            <View className="p-5 pb-6">
              <View className="flex-row items-center justify-between mb-6">
                <View>
                  {accountDetailsLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <View className="flex-row items-center">
                        <Text className="text-white/80 text-sm mb-1 font-inter">
                          My Wallet Balance |{' '}
                          <Text className="font-intersemibold">
                            {accountDetails?.accountNumber ?? '—'}
                          </Text>
                        </Text>
                        <TouchableOpacity className="ml-2" activeOpacity={0.7}>
                          <Copy size={16} color="white" opacity={0.8} />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-white text-base font-intersemibold tracking-wide">
                        {accountDetails?.accountName ?? '—'}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              <View className="flex-row items-center mb-1">
                <Text className="text-white text-5xl font-interbold mr-3">
                  {wallet?.currency ?? '₦'}{formatBalance(wallet?.currentBalance)}
                </Text>
                <TouchableOpacity className="bg-white/20 p-2 rounded-full">
                  <Eye size={20} color="white" />
                </TouchableOpacity>
              </View>

              <Text className="text-white/70 text-xs mb-6 font-inter">
                Managed by {accountDetails?.bankName ?? '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Access */}
        <View className="px-4 pt-4">
          <Text className="font-interbold text-xl mb-4 text-gray-900">Quick Access</Text>
          <View className="flex-row gap-4">
            <QuickAccessCard icon={PlusIcon} title="Create Account" onPress={handleCreateAccount} />
            <QuickAccessCard icon={SupportIcon} title="Log Payment" onPress={handleLogPayment} />
                        <QuickAccessCard icon={SupportIcon} title="Account Details" onPress={handleAccountDetails} />
          </View>
        </View>

        {/* Reports */}
        <View className="p-4 bg-gray-100 mt-4">
          <Text className="font-interbold text-xl mb-4 text-gray-900">Reports</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
            onPress={handlePaymentInstructions}
              className="flex-1 flex-row items-center bg-white rounded-xl p-4"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-lg bg-blue-500 justify-center items-center mr-3">
                <Ionicons name="document-text" size={20} color="#fff" />
              </View>
              <Text className="text-sm font-medium text-gray-700 flex-1">Payment Instructions</Text>
            </TouchableOpacity>

            <TouchableOpacity
            onPress={handlePaymentLogs}
              className="flex-1 flex-row items-center bg-white rounded-xl p-4"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-lg bg-blue-500 justify-center items-center mr-3">
                <Ionicons name="bar-chart" size={20} color="#fff" />
              </View>
              <Text className="text-sm font-medium text-gray-700 flex-1">Payments Logs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default EscrowAccount;