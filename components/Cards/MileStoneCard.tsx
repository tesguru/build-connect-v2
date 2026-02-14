import React from 'react';
import { View, Text, TouchableOpacity, ImageSourcePropType } from 'react-native';
import StatusBar from '../Miscallaneous/StatusBar';
import ProgressBar from '../Miscallaneous/ProgressBar';

interface MilestoneProps {
  milestoneName: string;
  dueDate: string;
  budget: string;
  progress: number;
  onPress?: () => void;
  status?: string;
}

const Milestone: React.FC<MilestoneProps> = ({
  milestoneName,
  dueDate,
  budget,
  progress,
  onPress,
  status = "Pending"
}) => {
  return (
    <TouchableOpacity 
      className="m-4 p-4 bg-white rounded-xl shadow-sm" 
      onPress={onPress}
    >
      {/* Header with title and status */}
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-xl font-worksanssemibold text-gray-900">
          {milestoneName}
        </Text>
        <StatusBar title={status} />
      </View>

      {/* Due date */}
      <Text className="text-gray-500 font-inter mb-3">
        Due: {dueDate}
      </Text>

      {/* Payment amount */}
      <View className="flex-row items-baseline mb-4">
        <Text className="text-gray-600 font-inter mr-2">Payment:</Text>
        <Text className="text-lg font-worksanssemibold text-gray-900">
          {budget}
        </Text>
      </View>

      <ProgressBar progress={progress} />
    </TouchableOpacity>
  );
};

export default Milestone;