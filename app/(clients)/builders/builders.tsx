import { ContractorCard } from "@/components/Cards/ContractCard";
import AppLayout from "@/components/Layouts/AppLayout";
import { useBids } from "@/core/hooks/UseBids";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BuildersScreen = () => {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  const { getContractorsQuery } = useBids();

  const queryParams = {
    page: 1,
    limit: 100,
    projectId: projectId || "",
  };

  const {
    data: contractorsData,
    isLoading,
    error,
  } = getContractorsQuery(projectId || "", queryParams);

  const contractorsDataFromApi = contractorsData?.data?.data?.contractors || [];

  const contractors =
    contractorsDataFromApi.length > 0
      ? contractorsDataFromApi.map((c: any) => {
          const firstName = c.personalInfo?.firstName || "";
          const lastName = c.personalInfo?.lastName || "";
          const name = `${firstName} ${lastName}`.trim() || "Unknown Builder";
          const companyName = c.businessInfo?.businessName || "";
          const image =
            c.profilePicture?.publicUrl ||
            "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop";

          return {
            id: c.id || c.userId || "unknown-id",
            name: name,
            rating: c.rating || 4.5,
            reviews: c.reviews || 0,
            image: image,
            companyName: companyName,
          };
        })
      : [];

  const renderFlatListItem = ({ item }: { item: any }) => {
    return (
      <View className="flex-1 pt-6">
        <ContractorCard
          contractor={{
            image: item.image,
            name: item.name,
            rating: item.rating,
            reviews: item.reviews,
          }}
          contractorid={item.id}
          projectId={projectId}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <AppLayout screenName="All Builders">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-gray-500 mt-4">Loading builders...</Text>
        </View>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout screenName="All Builders">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-red-500 text-center mt-4 font-interbold text-lg">
            Error loading builders
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Please try again later
          </Text>
          <TouchableOpacity
            className="mt-4 px-4 py-2 bg-blue-500 rounded-lg"
            onPress={() => {
              // Add retry logic here
            }}
          >
            <Text className="text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </AppLayout>
    );
  }

  if (contractors.length === 0) {
    return (
      <AppLayout screenName="All Builders">
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="people-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-900 text-center mt-4 font-interbold text-lg">
            No Builders Found
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            There are no builders available for this project yet.
          </Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout screenName="All Builders" fullHeightContent>
      <View className="flex-1 bg-gray-50">
        <FlatList
          data={contractors}
          renderItem={renderFlatListItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingTop: 10,
            paddingBottom: 16,
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </AppLayout>
  );
};

export default BuildersScreen;
