// Reconstructed from Hermes bytecode (module 3825) — hand-verified. Internally
// named "ProjectTimeline" but imported as MilestonesSummary. A vertical
// timeline: each row has a status icon (gray ring/pending, thick blue
// ring/in_progress, filled green check/completed) connected by a colored
// line to the next row, a name + due date + status pill, and an expandable
// chevron revealing description + "Milestone N" + formatted amount. Footer
// shows Total Milestones / Completed counts.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <View className="w-10 h-10 rounded-full bg-green-600 items-center justify-center">
        <Check width={20} height={20} color="#fff" strokeWidth={3} />
      </View>
    );
  }
  if (status === 'in_progress') {
    return <View className="w-10 h-10 rounded-full border-[4px] border-blue-600 bg-white" />;
  }
  return <View className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white" />;
}

function getLineColor(status: string, nextStatus: string) {
  if (status === 'completed') {
    if (nextStatus === 'completed' || nextStatus === 'in_progress') return 'bg-green-600';
    return 'bg-green-600';
  }
  if (status === 'in_progress') return 'bg-blue-600';
  return 'bg-gray-300';
}

function formatDate(date: string | null) {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = { completed: 'Completed', in_progress: 'In Progress', pending: 'Pending' };
  return labels[status] || status;
}

type Milestone = {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  completionDate: string | null;
  amount: number;
  description?: string;
  orderIndex: number;
};

function Row({ item, nextItem }: { item: Milestone; nextItem: Milestone | null }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusBg =
    item.status === 'completed' ? 'bg-green-100' : item.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100';
  const statusText =
    item.status === 'completed' ? 'text-green-800' : item.status === 'in_progress' ? 'text-blue-800' : 'text-gray-800';

  return (
    <View className="flex-row gap-3">
      <View className="w-10 items-center relative">
        <StatusIcon status={item.status} />
        {nextItem && <View className={`w-0.5 h-16 mt-1 ${getLineColor(item.status, nextItem.status)}`} />}
      </View>

      <View className="flex-1 pb-6">
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} activeOpacity={0.7}>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
              <View className="flex-row items-center gap-2 mt-1">
                <Text className="text-sm text-gray-500">Due: {formatDate(item.completionDate)}</Text>
                <View className={`px-2 py-1 rounded-full ${statusBg}`}>
                  <Text className={`text-xs font-medium ${statusText}`}>{getStatusLabel(item.status)}</Text>
                </View>
              </View>
            </View>
            <ChevronDown
              size={20}
              color="#6b7280"
              style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View className="mt-3 p-3 bg-gray-50 rounded-lg">
            {item.description && <Text className="text-gray-600 mb-2">{item.description}</Text>}
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-500">Milestone {item.orderIndex}</Text>
              <Text className="text-sm font-semibold text-gray-900">₦{item.amount.toLocaleString()}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

export default function MilestonesSummary({ milestones }: { milestones: Milestone[] }) {
  const sorted = [...(milestones || [])].sort((a, b) => a.orderIndex - b.orderIndex);

  if (sorted.length === 0) {
    return (
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-900 mb-4">Project Milestones</Text>
        <Text className="text-gray-500 text-center py-4">
          No milestones have been added to this project yet.
        </Text>
      </View>
    );
  }

  const completedCount = sorted.filter((m) => m.status === 'completed').length;

  return (
    <View className="p-4">
      <Text className="text-xl font-bold text-gray-900 mb-6">Project Milestones</Text>

      {sorted.map((item, index) => (
        <Row key={item.id} item={item} nextItem={sorted[index + 1] || null} />
      ))}

      <View className="flex-row justify-between mt-2 pt-4 border-t border-gray-100">
        <View>
          <Text className="text-gray-600">Total Milestones</Text>
          <Text className="text-lg font-bold text-gray-900">{sorted.length}</Text>
        </View>
        <View>
          <Text className="text-gray-600">Completed</Text>
          <Text className="text-lg font-bold text-gray-900">{completedCount}</Text>
        </View>
      </View>
    </View>
  );
}
