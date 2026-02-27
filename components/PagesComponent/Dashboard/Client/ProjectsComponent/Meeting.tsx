import GradientButton from '@/components/Buttons/GradientButton'
import EmptyScreenComponent from '@/components/Miscallaneous/EmptyScreenComponent'
import { useMeetings } from '@/core/hooks/useMeetings'
import { useRouter } from 'expo-router'
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
  onJoin,
}: {
  meeting: any
  isNext: boolean
  onJoin?: (meeting: any) => void
}) => {
  const date = meeting.scheduledDate
    ? new Date(meeting.scheduledDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : meeting.date ?? '—'

  const time = meeting.scheduledTime ?? meeting.time ?? '—'

  return (
    <View
      className="bg-white rounded-2xl px-4 py-4 mb-3 flex-row items-center"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center mr-4">
        <Text className="text-2xl">🗓️</Text>
      </View>

      <View className="flex-1">
        <Text className="font-interbold text-gray-900 text-[15px] mb-0.5">
          {meeting.title ?? meeting.name ?? 'Meeting'}
        </Text>
        <Text className="text-gray-500 font-inter text-[13px]">
          {date} · {time}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onJoin?.(meeting)}
        className={`px-5 py-2.5 rounded-full ${isNext ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <Text
          className={`font-interbold text-[14px] ${
            isNext ? 'text-white' : 'text-gray-600'
          }`}
        >
          Join
        </Text>
      </TouchableOpacity>
    </View>
  )
}


interface UpcomingMeetingsScreenProps {
  projectId?: string
  onJoin?: (meeting: any) => void

}

const UpcomingMeetingsScreen: React.FC<UpcomingMeetingsScreenProps> = ({
  projectId: initialProjectId,
  onJoin,

}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all')
  const [queryParams, setQueryParams] = useState<MeetingQueryParams>({
    page: 1,
    limit: 100,
    ...(initialProjectId ? { projectId: initialProjectId } : {}),
  })

  console.log("projectId","yaya", initialProjectId)
  const router = useRouter()
  const { getAllMeetings } = useMeetings()
  const { data: apiResponse, isLoading, error } = getAllMeetings(queryParams)
 const onSchedule = () => {
  router.push({
      pathname: "/meeting/schedulemeeting",
      params: { projectId: initialProjectId }
    });
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

        {/* ── Platform Filters ── */}
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

        {/* ── Body ── */}
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
                onJoin={onJoin}
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

        {/* ── Schedule CTA ── */}
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4">
          <GradientButton title="Schedule New Meeting" onPress={onSchedule} />
        </View>
      </View>

  )
}

export default UpcomingMeetingsScreen