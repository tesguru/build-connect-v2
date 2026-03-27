import MilestoneCard from '@/components/Cards/MileStoneCard';
import { useProjects } from '@/core/hooks/useProjects';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface MilestoneQueryParams {
  page: number;
  limit: number;
  projectId: string;
  includeProgress: boolean;
  status?: string;
  statusId?: string;
}

const Milestone = ({ projectId }: { projectId: string }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [queryParams, setQueryParams] = useState<MilestoneQueryParams>({
    page: 1,
    limit: 100,
    projectId,
    includeProgress: true,
  });

  const { getProjectMilestonesQuery } = useProjects();

  const {
    data: apiResponse,
    isLoading,
    error,
  } = getProjectMilestonesQuery(projectId, queryParams);



  const milestonesList =
  apiResponse?.data?.data?.milestones ||
  [];

  const statusFilters = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      in_progress: 0,
      completed: 0,
    };
    for (const m of milestonesList) {
      if (m.status && counts[m.status] !== undefined) {
        counts[m.status]++;
      }
    }
    return [
      { id: 'all', label: 'All', count: milestonesList.length },
      { id: 'pending', label: 'Pending', count: counts.pending },
      { id: 'in_progress', label: 'In Progress', count: counts.in_progress },
      { id: 'completed', label: 'Completed', count: counts.completed },
    ];
  }, [milestonesList]);

  const handleStatusFilter = (status: string) => {
    setSelectedFilter(status);
    const newParams: MilestoneQueryParams = { ...queryParams, page: 1 };
    if (status === 'all') {
      delete newParams.status;
      delete newParams.statusId;
    } else {
      newParams.status = status;
    }
    setQueryParams(newParams);
  };

  const filteredMilestones = selectedFilter === 'all'
    ? milestonesList
    : milestonesList.filter((m) => m.status === selectedFilter);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProgress = (status: string) => {
    if (status === 'completed') return 100;
    if (status === 'in_progress') return 50;
    return 0;
  };

  const router = useRouter();

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      completed: 'Completed',
      in_progress: 'In Progress',
      pending: 'Pending',
    };
    return map[status] || status;
  };
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

  if (isLoading) {
  return (
    <View className="flex-1 justify-center items-center py-20">
      <ActivityIndicator size="large" color="#2463EB" />
      <Text className="mt-4 text-gray-600">Loading milestones...</Text>
    </View>
  )
}

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center mb-4">
          Error loading milestones. Please try again.
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-lg"
          onPress={() => setQueryParams({ ...queryParams })}
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 mt-5">
      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 1, gap: 10, alignItems: 'center' }}
        style={{ maxHeight: 60 }}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            className={`px-5 py-3.5 rounded-full border min-w-[90px] items-center justify-center ${
              selectedFilter === filter.id
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-200'
            }`}
            onPress={() => handleStatusFilter(filter.id)}
          >
            <Text
              className={`text-md font-inter font-medium text-center ${
                selectedFilter === filter.id ? 'text-white' : 'text-gray-800'
              }`}
            >
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {filteredMilestones.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20 px-4">
          <Text className="text-gray-500 text-center">
            {selectedFilter !== 'all'
              ? `No "${getStatusLabel(selectedFilter)}" milestones found.`
              : 'No milestones found for this project.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {filteredMilestones.map((milestone) => (
            <View key={milestone.id} className="mb-4 px-4">
              <MilestoneCard
                milestoneName={milestone.name}
                dueDate={formatDate(milestone.completionDate)}
                budget={`₦${milestone.amount?.toLocaleString() || '0'}`}
                progress={getProgress(milestone.status)}
                status={getStatusLabel(milestone.statusDetails.value)}
                onPress={() =>
                  router.push({
                    pathname: '/milestone/milestonedetails',
                    params: { milestoneId: milestone.id, projectId, milestoneName:milestone.name}
                  })
                  }
              />
            </View>
          ))}

          {apiResponse?.data?.data?.pagination && (
            <View className="py-6 items-center">
              <Text className="text-gray-500 text-sm mb-2">
                Showing {filteredMilestones.length} of {apiResponse.data.data.pagination.total} milestones
              </Text>
              {apiResponse.data.data.pagination.page < apiResponse.data.data.pagination.totalPages && (
                <TouchableOpacity
                  className="bg-blue-600 px-6 py-3 rounded-lg"
                  onPress={() =>
                    setQueryParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                  }
                >
                  <Text className="text-white font-medium">Load More</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default Milestone;