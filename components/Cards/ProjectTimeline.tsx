import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ListRenderItemInfo,
  TouchableOpacity,
} from "react-native";
import { Check, ChevronDown } from "lucide-react-native";

interface MilestoneItem {
  id: string;
  name: string;
  description?: string;
  completionDate: string;
  status: "pending" | "in_progress" | "completed";
  orderIndex: number;
  amount: number;
}

interface ProjectTimelineProps {
  milestones?: MilestoneItem[];
}

const StatusIcon: React.FC<{ status: MilestoneItem["status"] }> = ({ status }) => {
  switch (status) {
    case "completed":
      return (
        <View className="w-10 h-10 rounded-full bg-green-600 items-center justify-center">
          <Check width={20} height={20} color="#fff" strokeWidth={3} />
        </View>
      );

    case "in_progress":
      return <View className="w-10 h-10 rounded-full border-[4px] border-blue-600 bg-white" />;

    default: // pending
      return <View className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white" />;
  }
};

const getLineColor = (currentStatus: string, nextStatus?: string): string => {
  if (currentStatus === "completed" && (nextStatus === "completed" || nextStatus === "in_progress"))
    return "bg-green-600";
  if (currentStatus === "completed") return "bg-green-600";
  if (currentStatus === "in_progress") return "bg-blue-600";
  return "bg-gray-300";
};

const formatDate = (dateString: string) => {
  if (!dateString) return "Not set";
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'completed': 'Completed',
    'in_progress': 'In Progress',
    'pending': 'Pending'
  };
  return statusMap[status] || status;
};

interface RowProps {
  item: MilestoneItem;
  index: number;
  nextItem?: MilestoneItem;
}

const Row: React.FC<RowProps> = ({ item, index, nextItem }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="relative">
      <View className="flex-row items-start gap-4">
        <View className="w-10 items-center relative">
          <StatusIcon status={item.status} />
          {nextItem && (
            <View className={`w-0.5 h-16 mt-1 ${getLineColor(item.status, nextItem.status)}`} />
          )}
        </View>

        <View className="flex-1 pt-1">
          <TouchableOpacity 
            className="flex-row items-center gap-2" 
            onPress={() => setIsOpen(!isOpen)}
            activeOpacity={0.7}
          >
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
              <View className="flex-row items-center gap-2 mt-1">
                <Text className="text-sm text-gray-500">Due: {formatDate(item.completionDate)}</Text>
                <View className={`px-2 py-1 rounded-full ${
                  item.status === 'completed' ? 'bg-green-100' :
                  item.status === 'in_progress' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  <Text className={`text-xs font-medium ${
                    item.status === 'completed' ? 'text-green-800' :
                    item.status === 'in_progress' ? 'text-blue-800' :
                    'text-gray-800'
                  }`}>
                    {getStatusLabel(item.status)}
                  </Text>
                </View>
              </View>
            </View>
            <ChevronDown 
              width={18} 
              height={18} 
              color="#6b7280"
              style={{ transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}
            />
          </TouchableOpacity>
          
          {isOpen && (
            <View className="mt-3 p-3 bg-gray-50 rounded-lg">
              {item.description && (
                <Text className="text-gray-600 mb-2">{item.description}</Text>
              )}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-500">Milestone {item.orderIndex}</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  ${item.amount.toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ milestones = [] }) => {
  // Sort milestones by orderIndex
  const sortedMilestones = [...milestones].sort((a, b) => a.orderIndex - b.orderIndex);

  // If no milestones, show empty state
  if (sortedMilestones.length === 0) {
    return (
      <View className="bg-gray-100 p-4">
        <View className="bg-white rounded-2xl p-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Project Milestones</Text>
          <Text className="text-gray-500 text-center py-4">
            No milestones have been added to this project yet.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-gray-100 p-4">
      <View className="bg-white rounded-2xl p-6">
        <Text className="text-xl font-bold text-gray-900 mb-6">Project Milestones</Text>

        <FlatList
          data={sortedMilestones}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item, index }: ListRenderItemInfo<MilestoneItem>) => (
            <Row
              item={item}
              index={index}
              nextItem={sortedMilestones[index + 1]}
            />
          )}
        />
        
        {/* Progress Summary */}
        {milestones.length > 0 && (
          <View className="mt-6 pt-4 border-t border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Total Milestones</Text>
              <Text className="font-semibold">{milestones.length}</Text>
            </View>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-gray-600">Completed</Text>
              <Text className="font-semibold">
                {milestones.filter(m => m.status === 'completed').length}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProjectTimeline;