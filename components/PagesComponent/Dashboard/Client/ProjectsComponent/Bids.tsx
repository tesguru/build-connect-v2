import GradientButton from "@/components/Buttons/GradientButton";
import { ClientBidCard } from "@/components/Cards/ClientBidCard";
import { ContractorCard } from "@/components/Cards/ContractCard"
import { ContractorListItem } from "@/components/Cards/ContractorListItem";
import { useBids } from "@/core/hooks/UseBids";
import { useRouter } from "expo-router";
import React from "react";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View, Text, ActivityIndicator } from "react-native"

type QueryParams = {
  page: number;
  limit: number;
  projectId: string;
};

type Bid = {
  id: string | number;
};

type Contractor = {
  id: string | number;
  name: string;
  rating: number;
  reviews: number;
  image: string;
  companyName?: string;
};

const Bids = ({ projectId }: { projectId: string }) => {
  const router = useRouter();

  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    limit: 100,
    projectId: projectId  
  });

  const { getContractorsQuery, getClientsBidsQuery } = useBids();

  const { 
    data: contractorsData, 
    isLoading: isLoadingContractors, 
    error: contractorsError 
  } = getContractorsQuery(projectId, queryParams);  

  const { 
    data: bidsData, 
    isLoading: isLoadingBids, 
    error: bidsError 
  } = getClientsBidsQuery(projectId, queryParams);  
    
  const clientBidsList: Bid[] = bidsData?.data?.data || [];
  
  const contractorsDataFromApi = contractorsData?.data?.data?.contractors || [];
  
  const contractors: Contractor[] = contractorsDataFromApi.length > 0 
    ? contractorsDataFromApi.map((c: any) => {
        const firstName = c.personalInfo?.firstName || '';
        const lastName = c.personalInfo?.lastName || '';
        const name = `${firstName} ${lastName}`.trim() || 'Unknown Builder';
        
        const companyName = c.businessInfo?.businessName || '';
        const image = c.profilePicture?.publicUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop';
        
        return {
          id: c.id || c.userId || 'unknown-id',
          name: name,
          rating: c.rating || 4.5,
          reviews: c.reviews || 0,
          image: image,
          companyName: companyName
        };
      })
    : [];

  const displayedContractors = contractors.slice(0, 5);
  const hasMoreContractors = contractors.length > 5;

  const comparebids = () => {
    router.replace("/compare-bids-screen");
  }

  const navigateToBuilders = () => {
    router.push({
      pathname: "/list-builders-screen",
      params: { projectId }
    });
  }

  const handleContractorPress = (contractorId: string | number) => {
    router.push({
      pathname: "/invite-to-bid-screen",
      params: { 
        projectId, 
        contractorId: contractorId.toString() 
      }
    });
  }

  if (isLoadingContractors || isLoadingBids) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="text-gray-500 mt-4">Loading data...</Text>
      </View>
    );
  }

  if (contractorsError || bidsError) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <Text className="text-red-500 text-center px-4">
          Error loading data. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>
      <View className="flex-row justify-between items-center px-5 mb-3">
        <Text className="font-interbold text-lg text-gray-900">
        </Text>
        
        {hasMoreContractors && (
          <TouchableOpacity 
            onPress={navigateToBuilders}
            className="py-1 px-3"
          >
            <Text className="font-intersemibold text-blue-600">
              View More 
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {contractors.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-6"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        > 
          {displayedContractors.map(contractor => (
            <View key={contractor.id} className="mr-3">
              <ContractorCard 
                contractor={contractor} 
                contractorid={contractor.id.toString()}
                onPress={() => handleContractorPress(contractor.id)}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <View className="items-center justify-center py-8 mx-4">
          <Text className="text-gray-500">No contractors available</Text>
          <TouchableOpacity 
            onPress={navigateToBuilders}
            className="mt-3 px-4 py-2 bg-blue-500 rounded-lg"
          >
            <Text className="text-white font-intersemibold">Browse Contractors</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="mt-2 mx-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-interbold text-xl text-gray-900">
            Submitted ({clientBidsList.length})
          </Text>
          
          {clientBidsList.length > 3 && (
            <TouchableOpacity>
              <Text className="font-intersemibold text-blue-600">View all</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {clientBidsList.length > 0 ? (
          clientBidsList.slice(0, 3).map((bid: Bid) => (
            <ClientBidCard key={bid.id} bid={bid} />
          ))
        ) : (
          <View className="items-center justify-center py-8 bg-gray-50 rounded-lg">
            <Text className="text-gray-500">No bids submitted yet</Text>
          </View>
        )}
      </View>

      {/* Selected Builders Section */}
      <View className="px-4 pt-6">
        <Text className="font-interbold text-xl mb-4 text-gray-900">
          Selected Builders ({contractors.length})
        </Text>
        {contractors.length > 0 ? (
          contractors.slice(0, 5).map(contractor => (
            <ContractorListItem 
              key={contractor.id}
              contractor={contractor} 
              onPress={() => handleContractorPress(contractor.id)}
            />
          ))
        ) : (
          <View className="items-center justify-center py-8 bg-gray-50 rounded-lg">
            <Text className="text-gray-500">No builders selected yet</Text>
          </View>
        )}
      </View>
      
      {/* Compare Bids Button */}
      <View className="mx-4 my-6 mb-10">
        <GradientButton 
          onPress={comparebids} 
          title="Compare Bids" 
          disabled={clientBidsList.length < 2} 
        />
        {clientBidsList.length < 2 && (
          <Text className="text-gray-500 text-center mt-2 text-sm">
            Need at least 2 bids to compare
          </Text>
        )}
      </View>
    </ScrollView>
  )
}

export default Bids;