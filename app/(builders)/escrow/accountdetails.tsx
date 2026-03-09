import AppLayout from '@/components/Layouts/AppLayout';
import { useEscrow } from '@/core/hooks/useEscrow';
import { Copy } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const copyToClipboard = async (value?: string) => {
  if (!value) return;
  await Share.share({ message: String(value) });
};

/* ─── Info Row ───────────────────────────────────────────── */
const InfoRow = ({
  label,
  value,
  copyable,
  last,
}: {
  label: string
  value?: string
  copyable?: boolean
  last?: boolean
}) => (
  <View
    className={`flex-row justify-between items-center py-3.5 ${
      !last ? 'border-b border-gray-100' : ''
    }`}
  >
    <Text className="font-inter text-sm text-gray-400 w-36">{label}</Text>
    <View className="flex-row items-center gap-2 flex-1 justify-end">
      <Text
        className="font-intersemibold text-sm text-gray-800 text-right flex-shrink"
        numberOfLines={1}
      >
        {value ?? '—'}
      </Text>
      {copyable && value ? (
        <TouchableOpacity onPress={() => copyToClipboard(value)} activeOpacity={0.7}>
          <Copy size={14} color="#9ca3af" />
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);


const EscrowAccountDetails = () => {
  const { getPayoutAccount } = useEscrow();
  const { data: accountDetailsResponse, isLoading } = getPayoutAccount();

  
  const accountDetails = accountDetailsResponse?.data?.data || accountDetailsResponse?.data || null;

  if (isLoading) {
    return (
      <AppLayout screenName="Account Details">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2463EB" />
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout screenName="Account Details">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >

     
        <View className="px-4 mt-5">
          <View className="bg-blue-600 rounded-2xl p-5">
            <Text className="text-white/70 text-xs font-inter mb-1">Account Name</Text>
            <Text className="text-white text-xl font-interbold mb-4">
              {accountDetails?.accountName ?? '—'}
            </Text>

            <View className="flex-row justify-between">
              <View>
                <Text className="text-white/70 text-xs font-inter mb-0.5">Account Number</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-white text-base font-intersemibold">
                    {accountDetails?.accountNumber ?? '—'}
                  </Text>
                  {accountDetails?.accountNumber ? (
                    <TouchableOpacity
                      onPress={() => copyToClipboard(accountDetails.accountNumber)}
                      activeOpacity={0.7}
                    >
                      <Copy size={15} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              <View className="items-end">
                <Text className="text-white/70 text-xs font-inter mb-0.5">Bank</Text>
                <Text className="text-white text-base font-intersemibold">
                  {accountDetails?.bankName ?? '—'}
                </Text>
              </View>
            </View>
          </View>
        </View>

     
        <View className="mx-4 mt-5 bg-white rounded-2xl p-4 border border-gray-100">
          <Text className="font-interbold text-base text-gray-900 mb-1">
            Account Information
          </Text>

          <InfoRow label="Account ID"     value={accountDetails?.id}            copyable />
          <InfoRow label="Bank Name"      value={accountDetails?.bankName}                />
          <InfoRow label="Account Name"   value={accountDetails?.accountName}             />
          <InfoRow label="Account Number" value={accountDetails?.accountNumber} copyable  />
          <InfoRow label="Date Created"   value={formatDate(accountDetails?.createdAt)}   />
          <InfoRow label="Last Updated"   value={formatDate(accountDetails?.updatedAt)}   last />
        </View>

      </ScrollView>
    </AppLayout>
  );
};

export default EscrowAccountDetails;