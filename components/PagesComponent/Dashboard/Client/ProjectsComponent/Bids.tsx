import { ClientBidCard } from "@/components/Cards/ClientBidCard";
import { ContractorCard } from "@/components/Cards/ContractCard";
import InvitationCard from "@/components/Cards/InvitationCard";
import { useBids } from "@/core/hooks/UseBids";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

type QueryParams = {
  page: number;
  limit: number;
  projectId: string;
};

type InvitationQueryParams = {
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

const Bids = ({ projectId, status }: { projectId: string; status: string }) => {
  const router = useRouter();

  const [queryParams] = useState<QueryParams>({
    page: 1,
    limit: 100,
    projectId,
  });


  const [invitationQueryParams] = useState<InvitationQueryParams>({
    page: 1,
    limit: 100,
    projectId,
  });

 
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const showContractorSection = ["posted"].includes(status?.toLowerCase());
  const { getContractorsQuery, getClientsBidsQuery, clientInvitations, respondToBidInvitationMutation } = useBids();

  const {
    data: contractorsData,
    isLoading: isLoadingContractors,
    error: contractorsError,
  } = getContractorsQuery(projectId, queryParams);

  const {
    data: bidsData,
    isLoading: isLoadingBids,
    error: bidsError,
  } = getClientsBidsQuery(projectId, queryParams);

  // ── Invitations API call ──
  const {
    data: invitationsResponse,
    isLoading: isLoadingInvitations,
    error: invitationsError,
  } = clientInvitations(invitationQueryParams);

  const clientBidsList: Bid[] =
    bidsData?.data?.data?.bids ||
    bidsData?.data?.bids ||
    [];

  const clientProjects: Bid[] =
    bidsData?.data?.data?.project ||
    bidsData?.data?.project ||
    [];

  const contractorsDataFromApi =
    contractorsData?.data?.data?.contractors ||
    contractorsData?.data?.contractors ||
    [];

  const invitationsList =
    invitationsResponse?.data?.data?.invitations ??
    invitationsResponse?.data?.invitations ??
    [];

  const contractors: Contractor[] = contractorsDataFromApi.map((c: any) => {
    const firstName = c.personalInfo?.firstName || "";
    const lastName = c.personalInfo?.lastName || "";
    return {
      id: c.userId,
      name: `${firstName} ${lastName}`.trim() || "Unknown Builder",
      companyName: c.businessInfo?.businessName || "",
      image:
        c.profilePicture?.publicUrl ||
        "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop",
    };
  });

  const displayedContractors = contractors.slice(0, 5);
  const hasMoreContractors = contractors.length > 5;

  const navigateToBuilders = () => {
    router.push({
      pathname: "/builders/builders",
      params: { projectId },
    });
  };

  const handleContractorPress = (contractorId: string | number) => {
    router.push({
      pathname: "/projects/inviteprofilescreen",
      params: {
        projectId,
        contractorId: contractorId.toString(),
      },
    });
  };

  const handleViewAllBids = () => {
    router.push({
      pathname: "/projects/allbids",
      params: { projectId },
    });
  };

  const handleViewAllInvitations = () => {
    router.push({
      pathname: "/projects/invitedBids",
      params: { projectId },
    });
  };

 



  return (
    <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>
      {showContractorSection && (
        <>
          <View className="flex-row justify-between items-center px-5 mb-3">
            <Text className="font-interbold text-lg text-gray-900">Contractors</Text>
            {hasMoreContractors && (
              <TouchableOpacity onPress={navigateToBuilders} className="py-1 px-3">
                <Text className="font-intersemibold text-blue-600">View More</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoadingContractors ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#2463EB" />
              <Text className="text-gray-500 mt-2">Loading contractors...</Text>
            </View>
          ) : contractorsError ? (
            <View className="items-center py-6 mx-4 bg-red-50 rounded-xl">
              <Text className="text-red-500 text-center px-4">
                Error loading contractors. Please try again.
              </Text>
            </View>
          ) : contractors.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {displayedContractors.map((contractor) => (
                <View key={contractor.id} className="mr-3">
                  <ContractorCard
                    contractor={contractor}
                    projectId={projectId}
                    contractorid={contractor.id.toString()}
                    onPress={() => handleContractorPress(contractor.id)}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="items-center justify-center py-8 mx-4 bg-gray-50 rounded-xl">
              <Text className="text-gray-500 mb-3">No contractors available</Text>
              <TouchableOpacity
                onPress={navigateToBuilders}
                className="px-4 py-2 bg-blue-500 rounded-lg"
              >
                <Text className="text-white font-intersemibold">Browse Contractors</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      <View className="mt-2 mx-4 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-interbold text-xl text-gray-900">
            Submitted Bids
          </Text>
          {clientBidsList.length > 2 && (
            <TouchableOpacity onPress={handleViewAllBids}>
              <Text className="font-intersemibold text-blue-600">View all</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoadingBids ? (
          <View className="items-center py-8">
            <ActivityIndicator size="small" color="#2463EB" />
            <Text className="text-gray-500 mt-2">Loading bids...</Text>
          </View>
        ) : bidsError ? (
          <View className="items-center py-6 bg-red-50 rounded-xl">
            <Text className="text-red-500 text-center px-4">
              Error loading bids. Please try again.
            </Text>
          </View>
        ) : clientBidsList.length > 0 ? (
          clientBidsList.slice(0, 2).map((bid: Bid) => (
            <ClientBidCard key={bid.id} bid={bid} project={clientProjects} />
          ))
        ) : (
          <View className="items-center justify-center py-8 bg-gray-50 rounded-xl">
            <Text className="text-gray-500">No bids submitted yet</Text>
          </View>
        )}
      </View>

    
      <View className="mt-2 mx-4 mb-10">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-interbold text-xl text-gray-900">
            Invited Bids 
          </Text>
          {invitationsList.length > 2 && (
            <TouchableOpacity onPress={handleViewAllInvitations}>
              <Text className="font-intersemibold text-blue-600">View More</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoadingInvitations ? (
          <View className="items-center py-8">
            <ActivityIndicator size="small" color="#2463EB" />
            <Text className="text-gray-500 mt-2">Loading invitations...</Text>
          </View>
        ) : invitationsError ? (
          <View className="items-center py-6 bg-red-50 rounded-xl">
            <Text className="text-red-500 text-center px-4">
              Error loading invitations. Please try again.
            </Text>
          </View>
        ) : invitationsList.length > 0 ? (
          invitationsList.slice(0, 2).map((invitation: any) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
            />
          ))
        ) : (
          <View className="items-center justify-center py-8 bg-gray-50 rounded-xl">
            <Text className="text-gray-500">No invitations sent yet</Text>
          </View>
        )}
      </View>

   

    </ScrollView>
  );
};

export default Bids;