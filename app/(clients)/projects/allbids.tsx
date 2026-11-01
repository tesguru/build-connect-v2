// app/projects/allbids.tsx
import { ClientBidCard } from "@/components/Cards/ClientBidCard";
import AppLayout from "@/components/Layouts/AppLayout";
import EmptyScreenComponent from "@/components/Miscallaneous/EmptyScreenComponent";
import { useBids } from "@/core/hooks/UseBids";
import { getApiErrorMessage } from "@/core/utils/handleapierror";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

type QueryParams = {
  page: number;
  limit: number;
  projectId: string;
  status?: string;
};

const AllBidsScreen = () => {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    limit: 20,
    projectId: projectId,
  });

  const { getClientsBidsQuery } = useBids();

  const {
    data: bidsData,
    isLoading,
    error,
  } = getClientsBidsQuery(projectId, queryParams);

  const clientBidsList = bidsData?.data?.data?.bids || bidsData?.data?.bids || [];
  const clientProjects = bidsData?.data?.data?.project || bidsData?.data?.project || [];
  const pagination = bidsData?.data?.pagination;

  // Filter configuration for bids
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

    for (const bid of clientBidsList) {
      if (bid.status && counts[bid.status] !== undefined) {
        counts[bid.status]++;
      }
    }

    const allCount = clientBidsList.length;

    return [
      { id: 'all', label: 'All Bids', count: allCount },
      { id: 'pending', label: 'Pending', count: counts.pending },
      { id: 'revision_requested', label: 'Revision Requested', count: counts.revision_requested },
      { id: 'under_review', label: 'Under Review', count: counts.under_review },
      { id: 'shortlisted', label: 'Shortlisted', count: counts.shortlisted },
      { id: 'accepted', label: 'Accepted', count: counts.accepted },
      { id: 'rejected', label: 'Rejected', count: counts.rejected },
      { id: 'withdrawn', label: 'Withdrawn', count: counts.withdrawn },
    ];
  }, [clientBidsList]);

  const handleStatusFilter = (status: string) => {
    setSelectedFilter(status);

    const newParams: QueryParams = {
      page: 1,
      limit: 20,
      projectId: projectId,
    };

    if (status !== 'all') {
      newParams.status = status;
    }

    setQueryParams(newParams);
  };

  const filteredBids = useMemo(() => {
    if (selectedFilter === 'all') return clientBidsList;
    return clientBidsList.filter((bid: any) => bid.status === selectedFilter);
  }, [clientBidsList, selectedFilter]);

  const formatStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'revision_requested': 'Revision Requested',
      'under_review': 'Under Review',
      'shortlisted': 'Shortlisted',
      'accepted': 'Accepted',
      'rejected': 'Rejected',
      'withdrawn': 'Withdrawn',
      'all': 'All Bids'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const handleBackToProject = () => {
    router.back();
  };

  return (
    <AppLayout screenName="All Bids" fullHeightContent showBackButton onBackPress={handleBackToProject}>
      <View className="flex-1">
        <View className="mt-4 flex-1">
         

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingHorizontal: 16, 
              paddingVertical: 1, 
              gap: 10, 
              alignItems: 'center' 
            }}
            style={{ maxHeight: 60, marginBottom: 16 }}
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

          {/* Content States */}
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
              <Text className="mt-4 text-gray-600 font-inter">
                Loading bids...
              </Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center p-4">
              <View className="bg-red-50 rounded-xl p-6 items-center max-w-md">
                <Text className="text-red-500 text-center mb-4 font-inter">
                  {getApiErrorMessage(error, 'Error loading bids. Please try again.')}
                </Text>
                <TouchableOpacity
                  className="bg-blue-600 px-6 py-3 rounded-lg"
                  onPress={() => setQueryParams((prev) => ({ ...prev, page: 1 }))}
                >
                  <Text className="text-white font-medium font-inter">Retry</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : filteredBids.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20 px-4">
              <EmptyScreenComponent
                title={
                  selectedFilter !== 'all'
                    ? `No ${formatStatusLabel(selectedFilter)} Bids`
                    : 'No Bids Found'
                }
                description={
                  selectedFilter !== 'all'
                    ? `There are no ${formatStatusLabel(selectedFilter).toLowerCase()} bids for this project`
                    : 'No contractors have submitted bids for this project yet'
                }
                buttonText="Back to Project"
                onButtonPress={handleBackToProject}
              />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="mt-2"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {filteredBids.map((bid: any) => (
                <View key={bid.id} className="mb-4 px-4">
                  <ClientBidCard 
                    bid={bid} 
                    project={clientProjects} 
                  />
                </View>
              ))}

              {/* Pagination */}
              {pagination && pagination.page < pagination.totalPages && (
                <View className="py-6 items-center">
                  <Text className="text-gray-500 text-sm mb-2 font-inter">
                    Showing {filteredBids.length} of {pagination.total} bids
                  </Text>
                  <TouchableOpacity
                    className="bg-blue-600 px-6 py-3 rounded-lg"
                    onPress={() =>
                      setQueryParams((prev) => ({
                        ...prev,
                        page: (prev.page || 1) + 1,
                      }))
                    }
                  >
                    <Text className="text-white font-medium font-inter">
                      Load More Bids
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
        </View>

      
       
      </View>
    </AppLayout>
  );
};

export default AllBidsScreen;