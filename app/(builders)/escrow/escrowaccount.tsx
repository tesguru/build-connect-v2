import AppLayout from '@/components/Layouts/AppLayout';
import QuickAccessCard from '@/components/PagesComponent/Dashboard/Shared/QuickAccessCard';
import { PlusIcon, SupportIcon } from '@/constants/icon';
import { BlueEscowBackground } from '@/constants/image';
import { useEscrow } from '@/core/hooks/useEscrow';
import { useRouter } from 'expo-router';
import { Copy } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const EscrowAccount = () => {
  const router = useRouter();

  const handleLogPayment       = () => router.push("/escrow/logpayments");
  const handleAccountDetails   = () => router.push("/escrow/accountdetails");
  const handlePaymentInstructions = () => router.push("/escrow/paymentinstructions");
  const handlePaymentLogs      = () => router.push("/escrow/paymentlogs");

  const { getPayoutAccount } = useEscrow();
  const { data: accountDetailsResponse, isLoading: accountDetailsLoading } = getPayoutAccount();

  /* Normalise response */
  const accountDetails = accountDetailsResponse?.data?.data || accountDetailsResponse?.data || null;
  const accountExists  = !!accountDetails?.id;

  /* Create → fresh form | Update → prefill with existing data via params */
  const handleCreateOrUpdateAccount = () => {
    if (accountExists) {
      router.push({
        pathname: '/escrow/createaccount',
        params: {
          mode:          'update',
          bankName:      accountDetails?.bankName      ?? '',
          accountName:   accountDetails?.accountName   ?? '',
          accountNumber: accountDetails?.accountNumber ?? '',
        },
      });
    } else {
      router.push('/escrow/createaccount');
    }
  };

  return (
    <AppLayout screenName='Escrow Account'>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Wallet / Account Hero ── */}
        <View className="px-4 pt-4">
          <View className="relative rounded-2xl overflow-hidden">
            <Image resizeMode="cover" className="absolute w-full h-full" source={BlueEscowBackground} />
            <View className="p-5 pb-6">
              {accountDetailsLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <View className="flex-row items-center mb-1">
                    <Text className="text-white/80 text-sm font-inter">
                      Escrow Account |{' '}
                      <Text className="font-intersemibold">
                        {accountDetails?.accountNumber ?? '—'}
                      </Text>
                    </Text>
                    <TouchableOpacity className="ml-2" activeOpacity={0.7}>
                      <Copy size={16} color="white" opacity={0.8} />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-white text-xl font-interbold mt-1 mb-1">
                    {accountDetails?.accountName ?? 'No account linked yet'}
                  </Text>

                  <Text className="text-white/70 text-xs font-inter mt-1">
                    {accountDetails?.bankName
                      ? `Managed by ${accountDetails.bankName}`
                      : 'Link a payout account to get started'}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* ── Quick Access ── */}
        <View className="px-4 pt-4">
          <Text className="font-interbold text-xl mb-4 text-gray-900">Quick Access</Text>
          <View className="flex-row gap-4">
            {/* Label swaps between Create / Update */}
            <QuickAccessCard
              icon={PlusIcon}
              title={accountExists ? 'Update Account' : 'Create Account'}
              onPress={handleCreateOrUpdateAccount}
            />
            <QuickAccessCard icon={SupportIcon} title="Payment Instructions"      onPress={handlePaymentInstructions}    />
            <QuickAccessCard icon={SupportIcon} title="Account Details"  onPress={handleAccountDetails} />
          </View>
        </View>

       

      </ScrollView>
    </AppLayout>
  );
};

export default EscrowAccount;