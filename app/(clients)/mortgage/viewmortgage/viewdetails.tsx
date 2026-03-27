import AppLayout from '@/components/Layouts/AppLayout';
import { useProperty } from '@/core/hooks/useProperty';
import { useLocalSearchParams } from 'expo-router';
import {
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  MapPin
} from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (val?: number) =>
  val != null ? `₦${val.toLocaleString('en-NG')}` : '—';

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

const getStatusConfig = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'approved')
    return { dot: 'bg-green-400', label: 'Approved', labelColor: 'text-green-500', tagBg: 'bg-green-50' };
  if (s === 'rejected' || s === 'declined')
    return { dot: 'bg-red-400', label: 'Rejected', labelColor: 'text-red-500', tagBg: 'bg-red-50' };
  if (s === 'under_review' || s === 'under review')
    return { dot: 'bg-blue-400', label: 'Under Review', labelColor: 'text-blue-500', tagBg: 'bg-blue-50' };
  if (s === 'pending')
    return { dot: 'bg-amber-400', label: 'Pending', labelColor: 'text-amber-500', tagBg: 'bg-amber-50' };
  return { dot: 'bg-gray-400', label: status, labelColor: 'text-gray-500', tagBg: 'bg-gray-100' };
};

const getDocTypeIcon = (type: string) => {
  const t = type?.toLowerCase();
  if (t?.includes('id') || t?.includes('identity')) return FileText;
  if (t?.includes('income') || t?.includes('payslip')) return Banknote;
  if (t?.includes('bank') || t?.includes('statement')) return Building2;
  return FileText;
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const MortgageDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { singleMortgageQuery} = useProperty();

  const { data: apiResponse, isLoading, error } = singleMortgageQuery(id);
  const app = apiResponse?.data?.data;

  if (isLoading) {
    return (
      <AppLayout screenName="Mortgage Details">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600 font-inter">Loading application...</Text>
        </View>
      </AppLayout>
    );
  }

  if (error || !app) {
    return (
      <AppLayout screenName="Mortgage Details">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center font-inter">
            Failed to load application details. Please try again.
          </Text>
        </View>
      </AppLayout>
    );
  }

  const sc = getStatusConfig(app.status);

  return (
    <AppLayout screenName="Mortgage Details">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >

        {/* ── Property Overview Card ── */}
        <View className="pt-4 bg-white m-4 rounded-xl">

          {/* Tag + Status */}
          <View className="flex-row items-center justify-between px-4 mb-3">
            <View className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
              <Building2 size={13} color="#64748B" />
              <Text className="text-slate-500 text-xs font-inter">Property</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className={`w-2 h-2 rounded-full ${sc.dot}`} />
              <Text className={`text-xs font-inter ${sc.labelColor}`}>{sc.label}</Text>
            </View>
          </View>

          {/* Property Title */}
          <Text className="font-interbold text-xl px-4 pb-1" numberOfLines={1}>
            {app.property?.title || '—'}
          </Text>

          {/* Location */}
          <View className="flex-row items-center gap-1.5 px-4 pb-4">
            <MapPin size={13} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm font-inter">
              {app.property?.location || '—'}
            </Text>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-100 mx-4" />

          {/* Property Value + Date */}
          <View className="px-4 py-4 flex-row justify-between items-center">
            <Text className="font-inter text-gray-500">Property Value</Text>
            <Text className="font-interbold text-lg">
              {formatCurrency(app.property?.price)}
            </Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between items-center">
            <Text className="font-inter text-gray-500">Date Applied</Text>
            <View className="flex-row items-center gap-1.5">
              <CalendarDays size={14} color="#9CA3AF" />
              <Text className="font-interbold text-base">{formatDate(app.createdAt)}</Text>
            </View>
          </View>

          {/* Decision Note */}
          {!!app.decisionOutcome && (
            <>
              <View className="h-px bg-gray-100 mx-4" />
              <View className="px-4 py-4">
                <Text className="font-inter text-gray-500 mb-1">Decision Note</Text>
                <Text className="font-inter text-gray-800 leading-5">
                  {app.decisionOutcome}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ── Applicant Info Card ── */}
        <View className="bg-white m-4 rounded-xl">
          <Text className="font-interbold px-4 pt-4 text-xl pb-2">Applicant Information</Text>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between">
            <Text className="font-inter text-gray-500">Full Name</Text>
            <Text className="font-interbold text-base">
              {app.firstName} {app.lastName}
            </Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between">
            <Text className="font-inter text-gray-500">Date of Birth</Text>
            <Text className="font-interbold text-base">{formatDate(app.dateOfBirth)}</Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between">
            <Text className="font-inter text-gray-500">Email</Text>
            <Text className="font-interbold text-base" numberOfLines={1}>{app.emailAddress || '—'}</Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between">
            <Text className="font-inter text-gray-500">Phone</Text>
            <Text className="font-interbold text-base">{app.phoneNumber || '—'}</Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between">
            <Text className="font-inter text-gray-500">Address</Text>
            <Text className="font-interbold text-base flex-1 text-right ml-4" numberOfLines={2}>
              {app.currentAddress || '—'}
            </Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between">
            <Text className="font-inter text-gray-500">City / State</Text>
            <Text className="font-interbold text-base">
              {app.city && app.state ? `${app.city}, ${app.state}` : '—'}
            </Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between">
            <Text className="font-inter text-gray-500">Postal Code</Text>
            <Text className="font-interbold text-base">{app.postalCode || '—'}</Text>
          </View>
        </View>

        {/* ── Employment & Income Card ── */}
        <View className="bg-white m-4 rounded-xl">
          <Text className="font-interbold px-4 pt-4 text-xl pb-2">Employment & Income</Text>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between">
            <Text className="font-inter text-gray-500">Status</Text>
            <Text className="font-interbold text-base">{app.employmentStatus?.label || '—'}</Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between">
            <Text className="font-inter text-gray-500">Occupation</Text>
            <Text className="font-interbold text-base">{app.occupation || '—'}</Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between">
            <Text className="font-inter text-gray-500">Employer</Text>
            <Text className="font-interbold text-base">{app.employerName || '—'}</Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          <View className="px-4 py-4 flex-row justify-between">
            <Text className="font-inter text-gray-500">Annual Income</Text>
            <Text className="font-interbold text-base">{formatCurrency(app.annualGrossIncome)}</Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          {/* Financial Summary grid */}
          <View className="px-4 pt-4 pb-2">
            <Text className="font-inter text-gray-400 text-xs uppercase tracking-wider mb-3">
              Financial Summary
            </Text>
            <View className="flex-row gap-3 mb-3">
              {[
                { label: 'Savings', value: formatCurrency(app.savingsAccountBalance), bg: 'bg-emerald-50', text: 'text-emerald-600' },
                { label: 'Checking', value: formatCurrency(app.checkingAccountBalance), bg: 'bg-blue-50', text: 'text-blue-600' },
                { label: 'Investments', value: formatCurrency(app.investments), bg: 'bg-purple-50', text: 'text-purple-600' },
              ].map((item) => (
                <View key={item.label} className={`flex-1 ${item.bg} rounded-xl p-3 items-center gap-1`}>
                  <Text className={`font-interbold text-xs ${item.text}`} numberOfLines={1}>
                    {item.value}
                  </Text>
                  <Text className="font-inter text-gray-400 text-xs">{item.label}</Text>
                </View>
              ))}
            </View>
            <View className="flex-row gap-3 mb-2">
              {[
                { label: 'Credit Debt', value: formatCurrency(app.creditCardDebits), bg: 'bg-red-50', text: 'text-red-500' },
                { label: 'Other Loans', value: formatCurrency(app.otherLoans), bg: 'bg-amber-50', text: 'text-amber-600' },
              ].map((item) => (
                <View key={item.label} className={`flex-1 ${item.bg} rounded-xl p-3 items-center gap-1`}>
                  <Text className={`font-interbold text-xs ${item.text}`} numberOfLines={1}>
                    {item.value}
                  </Text>
                  <Text className="font-inter text-gray-400 text-xs">{item.label}</Text>
                </View>
              ))}
              <View className="flex-1" />
            </View>
          </View>
        </View>

        {/* ── Documents Card ── */}
        {app.documents?.length > 0 && (
          <View className="bg-white m-4 rounded-xl">
            <Text className="font-interbold px-4 pt-4 text-xl pb-4">Uploaded Documents</Text>

            <View className="h-px bg-gray-100 mx-4 mb-3" />

            <View className="px-4 pb-4 gap-3">
              {app.documents.map((doc: any) => {
                const DocIcon = getDocTypeIcon(doc.type);
                return (
                  <TouchableOpacity
                    key={doc.id}
                    onPress={() => doc.publicUrl && Linking.openURL(doc.publicUrl)}
                    activeOpacity={0.8}
                    className="flex-row items-center gap-3 bg-gray-50 rounded-xl p-3"
                  >
                    <View className="bg-blue-50 rounded-xl p-3">
                      <DocIcon size={18} color="#2563EB" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-interbold text-gray-800 text-sm" numberOfLines={1}>
                        {doc.fileName || doc.type || 'Document'}
                      </Text>
                      <Text className="font-inter text-gray-400 text-xs mt-0.5 capitalize">
                        {doc.type?.replace(/_/g, ' ') || 'Attachment'}
                      </Text>
                    </View>
                    <View className="bg-blue-50 rounded-lg p-2">
                      <ExternalLink size={14} color="#2563EB" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

     
        <View className="bg-white m-4 rounded-xl">
          <Text className="font-interbold px-4 pt-4 text-xl pb-4">Application Timeline</Text>

          <View className="h-px bg-gray-100 mx-4 mb-4" />

          <View className="px-4 pb-4">
            {[
              {
                label: 'Application Submitted',
                sub: 'Your application was received',
                date: app.createdAt,
                done: true,
              },
              {
                label: 'Under Review',
                sub: 'Being reviewed by our team',
                date: ['under_review', 'approved', 'rejected'].includes(app.status?.toLowerCase())
                  ? app.updatedAt
                  : null,
                done: ['under_review', 'approved', 'rejected'].includes(app.status?.toLowerCase()),
              },
              {
                label: 'Decision Made',
                sub: 'Final outcome communicated',
                date: app.decisionAt,
                done: !!app.decisionAt,
              },
            ].map((step, index, arr) => (
              <View key={step.label} className="flex-row gap-4">
                {/* Dot + Line */}
                <View className="items-center w-6">
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      step.done ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle2 size={14} color="#fff" />
                    ) : (
                      <Circle size={10} color="#CBD5E1" />
                    )}
                  </View>
                  {index < arr.length - 1 && (
                    <View
                      className={`w-0.5 flex-1 mt-1 min-h-8 ${
                        step.done ? 'bg-blue-200' : 'bg-gray-100'
                      }`}
                    />
                  )}
                </View>

            
                <View className={`flex-1 ${index < arr.length - 1 ? 'pb-6' : 'pb-0'}`}>
                  <Text
                    className={`font-interbold text-sm ${
                      step.done ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </Text>
                  <Text className="font-inter text-gray-400 text-xs mt-0.5">{step.sub}</Text>
                  <View
                    className={`mt-2 self-start rounded-lg px-2 py-1 ${
                      step.done ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <Text
                      className={`font-inter text-xs ${
                        step.done ? 'text-blue-600' : 'text-gray-300'
                      }`}
                    >
                      {step.date ? formatDate(step.date) : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </AppLayout>
  );
};

export default MortgageDetailsScreen;