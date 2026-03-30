import AppLayout from '@/components/Layouts/AppLayout';
import { useMeetings } from '@/core/hooks/useMeetings';

import { useLocalSearchParams } from 'expo-router';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  FolderKanban,
  Layers,
  Link2,
  Monitor
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
const formatDate = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTime = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusConfig = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'scheduled')
    return { dot: 'bg-blue-400', label: 'Scheduled', labelColor: 'text-blue-500', tagBg: 'bg-blue-50' };
  if (s === 'completed')
    return { dot: 'bg-green-400', label: 'Completed', labelColor: 'text-green-500', tagBg: 'bg-green-50' };
  if (s === 'cancelled' || s === 'canceled')
    return { dot: 'bg-red-400', label: 'Cancelled', labelColor: 'text-red-500', tagBg: 'bg-red-50' };
  if (s === 'in_progress' || s === 'in progress')
    return { dot: 'bg-amber-400', label: 'In Progress', labelColor: 'text-amber-500', tagBg: 'bg-amber-50' };
  return { dot: 'bg-gray-400', label: status, labelColor: 'text-gray-500', tagBg: 'bg-gray-100' };
};

const getPlatformIcon = (platform?: string) => {

  return Monitor;
};


const MeetingDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { singleMeeting } = useMeetings();

  const { data: apiResponse, isLoading, error } = singleMeeting(id);
  const meeting = apiResponse?.data?.data;

  if (isLoading) {
    return (
      <AppLayout screenName="Meeting Details">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600 font-inter">Loading meeting...</Text>
        </View>
      </AppLayout>
    );
  }

  if (error || !meeting) {
    return (
      <AppLayout screenName="Meeting Details">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center font-inter">
            Failed to load meeting details. Please try again.
          </Text>
        </View>
      </AppLayout>
    );
  }

  const sc = getStatusConfig(meeting.status);
  const PlatformIcon = getPlatformIcon(meeting.platform);

  const isUpcoming = meeting.status?.toLowerCase() === 'scheduled';
  const isCompleted = meeting.status?.toLowerCase() === 'completed';
  const isCancelled = ['cancelled', 'canceled'].includes(meeting.status?.toLowerCase());

  return (
    <AppLayout screenName="Meeting Details">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >

    
        <View className="pt-4 bg-white m-4 rounded-xl">

         
          <View className="flex-row items-center justify-between px-4 mb-3">
            <View className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
              <Monitor size={13} color="#64748B" />
              <Text className="text-slate-500 text-xs font-inter">Meeting</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className={`w-2 h-2 rounded-full ${sc.dot}`} />
              <Text className={`text-xs font-inter ${sc.labelColor}`}>{sc.label}</Text>
            </View>
          </View>

          {/* Meeting Title */}
          <Text className="font-interbold text-xl px-4 pb-1" numberOfLines={2}>
            {meeting.title || '—'}
          </Text>

          {/* Platform */}
          <View className="flex-row items-center gap-1.5 px-4 pb-4">
            <PlatformIcon size={13} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm font-inter capitalize">
              {meeting.platform || '—'}
            </Text>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-100 mx-4" />

          {/* Scheduled At */}
          <View className="px-4 py-4 flex-row justify-between items-center">
            <Text className="font-inter text-gray-500">Scheduled At</Text>
            <View className="flex-row items-center gap-1.5">
              <CalendarDays size={14} color="#9CA3AF" />
              <Text className="font-interbold text-base">{formatDateTime(meeting.scheduledAt)}</Text>
            </View>
          </View>

          <View className="h-px bg-gray-100 mx-4" />

          {/* Duration */}
          <View className="px-4 py-4 flex-row justify-between items-center">
            <Text className="font-inter text-gray-500">Duration</Text>
            <View className="flex-row items-center gap-1.5">
              <Clock size={14} color="#9CA3AF" />
              <Text className="font-interbold text-base">
                {meeting.durationMinutes != null ? `${meeting.durationMinutes} min` : '—'}
              </Text>
            </View>
          </View>

          {/* Description */}
          {!!meeting.description && (
            <>
              <View className="h-px bg-gray-100 mx-4" />
              <View className="px-4 py-4">
                <Text className="font-inter text-gray-500 mb-1">Description</Text>
                <Text className="font-inter text-gray-800 leading-5">{meeting.description}</Text>
              </View>
            </>
          )}
        </View>

        {/* ── Meeting Link Card ── */}
        {!!meeting.meetingLink && (
          <View className="bg-white m-4 rounded-xl">
            <Text className="font-interbold px-4 pt-4 text-xl pb-4">Join Meeting</Text>

            <View className="h-px bg-gray-100 mx-4 mb-3" />

            <View className="px-4 pb-4">
              <TouchableOpacity
                onPress={() => Linking.openURL(meeting.meetingLink)}
                activeOpacity={0.8}
                className="flex-row items-center gap-3 bg-blue-50 rounded-xl p-4"
              >
                <View className="bg-blue-100 rounded-xl p-3">
                  <Link2 size={18} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text className="font-interbold text-blue-700 text-sm" numberOfLines={1}>
                    {meeting.meetingLink}
                  </Text>
                  <Text className="font-inter text-blue-400 text-xs mt-0.5 capitalize">
                    {meeting.platform || 'Virtual Meeting'}
                  </Text>
                </View>
                <View className="bg-blue-100 rounded-lg p-2">
                  <ExternalLink size={14} color="#2563EB" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Organizer Card ── */}
        {!!meeting.organizer && (
          <View className="bg-white m-4 rounded-xl">
            <Text className="font-interbold px-4 pt-4 text-xl pb-2">Organizer</Text>

            <View className="h-px bg-gray-100 mx-4" />

            <View className="px-4 py-4 flex-row justify-between">
              <Text className="font-inter text-gray-500">Name</Text>
              <Text className="font-interbold text-base">{meeting.organizer?.name || '—'}</Text>
            </View>
          </View>
        )}

        {/* ── Project & Milestone Card ── */}
        {(!!meeting.project || !!meeting.milestone) && (
          <View className="bg-white m-4 rounded-xl">
            <Text className="font-interbold px-4 pt-4 text-xl pb-4">Linked To</Text>

            <View className="h-px bg-gray-100 mx-4 mb-3" />

            <View className="px-4 pb-4 gap-3">
              {!!meeting.project && (
                <View className="flex-row items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <View className="bg-purple-50 rounded-xl p-3">
                    <FolderKanban size={18} color="#7C3AED" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-interbold text-gray-800 text-sm" numberOfLines={1}>
                      {meeting.project?.title || '—'}
                    </Text>
                    <Text className="font-inter text-gray-400 text-xs mt-0.5">Project</Text>
                  </View>
                </View>
              )}

              {!!meeting.milestone && (
                <View className="flex-row items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <View className="bg-emerald-50 rounded-xl p-3">
                    <Layers size={18} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-interbold text-gray-800 text-sm" numberOfLines={1}>
                      {meeting.milestone?.title || '—'}
                    </Text>
                    <Text className="font-inter text-gray-400 text-xs mt-0.5">Milestone</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Meeting Timeline Card ── */}
        <View className="bg-white m-4 rounded-xl">
          <Text className="font-interbold px-4 pt-4 text-xl pb-4">Meeting Timeline</Text>

          <View className="h-px bg-gray-100 mx-4 mb-4" />

          <View className="px-4 pb-4">
            {[
              {
                label: 'Meeting Scheduled',
                sub: 'Meeting was created and set',
                date: meeting.scheduledAt,
                done: true,
              },
              {
                label: 'In Progress',
                sub: 'Meeting is currently underway',
                date: ['in_progress', 'completed'].includes(meeting.status?.toLowerCase())
                  ? meeting.scheduledAt
                  : null,
                done: ['in_progress', 'completed'].includes(meeting.status?.toLowerCase()),
              },
              {
                label: 'Completed',
                sub: 'Meeting has concluded',
                date: isCompleted ? meeting.scheduledAt : null,
                done: isCompleted,
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

                {/* Content */}
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

export default MeetingDetailsScreen;