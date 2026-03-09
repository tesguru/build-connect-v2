import AppLayout from '@/components/Layouts/AppLayout';
import { useEscrow } from '@/core/hooks/useEscrow';
import { Ionicons } from '@expo/vector-icons';
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

const formatAmount = (amount, currency = '₦') => {
  if (amount == null) return `${currency}0.00`;
  return `${currency}${Number(amount).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const copyToClipboard = async (value) => {
  if (!value) return;
  await Share.share({ message: String(value) });
};

const StatCard = ({ label, value, icon, bgColor, iconColor, textColor }) => (
  <View className={`flex-1 ${bgColor} rounded-2xl p-4`}>
    <View className={`w-9 h-9 rounded-xl ${iconColor} items-center justify-center mb-3`}>
      <Ionicons name={icon} size={18} color="#fff" />
    </View>
    <Text className={`font-inter text-xs ${textColor} mb-1`}>{label}</Text>
    <Text className={`font-interbold text-sm ${textColor}`} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const InfoRow = ({ label, value, copyable, last }) => (
  <View className={`flex-row justify-between items-center py-3 ${!last ? 'border-b border-gray-100' : ''}`}>
    <Text className="font-inter text-sm text-gray-400 w-36">{label}</Text>
    <View className="flex-row items-center gap-2 flex-1 justify-end">
      <Text
        className="font-intersemibold text-sm text-gray-800 text-right flex-shrink"
        numberOfLines={1}
      >
        {value ?? '—'}
      </Text>
      {copyable && value && (
        <TouchableOpacity onPress={() => copyToClipboard(value)} activeOpacity={0.7}>
          <Copy size={14} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const EscrowAccountDetails = () => {
  const { getEscrowAccount } = useEscrow();
  const { data: accountDetailsResponse, isLoading } = getEscrowAccount();

  const accountDetails = accountDetailsResponse?.data?.data || null;
  const wallet = accountDetails?.wallet || null;
  const currency = wallet?.currency ?? '₦';

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
        {/* ── Balance Breakdown ── */}
        <View className="px-4 mt-5">
          <Text className="font-interbold text-base text-gray-900 mb-3">Balance Breakdown</Text>
          <View className="flex-row gap-3 mb-3">
            <StatCard
              label="Total Inflow"
              value={formatAmount(wallet?.totalInflowSuccessful, currency)}
              icon="arrow-down-outline"
              bgColor="bg-green-50"
              iconColor="bg-green-500"
              textColor="text-green-700"
            />
            <StatCard
              label="Total Outflow"
              value={formatAmount(wallet?.totalOutflowSuccessful, currency)}
              icon="arrow-up-outline"
              bgColor="bg-red-50"
              iconColor="bg-red-400"
              textColor="text-red-600"
            />
          </View>
          <View className="flex-row gap-3">
            <StatCard
              label="Pending Inflow"
              value={formatAmount(wallet?.pendingInflow, currency)}
              icon="time-outline"
              bgColor="bg-amber-50"
              iconColor="bg-amber-400"
              textColor="text-amber-700"
            />
            <StatCard
              label="Pending Outflow"
              value={formatAmount(wallet?.pendingOutflow, currency)}
              icon="hourglass-outline"
              bgColor="bg-orange-50"
              iconColor="bg-orange-400"
              textColor="text-orange-700"
            />
          </View>
        </View>

    
        <View className="mx-4 mt-5 bg-white rounded-2xl p-4 border border-gray-100">
          <Text className="font-interbold text-base text-gray-900 mb-1">Account Information</Text>
          <InfoRow label="Account ID" value={accountDetails?.id} copyable />
          <InfoRow label="Bank Name" value={accountDetails?.bankName} />
          <InfoRow label="Account Number" value={accountDetails?.accountNumber} copyable />
          <InfoRow label="Currency" value={wallet?.currency} />
          <InfoRow label="Last Recalculated" value={formatDate(wallet?.lastRecalculatedAt)} />
          <InfoRow label="Date Created" value={formatDate(accountDetails?.createdAt)} />
          <InfoRow label="Last Updated" value={formatDate(accountDetails?.updatedAt)} last />
        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default EscrowAccountDetails;