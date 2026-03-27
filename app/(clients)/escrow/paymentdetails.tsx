import AppLayout from '@/components/Layouts/AppLayout';
import { useEscrow } from '@/core/hooks/useEscrow';
import { useLocalSearchParams } from 'expo-router';
import {
    Banknote,
    Building2,
    CalendarDays,
    CheckCircle2,
    Circle,
    Clock,
    FileText,
    RotateCcw,
    User,
    XCircle
} from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (val?: number, currency = 'NGN') => {
  if (val == null) return '—';
  const symbol = currency === 'NGN' ? '₦' : currency + ' ';
  return `${symbol}${val.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusConfig = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'paid')
    return {
      dot: 'bg-green-400',
      label: 'Paid',
      labelColor: 'text-green-600',
      tagBg: 'bg-green-50',
    };
  if (s === 'failed')
    return {
      dot: 'bg-red-400',
      label: 'Failed',
      labelColor: 'text-red-500',
      tagBg: 'bg-red-50',
    };
  if (s === 'cancelled')
    return {
      dot: 'bg-red-300',
      label: 'Cancelled',
      labelColor: 'text-red-400',
      tagBg: 'bg-red-50',
    };
  if (s === 'processing')
    return {
      dot: 'bg-blue-400',
      label: 'Processing',
      labelColor: 'text-blue-500',
      tagBg: 'bg-blue-50',
    };
  if (s === 'reversed')
    return {
      dot: 'bg-amber-400',
      label: 'Reversed',
      labelColor: 'text-amber-500',
      tagBg: 'bg-amber-50',
    };
  if (s === 'instruction_sent')
    return {
      dot: 'bg-violet-400',
      label: 'Instruction Sent',
      labelColor: 'text-violet-500',
      tagBg: 'bg-violet-50',
    };
  return {
    dot: 'bg-gray-400',
    label: status,
    labelColor: 'text-gray-500',
    tagBg: 'bg-gray-100',
  };
};

// ── Timeline helpers ──────────────────────────────────────────────────────────
const getTimelineSteps = (instruction: any) => {
  const status = instruction?.status?.toLowerCase();

  const isDoneFrom = (statuses: string[]) =>
    statuses.some((s) => s === status);

  return [
    {
      label: 'Instruction Sent',
      sub: 'Payment instruction was created and dispatched',
      date: instruction?.instructionSentAt ?? instruction?.createdAt,
      done: true,
    },
    {
      label: 'Processing',
      sub: 'Funds are being processed by the payment system',
      date: isDoneFrom(['processing', 'paid', 'reversed', 'failed', 'cancelled'])
        ? instruction?.statusUpdatedAt
        : null,
      done: isDoneFrom(['processing', 'paid', 'reversed', 'failed', 'cancelled']),
    },
    {
      label: status === 'failed' ? 'Payment Failed' : status === 'cancelled' ? 'Cancelled' : status === 'reversed' ? 'Reversed' : 'Payment Confirmed',
      sub:
        status === 'failed'
          ? 'Transaction could not be completed'
          : status === 'cancelled'
          ? 'Instruction was cancelled'
          : status === 'reversed'
          ? 'Payment was reversed'
          : 'Funds successfully transferred',
      date: instruction?.paidAt ?? instruction?.cancelledAt ?? null,
      done: isDoneFrom(['paid', 'failed', 'cancelled', 'reversed']),
      isFinal: true,
      isError: isDoneFrom(['failed', 'cancelled', 'reversed']),
    },
  ];
};

// ── Row Helper ────────────────────────────────────────────────────────────────
const DetailRow = ({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value?: string | null;
  isLast?: boolean;
}) => (
  <>
    <View className="px-4 py-4 flex-row justify-between items-center">
      <Text className="font-inter text-gray-500">{label}</Text>
      <Text className="font-interbold text-base text-right flex-1 ml-4" numberOfLines={2}>
        {value || '—'}
      </Text>
    </View>
    {!isLast && <View className="h-px bg-gray-100 mx-4" />}
  </>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const PaymentInstructionDetailsScreen = () => {
  const { instructionId } = useLocalSearchParams<{ instructionId: string }>();
  const { getSinglePaymentInstruction } = useEscrow();

  const { data: apiResponse, isLoading, error } = getSinglePaymentInstruction(instructionId);
  const instruction = apiResponse?.data?.data;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppLayout screenName="Payment Details">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600 font-inter">Loading payment details...</Text>
        </View>
      </AppLayout>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !instruction) {
    return (
      <AppLayout screenName="Payment Details">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center font-inter">
            Failed to load payment details. Please try again.
          </Text>
        </View>
      </AppLayout>
    );
  }

  const sc = getStatusConfig(instruction.status);
  const timelineSteps = getTimelineSteps(instruction);
  const isFailed = instruction.status === 'failed';

  return (
    <AppLayout screenName="Payment Details">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >

        {/* ── Payment Overview Card ── */}
        <View className="pt-4 bg-white m-4 rounded-xl">

          {/* Tag + Status */}
          <View className="flex-row items-center justify-between px-4 mb-3">
            <View className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
              <Banknote size={13} color="#64748B" />
              <Text className="text-slate-500 text-xs font-inter">Payment Instruction</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className={`w-2 h-2 rounded-full ${sc.dot}`} />
              <Text className={`text-xs font-inter ${sc.labelColor}`}>{sc.label}</Text>
            </View>
          </View>

          {/* Project Title */}
          <Text className="font-interbold text-xl px-4 pb-1" numberOfLines={1}>
            {instruction.project?.title || '—'}
          </Text>

          {/* Milestone */}
          <View className="flex-row items-center gap-1.5 px-4 pb-4">
            <FileText size={13} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm font-inter">
              {instruction.milestone?.name || 'No milestone'}
            </Text>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-100 mx-4" />

          {/* Amount */}
          <View className="px-4 py-4 flex-row justify-between items-center">
            <Text className="font-inter text-gray-500">Amount</Text>
            <Text className="font-interbold text-lg">
              {formatCurrency(instruction.amount, instruction.currency)}
            </Text>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          {/* Date Sent */}
          <View className="px-4 py-4 flex-row justify-between items-center">
            <Text className="font-inter text-gray-500">Date Sent</Text>
            <View className="flex-row items-center gap-1.5">
              <CalendarDays size={14} color="#9CA3AF" />
              <Text className="font-interbold text-base">
                {formatDate(instruction.instructionSentAt ?? instruction.createdAt)}
              </Text>
            </View>
          </View>

          {/* Note */}
          {!!instruction.note && (
            <>
              <View className="h-px bg-gray-100 mx-4" />
              <View className="px-4 py-4">
                <Text className="font-inter text-gray-500 mb-1">Note</Text>
                <Text className="font-inter text-gray-800 leading-5">{instruction.note}</Text>
              </View>
            </>
          )}

          {/* Status Update Note */}
          {!!instruction.statusUpdateNote && (
            <>
              <View className="h-px bg-gray-100 mx-4" />
              <View className="px-4 py-4">
                <Text className="font-inter text-gray-500 mb-1">Status Note</Text>
                <Text className="font-inter text-gray-800 leading-5">
                  {instruction.statusUpdateNote}
                </Text>
              </View>
            </>
          )}

          {/* Failed CTA */}
          {isFailed && (
            <>
              <View className="h-px bg-gray-100 mx-4" />
              <View className="px-4 py-4">
                <TouchableOpacity className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex-row items-center justify-center gap-2">
                  <RotateCcw size={15} color="#EF4444" />
                  <Text className="font-interbold text-red-500 text-sm">Retry Payment</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* ── Project & Milestone Card ── */}
        <View className="bg-white m-4 rounded-xl">
          <Text className="font-interbold px-4 pt-4 text-xl pb-2">Project Details</Text>

          <View className="h-px bg-gray-100 mx-4" />

          <DetailRow label="Project" value={instruction.project?.title} />
          <DetailRow label="Milestone" value={instruction.milestone?.name} />
          <DetailRow
            label="Completion Date"
            value={formatDate(instruction.milestone?.completionDate)}
            isLast
          />
        </View>

        {/* ── Parties Card ── */}
        <View className="bg-white m-4 rounded-xl">
          <Text className="font-interbold px-4 pt-4 text-xl pb-2">Parties Involved</Text>

          <View className="h-px bg-gray-100 mx-4" />

          {/* Client */}
          <View className="px-4 py-4 flex-row items-center gap-3">
            <View className="bg-blue-50 rounded-xl p-3">
              <User size={18} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="font-inter text-gray-400 text-xs mb-0.5">Client</Text>
              <Text className="font-interbold text-gray-900 text-sm">
                {instruction.client?.name || '—'}
              </Text>
              <Text className="font-inter text-gray-400 text-xs mt-0.5">
                {instruction.client?.email || ''}
              </Text>
            </View>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          {/* Builder */}
          <View className="px-4 py-4 flex-row items-center gap-3">
            <View className="bg-emerald-50 rounded-xl p-3">
              <Building2 size={18} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="font-inter text-gray-400 text-xs mb-0.5">Builder</Text>
              <Text className="font-interbold text-gray-900 text-sm">
                {instruction.builder?.name || '—'}
              </Text>
              <Text className="font-inter text-gray-400 text-xs mt-0.5">
                {instruction.builder?.email || ''}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Timestamps Card ── */}
        <View className="bg-white m-4 rounded-xl">
          <Text className="font-interbold px-4 pt-4 text-xl pb-2">Timestamps</Text>

          <View className="h-px bg-gray-100 mx-4" />

          {[
            { label: 'Instruction Sent', value: formatDateTime(instruction.instructionSentAt) },
            { label: 'Status Updated', value: formatDateTime(instruction.statusUpdatedAt) },
            { label: 'Paid At', value: formatDateTime(instruction.paidAt) },
            { label: 'Cancelled At', value: formatDateTime(instruction.cancelledAt) },
            { label: 'Created At', value: formatDateTime(instruction.createdAt) },
            { label: 'Updated At', value: formatDateTime(instruction.updatedAt) },
          ]
            .filter((r) => r.value !== '—')
            .map((row, i, arr) => (
              <React.Fragment key={row.label}>
                <View className="px-4 py-3.5 flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <Clock size={13} color="#9CA3AF" />
                    <Text className="font-inter text-gray-500 text-sm">{row.label}</Text>
                  </View>
                  <Text className="font-interbold text-sm text-gray-800">{row.value}</Text>
                </View>
                {i < arr.length - 1 && <View className="h-px bg-gray-100 mx-4" />}
              </React.Fragment>
            ))}
        </View>

        {/* ── Timeline Card ── */}
        <View className="bg-white m-4 rounded-xl">
          <Text className="font-interbold px-4 pt-4 text-xl pb-4">Payment Timeline</Text>

          <View className="h-px bg-gray-100 mx-4 mb-4" />

          <View className="px-4 pb-4">
            {timelineSteps.map((step, index, arr) => {
              const isLast = index === arr.length - 1;
              const dotBg = !step.done
                ? 'bg-gray-200'
                : (step as any).isError
                ? 'bg-red-100'
                : 'bg-blue-600';

              const lineColor =
                step.done && !(step as any).isError ? 'bg-blue-200' : 'bg-gray-100';

              const DotIcon = !step.done
                ? Circle
                : (step as any).isError
                ? XCircle
                : CheckCircle2;

              const dotIconColor = !step.done
                ? '#CBD5E1'
                : (step as any).isError
                ? '#EF4444'
                : '#fff';

              return (
                <View key={step.label} className="flex-row gap-4">
                  {/* Dot + Line */}
                  <View className="items-center w-6">
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center ${dotBg}`}
                    >
                      <DotIcon
                        size={(step as any).isError ? 16 : step.done ? 14 : 10}
                        color={dotIconColor}
                      />
                    </View>
                    {!isLast && (
                      <View className={`w-0.5 flex-1 mt-1 min-h-8 ${lineColor}`} />
                    )}
                  </View>

                  {/* Content */}
                  <View className={`flex-1 ${!isLast ? 'pb-6' : 'pb-0'}`}>
                    <Text
                      className={`font-interbold text-sm ${
                        step.done
                          ? (step as any).isError
                            ? 'text-red-500'
                            : 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </Text>
                    <Text className="font-inter text-gray-400 text-xs mt-0.5">{step.sub}</Text>
                    <View
                      className={`mt-2 self-start rounded-lg px-2 py-1 ${
                        step.done
                          ? (step as any).isError
                            ? 'bg-red-50'
                            : 'bg-blue-50'
                          : 'bg-gray-50'
                      }`}
                    >
                      <Text
                        className={`font-inter text-xs ${
                          step.done
                            ? (step as any).isError
                              ? 'text-red-400'
                              : 'text-blue-600'
                            : 'text-gray-300'
                        }`}
                      >
                        {step.date ? formatDate(step.date) : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </AppLayout>
  );
};

export default PaymentInstructionDetailsScreen;