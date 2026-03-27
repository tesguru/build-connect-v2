import { MortgageCard } from "@/components/Cards/MortgageApplication";
import AppLayout from "@/components/Layouts/AppLayout";
import EmptyScreenComponent from "@/components/Miscallaneous/EmptyScreenComponent";
import { useProperty } from "@/core/hooks/useProperty";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MortgageQueryParams {
  propertyId?: string;
  status?: string;
}

const STATUS_FILTERS = [
  { id: "all",          label: "All"          },
  { id: "submitted",    label: "Submitted"    },
  { id: "under_review", label: "Under Review" },
  { id: "decision",     label: "Decision"     },
];

// ── Main Screen ───────────────────────────────────────────────────────────────
const MortgageApplicationsScreen = () => {
  const router = useRouter();
  const { viewBuilderMortgages } = useProperty();

  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [queryParams, setQueryParams] = useState<MortgageQueryParams>({});

  const { data: apiResponse, isLoading, error, refetch } = viewBuilderMortgages(queryParams);

  const applications = apiResponse?.data?.data?.applications || [];

  // ── Count per status from the full list ───────────────────────────────────
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      submitted: 0,
      under_review: 0,
      decision: 0,
    };
    for (const app of applications) {
      const s = app.status?.toLowerCase();
      if (s && counts[s] !== undefined) counts[s]++;
    }
    return counts;
  }, [applications]);

  // ── Filter handler ─────────────────────────────────────────────────────────
  const handleStatusFilter = (status: string) => {
    setSelectedFilter(status);
    if (status === "all") {
      setQueryParams({});
    } else {
      setQueryParams({ status });
    }
  };

  return (
    <AppLayout screenName="My Mortgage Applications" fullHeightContent>
      <View className="flex-1">

    
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 10,
            alignItems: "center",
          }}
          style={{ maxHeight: 62, marginTop: 8 }}
        >
          {STATUS_FILTERS.map((filter) => {
            const count =
              filter.id === "all"
                ? applications.length
                : filterCounts[filter.id] ?? 0;
            const isActive = selectedFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                onPress={() => handleStatusFilter(filter.id)}
                className={`px-5 py-3 rounded-full border min-w-[90px] items-center justify-center ${
                  isActive
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-inter font-medium text-center ${
                    isActive ? "text-white" : "text-gray-800"
                  }`}
                >
                  {filter.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Content ── */}
        <View className="flex-1 mt-1">
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
              <Text className="mt-4 text-gray-600 font-inter">
                Loading applications...
              </Text>
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
                title={
                  selectedFilter !== "all"
                    ? `No "${STATUS_FILTERS.find((f) => f.id === selectedFilter)?.label}" Applications`
                    : "No Applications Found"
                }
                description={
                  selectedFilter !== "all"
                    ? `You don't have any ${STATUS_FILTERS.find((f) => f.id === selectedFilter)?.label.toLowerCase()} applications yet`
                    : "You haven't applied for any mortgage yet"
                }
                buttonText="Browse Properties"
                onButtonPress={() => router.push("/(clients)/properties/properties")}
              />
            </View>
          ) : (
            <FlatList
              data={applications}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40, gap: 14, paddingTop: 4, paddingHorizontal: 16 }}
              renderItem={({ item }) => (
                <MortgageCard
                  item={item}
                  onPress={() =>
                    router.push({
                      pathname: "/(builders)/viewmortgage/viewdetails",
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