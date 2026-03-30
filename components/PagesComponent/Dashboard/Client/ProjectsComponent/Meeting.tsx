import GradientButton from '@/components/Buttons/GradientButton'
import EmptyScreenComponent from '@/components/Miscallaneous/EmptyScreenComponent'
import { useMeetings } from '@/core/hooks/useMeetings'
import { useRouter } from 'expo-router'
import { CalendarDays, ChevronRight, Clock, Monitor } from 'lucide-react-native'
import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'


type Platform = 'zoom' | 'google_meet' | 'microsoft_teams' | 'physical' | 'phone'

interface MeetingQueryParams {
  page: number
  limit: number
  projectId?: string
  platform?: Platform
}

const PLATFORM_FILTERS: { id: Platform | 'all'; label: string }[] = [
  { id: 'all',             label: 'All'         },
  { id: 'zoom',            label: 'Zoom'        },
  { id: 'google_meet',     label: 'Google Meet' },
  { id: 'microsoft_teams', label: 'MS Teams'    },
  { id: 'physical',        label: 'Physical'    },
  { id: 'phone',           label: 'Phone'       },
]

const getStatusConfig = (status: string) => {
  const s = status?.toLowerCase()
  if (s === 'scheduled')
    return { dot: 'bg-blue-400', label: 'Scheduled', labelColor: 'text-blue-500', tagBg: 'bg-blue-50' }
  if (s === 'completed')
    return { dot: 'bg-green-400', label: 'Completed', labelColor: 'text-green-500', tagBg: 'bg-green-50' }
  if (s === 'cancelled' || s === 'canceled')
    return { dot: 'bg-red-400', label: 'Cancelled', labelColor: 'text-red-500', tagBg: 'bg-red-50' }
  if (s === 'in_progress' || s === 'in progress')
    return { dot: 'bg-amber-400', label: 'In Progress', labelColor: 'text-amber-500', tagBg: 'bg-amber-50' }
  return { dot: 'bg-gray-400', label: status ?? 'Upcoming', labelColor: 'text-gray-500', tagBg: 'bg-gray-100' }
}

