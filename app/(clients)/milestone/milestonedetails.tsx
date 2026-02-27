import AppLayout from '@/components/Layouts/AppLayout';
import ProgressBar from '@/components/Miscallaneous/ProgressBar';
import { useProjects } from '@/core/hooks/useProjects';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';


// ✅ Format amount → ₦1,500,000
const formatAmount = (amount: any) => {
    if (!amount) return "Not specified";
    const num = parseFloat(amount);
    if (isNaN(num)) return "Not specified";
    return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ✅ Status color config
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


const MileStoneDetails = () => {
    const router = useRouter();
    const { milestoneId, projectId } = useLocalSearchParams<{
        milestoneId: string;
        projectId: string;
    }>();
    const { singleMilestoneDetailsQuery } = useProjects();
    const { data, isLoading, error } = singleMilestoneDetailsQuery(projectId, milestoneId);

    const apiResponse = data?.data;
    const apiData = apiResponse?.data || apiResponse;
    const mileStoneData = apiData || {};

    const statusStyle = getStatusStyle(mileStoneData?.status);

    const handleCloseproject = () => {
        router.push("/closed-projects");
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#2463EB" />
                <Text className="mt-4 text-gray-600">Loading project details...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-red-500 text-center mb-4">
                    Error loading project details. Please try again.
                </Text>
            </View>
        );
    }

    return (
        <AppLayout screenName={mileStoneData.name}>
            <View>
                <View className="pt-4 bg-white m-4 rounded-xl">
                    <Text className="font-interbold px-4 text-xl pb-4">Milestone Details</Text>

                    <View className="px-4 py-4 flex-row justify-between">
                        <Text className="font-intersemibold text-lg">Completion Date</Text>
                        <Text className="font-interbold text-lg">
                            {mileStoneData?.completionDate || "Not specified"}
                        </Text>
                    </View>

                    <View className="px-4 py-4 flex-row justify-between">
                        <Text className="font-intersemibold text-lg">Payment Amount</Text>
                        {/* ✅ Naira + comma formatted */}
                        <Text className="font-interbold text-lg text-green-700">
                            {formatAmount(mileStoneData?.amount)}
                        </Text>
                    </View>

                    <View className="px-4 py-4 flex-row justify-between items-center">
                        <Text className="font-interbold text-lg">Status</Text>
                        {/* ✅ Colored status badge */}
                        <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
                            <Text className={`font-interbold text-sm capitalize ${statusStyle.text}`}>
                                {mileStoneData?.status?.replace('_', ' ') || "Not specified"}
                            </Text>
                        </View>
                    </View>

                    <ProgressBar progress={mileStoneData?.progress?.progressPercentage || 0} />
                </View>

                <View className="pt-4 bg-white m-4 rounded-xl">
                    <Text className="font-interbold px-4 text-xl">Description</Text>
                    <Text className="font-inter p-5">
                        {mileStoneData.description || "No description available"}
                    </Text>
                </View>
            </View>
        </AppLayout>
    );
};

export default MileStoneDetails;