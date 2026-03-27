import { DollarCircle, HeartIcon, LocationIcon, MarkCircle } from '@/constants/icon';
import React, { useState } from 'react';
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from 'react-native';
import ProgressBar from '../Miscallaneous/ProgressBar';
import StatusBar from '../Miscallaneous/StatusBar';
import InfoCard from './InfoCard';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  draft:       { label: 'Draft',       bg: '#F3F4F6', text: '#6B7280' },
  posted:      { label: 'Posted',      bg: '#EFF6FF', text: '#2563EB' },
  in_progress: { label: 'In Progress', bg: '#FFFBEB', text: '#D97706' },
  completed:   { label: 'Completed',   bg: '#F0FDF4', text: '#16A34A' },
  cancelled:   { label: 'Cancelled',   bg: '#FEF2F2', text: '#DC2626' },
}

const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) return null
  const cfg = STATUS_CONFIG[status] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    bg: '#F3F4F6',
    text: '#6B7280',
  }
  return (
    <View
      style={{ backgroundColor: cfg.bg }}
      className="px-3 py-1 rounded-full self-start"
    >
      <Text style={{ color: cfg.text }} className="text-xs font-inter font-medium">
        {cfg.label}
      </Text>
    </View>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProjectsComponentProps {
  postedTime: string;
  projectName: string;
  location: string;
  description: string;
  budget: string;
  duration: string;
  bids: string;
  role: string;
  progress: number;
  onPress?: () => void;
  heartIcon?: ImageSourcePropType;
  locationIcon?: ImageSourcePropType;
  clockIcon?: ImageSourcePropType;
  userIcon?: ImageSourcePropType;
  status?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProjectsWithMilestone: React.FC<ProjectsComponentProps> = ({
  projectName,
  location,
  status,
  budget,
  role,
  progress,
  description,
  onPress,
  heartIcon = HeartIcon,
  locationIcon = LocationIcon,
}) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <TouchableOpacity className="mt-2 p-4 bg-white rounded-xl" onPress={onPress}>
      <View>

        {/* Title row + status badge */}
        <View className="flex-row justify-between items-start pb-4">
          <Text className="text-xl font-worksanssemibold flex-1 pr-2">{projectName}</Text>
          <StatusBadge status={status} />
        </View>

        {/* ── Description with expand/collapse ── */}
        <View>
          <Text
            className="font-inter text-gray-600 leading-5"
            numberOfLines={expanded ? undefined : 2}
          >
            {description}
          </Text>
          {!expanded && (description?.length ?? 0) > 100 && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation()
                setExpanded(true)
              }}
            >
              <Text className="text-blue-600 font-inter mt-0.5">...more</Text>
            </TouchableOpacity>
          )}
          {expanded && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation()
                setExpanded(false)
              }}
            >
              <Text className="text-blue-600 font-inter mt-0.5">Show less</Text>
            </TouchableOpacity>
          )}
        </View>

        <ProgressBar progress={progress} />

        <View className="flex-row gap-2 py-3 items-center">
          <Image source={locationIcon} style={{ width: 15, height: 15 }} resizeMode="contain" />
          <Text className="font-inter">{location}</Text>
        </View>

        {role === 'client' ? null : (
          <View>
            <View className="flex-row items-center mt-4 gap-2">
              <View className="flex-1">
                <InfoCard
                  icon={DollarCircle}
                  title={budget}
                  subtitle="Total Budget"
                  subtitleColor="black"
                  touchable={false}
                  titleColor="black"
                />
              </View>
              <View className="flex-1">
                <InfoCard
                  icon={MarkCircle}
                  title="#218,800"
                  subtitle="Earned"
                  subtitleColor="black"
                  touchable={false}
                  titleColor="black"
                />
              </View>
            </View>

            <View className="flex-row justify-between">
              <View>
                <Text className="font-inter">Next Milestone</Text>
                <Text className="font-inter">Electrical</Text>
                <Text className="pt-6 font-inter">Due: 23/04/2025</Text>
              </View>
              <View className="pt-14">
                <StatusBar title="Approved" />
              </View>
            </View>
          </View>
        )}

      </View>
    </TouchableOpacity>
  );
};

export default ProjectsWithMilestone;