const FilterChip = ({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) => (
  <TouchableOpacity
    className={`px-5 py-3.5 rounded-full border min-w-[90px] items-center justify-center ${
      selected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'
    }`}
    onPress={onPress}
  >
    <Text
      className={`text-sm font-inter font-medium text-center ${
        selected ? 'text-white' : 'text-gray-800'
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
)

const MeetingItem = ({
  meeting,
  isNext,
  onPress,
}: {
  meeting: any
  isNext: boolean
  onPress: (id: string) => void
}) => {
  const sc = getStatusConfig(meeting.status)

  const date = meeting.scheduledAt
    ? new Date(meeting.scheduledAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : meeting.scheduledDate
    ? new Date(meeting.scheduledDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : meeting.date ?? '—'

  const time = meeting.scheduledAt
    ? new Date(meeting.scheduledAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : meeting.scheduledTime ?? meeting.time ?? '—'

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(meeting.id)}
      className="bg-white rounded-2xl px-4 py-4 mb-3"
    >
  
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-interbold text-gray-900 text-[15px] flex-1 mr-3" numberOfLines={1}>
          {meeting.title ?? meeting.name ?? 'Meeting'}
        </Text>
        <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${sc.tagBg}`}>
          <View className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          <Text className={`text-xs font-inter ${sc.labelColor}`}>{sc.label}</Text>
        </View>
      </View>

      {/* Meta row: date, time, platform */}
      <View className="flex-row items-center gap-3 mb-3">
        <View className="flex-row items-center gap-1">
          <CalendarDays size={12} color="#9CA3AF" />
          <Text className="text-gray-400 font-inter text-xs">{date}</Text>
        </View>
        <View className="w-1 h-1 rounded-full bg-gray-200" />
        <View className="flex-row items-center gap-1">
          <Clock size={12} color="#9CA3AF" />
          <Text className="text-gray-400 font-inter text-xs">{time}</Text>
        </View>
        {!!meeting.platform && (
          <>
            <View className="w-1 h-1 rounded-full bg-gray-200" />
            <View className="flex-row items-center gap-1">
              <Monitor size={12} color="#9CA3AF" />
              <Text className="text-gray-400 font-inter text-xs capitalize">
                {meeting.platform.replace(/_/g, ' ')}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Footer: next badge + view details CTA */}
      <View className="flex-row items-center justify-between">
        {isNext ? (
          <View className="bg-blue-50 px-3 py-1 rounded-full">
            <Text className="text-blue-600 text-xs font-interbold">Next Up</Text>
          </View>
        ) : (
          <View />
        )}

        <View className="flex-row items-center gap-1">
          <Text className="text-blue-600 font-interbold text-sm">View Details</Text>
          <ChevronRight size={15} color="#2563EB" />
        </View>
      </View>
    </TouchableOpacity>
  )
}


interface UpcomingMeetingsScreenProps {
  projectId?: string
}

const UpcomingMeetingsScreen: React.FC<UpcomingMeetingsScreenProps> = ({
  projectId: initialProjectId,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all')
  const [queryParams, setQueryParams] = useState<MeetingQueryParams>({
    page: 1,
    limit: 100,
    ...(initialProjectId ? { projectId: initialProjectId } : {}),
  })

  const router = useRouter()
  const { getAllMeetings } = useMeetings()
  const { data: apiResponse, isLoading, error } = getAllMeetings(queryParams)

  const onSchedule = () => {
    router.push({
      pathname: '/meeting/schedulemeeting',
      params: { projectId: initialProjectId },
    })
  }

  const onViewDetails = (id: string) => {
    router.push({
      pathname: '/(clients)/meeting/meetingdetails',
      params: { id },
    })
  }

  const meetingsList: any[] = useMemo(
    () =>
      apiResponse?.data?.data?.meetings ??
      apiResponse?.data?.meetings ??
      apiResponse?.meetings ??
      [],
    [apiResponse]
  )

  const handlePlatformFilter = (platform: Platform | 'all') => {
    setSelectedPlatform(platform)
    const newParams: MeetingQueryParams = { ...queryParams, page: 1 }
    if (platform === 'all') delete newParams.platform
    else newParams.platform = platform
    setQueryParams(newParams)
  }

  const selectedLabel =
    PLATFORM_FILTERS.find(f => f.id === selectedPlatform)?.label ?? 'All'

  return (
    <View className="flex-1">

   
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingVertical: 12,
          gap: 10,
          alignItems: 'center',
        }}
        style={{ maxHeight: 65, marginTop: 8 }}
      >
        {PLATFORM_FILTERS.map(f => (
          <FilterChip
            key={f.id}
            label={f.label}
            selected={selectedPlatform === f.id}
            onPress={() => handlePlatformFilter(f.id as Platform | 'all')}
          />
        ))}
      </ScrollView>

      {/* ── Content ── */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center py-40">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600 font-inter">Loading meetings...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4 py-20">
          <Text className="text-red-500 text-center mb-4 font-inter">
            Error loading meetings. Please try again.
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-lg"
            onPress={() => setQueryParams(p => ({ ...p }))}
          >
            <Text className="text-white font-interbold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : meetingsList.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20 px-4">
          <EmptyScreenComponent
            title={
              selectedPlatform !== 'all'
                ? `No ${selectedLabel} Meetings`
                : 'No Meetings Found'
            }
            description={
              selectedPlatform !== 'all'
                ? `You don't have any ${selectedLabel} meetings yet`
                : "You don't have any upcoming meetings yet"
            }
            buttonText="Schedule a Meeting"
            onButtonPress={onSchedule}
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 120,
          }}
        >
          {meetingsList.map((meeting, index) => (
            <MeetingItem
              key={meeting.id}
              meeting={meeting}
              isNext={index === 0}
              onPress={onViewDetails}
            />
          ))}

          {apiResponse?.data?.data?.pagination && (
            <View className="py-4 items-center">
              <Text className="text-gray-500 text-sm mb-3 font-inter">
                Showing {meetingsList.length} of{' '}
                {apiResponse.data.data.pagination.total} meetings
              </Text>
              {apiResponse.data.data.pagination.page <
                apiResponse.data.data.pagination.totalPages && (
                <TouchableOpacity
                  className="bg-blue-600 px-6 py-3 rounded-lg"
                  onPress={() =>
                    setQueryParams(prev => ({
                      ...prev,
                      page: (prev.page || 1) + 1,
                    }))
                  }
                >
                  <Text className="text-white font-interbold">Load More</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      )}

      
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4">
        <GradientButton title="Schedule New Meeting" onPress={onSchedule} />
      </View>
    </View>
  )
}

export default UpcomingMeetingsScreen