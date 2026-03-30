import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface MilestoneProps {
  milestoneName: string;
  dueDate: string;
  budget: string;
  progress: number;
  onPress?: () => void;
  status?: string;
}

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'in_progress':
    case 'in progress':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'overdue':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'cancelled':
      return { bg: 'bg-gray-100', text: 'text-gray-500' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600' };
  }
};

const Milestone: React.FC<MilestoneProps> = ({
  milestoneName,
  dueDate,
  budget,
  progress,
  onPress,
  status = 'Pending',
}) => {
  const statusStyle = getStatusStyle(status);

  return (
    <TouchableOpacity
      className="mx-1 my-1 p-4 bg-white rounded-xl"
      onPress={onPress}
    >
      {/* Header with title and status */}
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-xl font-worksanssemibold text-gray-900 flex-1 mr-2">
          {milestoneName}
        </Text>
        <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
          <Text className={`text-xs font-medium ${statusStyle.text}`}>
            {status}
          </Text>
        </View>
      </View>

      {/* Due date */}
      <Text className="text-gray-500 font-inter mb-3">Due: {dueDate}</Text>

      {/* Payment amount */}
      <View className="flex-row items-baseline mb-4">
        <Text className="text-gray-600 font-inter mr-2">Payment:</Text>
        <Text className="text-lg font-worksanssemibold text-gray-900">
          {budget}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Milestone;