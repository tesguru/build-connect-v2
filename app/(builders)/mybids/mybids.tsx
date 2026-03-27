import { BidsCard } from '@/components/Cards/BidsCard'
import EmptyScreenComponent from '@/components/Miscallaneous/EmptyScreenComponent'
import { useBids } from '@/core/hooks/UseBids'
import { Project, ProjectQueryParams } from '@/core/types/api'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const MyBids = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [queryParams, setQueryParams] = useState<ProjectQueryParams>({
    page: 1,
    limit: 100,
    includeProgress: true
  });

  const { getAllBids } = useBids();
  const router = useRouter();

  const {
    data: apiResponse,
    isLoading: isLoadingProjects,
    error: projectsError
  } = getAllBids(queryParams);


  const bidsList: Project[] = apiResponse?.data?.data?.bids ?? [];

 
  const statusFilters = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      revision_requested: 0,
      under_review: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
    };

    for (const p of bidsList) {
      if (p.status && counts[p.status] !== undefined) {
        counts[p.status]++;
      }
    }

    return [
      { id: 'all', label: 'All Bids', count: bidsList.length },
      { id: 'pending', label: 'Pending', count: counts.pending },
      { id: 'under_review', label: 'Under Review', count: counts.under_review },
      { id: 'revision_requested', label: 'Revision', count: counts.revision_requested },
      { id: 'shortlisted', label: 'Shortlisted', count: counts.shortlisted },
      { id: 'accepted', label: 'Accepted', count: counts.accepted },
      { id: 'rejected', label: 'Rejected', count: counts.rejected },
      { id: 'withdrawn', label: 'Withdrawn', count: counts.withdrawn },
    ];
  }, [bidsList]);

  const handleStatusFilter = (status: string) => {
    setSelectedFilter(status);

    const newParams: ProjectQueryParams = {
      ...queryParams,
      page: 1,
    };

    if (status === 'all') {
      delete newParams.status;
    } else {
      newParams.status = status;
    }

    setQueryParams(newParams);
  };


  const filteredProjects = useMemo(() => {
    if (selectedFilter === 'all') {
      return bidsList;
    }
    return bidsList.filter(bid => bid.status === selectedFilter);
  }, [bidsList, selectedFilter]);

  const formatStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'revision_requested': 'Revision Requested',
      'under_review': 'Under Review',
      'shortlisted': 'Shortlisted',
      'accepted': 'Accepted',
      'rejected': 'Rejected',
      'withdrawn': 'Withdrawn',
      'all': 'All'
    };

    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const handleProjectPress = (projectId: string) => {
    router.push({
      pathname: '/projects/clientprojectdetails',
      params: { projectId }
    });
  };

  return (
  
      <View className="flex-1">
        <View className="mt-8 flex-1">

        
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

     
          {isLoadingProjects ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
              <Text className="mt-4 text-gray-600">Loading bids...</Text>
            </View>
          ) : projectsError ? (
            <View className="flex-1 justify-center items-center p-4">
              <Text className="text-red-500 text-center mb-4">
                Error loading bids. Please try again.
              </Text>
              <TouchableOpacity
                className="bg-blue-600 px-6 py-3 rounded-lg"
                onPress={() => setQueryParams(prev => ({ ...prev }))}
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredProjects.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20 px-4">
              <EmptyScreenComponent
                message={selectedFilter !== 'all'
                  ? `No "${formatStatusLabel(selectedFilter)}" Bids`
                  : "No Bids Found"}
              />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="mt-4"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {filteredProjects.map((project) => (
                <View key={project.id} className=" px-4 py-3">
                
                 <BidsCard   projectName={project?.project?.title} projectId={project?.project?.id} amount={project.bidAmount} bidStatus={project.status} contractId={project.contractId} bidId={project.id}  />
                </View>
              ))}

              {apiResponse?.data?.data?.pagination && (
                <View className="py-6 items-center">
                  <Text className="text-gray-500 text-sm mb-2">
                    Showing {filteredProjects.length} of {apiResponse.data.data.pagination.total} bids
                  </Text>
                  {apiResponse.data.data.pagination.page < apiResponse.data.data.pagination.totalPages && (
                    <TouchableOpacity
                      className="bg-blue-600 px-6 py-3 rounded-lg"
                      onPress={() => {
                        setQueryParams(prev => ({
                          ...prev,
                          page: (prev.page || 1) + 1,
                        }));
                      }}
                    >
                      <Text className="text-white font-medium">Load More Bids</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
  
  );
};

export default MyBids;