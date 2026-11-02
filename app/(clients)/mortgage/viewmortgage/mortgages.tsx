import { MortgageCard } from "@/components/Cards/MortgageApplication";
import AppLayout from "@/components/Layouts/AppLayout";
import EmptyScreenComponent from "@/components/Miscallaneous/EmptyScreenComponent";
import { useProperty } from "@/core/hooks/useProperty";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";


// ── Main Screen ───────────────────────────────────────────────────────────────
const MortgageApplicationsScreen = () => {
  const router = useRouter();
  const { myMortgageApplications} = useProperty();

  const { data: apiResponse, isLoading, error, refetch } = myMortgageApplications();

  const applications  =
    apiResponse?.data?.data?.applications || [];

  return (
    <AppLayout screenName="My Mortgages" fullHeightContent>
      <View className="flex-1">
        <View className="mt-4 flex-1">
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
              <Text className="mt-4 text-gray-600 font-inter">Loading applications...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center p-4">
              <Text className="text-red-500 text-center mb-4 font-inter">
                Error loading applications. Please try again.
              </Text>
              <TouchableOpacity
                className="bg-blue-600 px-6 py-3 rounded-lg"
                onPress={() => refetch()}
              >
                <Text className="text-white font-inter font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : applications.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20 px-4">
              <EmptyScreenComponent
                title="No Applications Found"
                description="You haven't applied for any mortgage yet"
                buttonText="Browse Properties"
                onButtonPress={() => router.push('/(clients)/properties/properties')}
              />
            </View>
          ) : (
            <FlatList
              data={applications}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40, gap: 14, paddingTop: 8 , paddingHorizontal:9}}
              renderItem={({ item }) => (
                <MortgageCard
                  item={item}
                  onPress={() =>
                    router.push({
                      pathname: '/(clients)/mortgage/viewmortgage/viewdetails',
                      params: { id: item.id },
                    })
                  }
                />
              )}
            />
          )}
        </View>
      </View>
    </AppLayout>
  );
};

export default MortgageApplicationsScreen;