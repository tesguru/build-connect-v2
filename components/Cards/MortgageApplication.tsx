import { Building2, CalendarDays, MapPin } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export type MortgageApplication = {
  id: string;
  status: string;
  decisionOutcome: string;
  decisionNotes: string;
  decisionAt: string;
  firstName: string;
  lastName: string;
  occupation: string;
  employerName: string;
  annualGrossIncome: number;
  employmentStatus: { id: string; label: string; value: string };
  property: { id: string; title: string; price: number; location: string };
  createdAt: string;
};

type StatusConfig = {
  dot: string;
  label: string;
  labelColor: string;
};

const getStatusConfig = (status: string): StatusConfig => {
  const s = status?.toLowerCase();
  if (s === 'approved')
    return { dot: 'bg-green-400', label: 'Approved', labelColor: 'text-green-500' };
  if (s === 'rejected' || s === 'declined')
    return { dot: 'bg-red-400', label: 'Rejected', labelColor: 'text-red-500' };
  if (s === 'under_review' || s === 'under review')
    return { dot: 'bg-blue-400', label: 'Under Review', labelColor: 'text-blue-500' };
  if (s === 'pending')
    return { dot: 'bg-amber-400', label: 'Pending', labelColor: 'text-amber-500' };
  return { dot: 'bg-gray-400', label: status, labelColor: 'text-gray-500' };
};

const formatCurrency = (val?: number) =>
  val != null ? `₦${val.toLocaleString('en-NG')}` : '—';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

export const MortgageCard = ({
  item,
  onPress,
}: {
  item: MortgageApplication;
  onPress: () => void;
}) => {
  const sc = getStatusConfig(item.status);

  return (
    <View className="bg-white rounded-2xl mx-2 px-5 py-5 shadow-sm shadow-black/10">

      {/* ── Row 1: Category tag + Status ── */}
      <View className="flex-row items-center justify-between mb-4">

        {/* Category pill */}
        <View className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
          <Building2 size={13} color="#64748B" />
          <Text className="text-slate-500 text-xs font-inter">Mortgage</Text>
        </View>

        {/* Status — dot + label only, no pill */}
        <View className="flex-row items-center gap-1.5">
          <View className={`w-2 h-2 rounded-full ${sc.dot}`} />
          <Text className={`text-xs font-inter ${sc.labelColor}`}>{sc.label}</Text>
        </View>

      </View>

      {/* ── Property Title ── */}
      <Text className="text-gray-900 text-lg font-interbold mb-3" numberOfLines={1}>
        {item.property?.title || '—'}
      </Text>

      {/* ── Amount + Date ── */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-800 text-base font-interbold">
          {formatCurrency(item.property?.price)}
        </Text>

        <View className="flex-row items-center gap-1.5">
          <CalendarDays size={14} color="#9CA3AF" />
          <Text className="text-gray-400 text-sm font-inter">
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>

      {/* ── Decision note snippet ── */}
      {!!item.decisionNotes && (
        <Text className="text-gray-500 text-sm font-inter leading-5 mb-4" numberOfLines={2}>
          {item.decisionNotes}{' '}
          <Text className="text-blue-600 font-inter">...more</Text>
        </Text>
      )}

      {/* ── Footer: Location + View Details ── */}
      <View className="flex-row items-center justify-between mt-1">
        <View className="flex-row items-center gap-1.5">
          <MapPin size={14} color="#9CA3AF" />
          <Text className="text-gray-400 text-sm font-inter">
            {item.property?.location || '—'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          className="bg-blue-600 rounded-full px-5 py-2"
        >
          <Text className="text-white text-sm font-inter">View Details</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};