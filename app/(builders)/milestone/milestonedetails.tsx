
import AppLayout from '@/components/Layouts/AppLayout';
import { useEscrow } from '@/core/hooks/useEscrow';
import { useProjects } from '@/core/hooks/useProjects';
import { LookupService } from '@/core/services/lookup/LookupService';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Text,
    View
} from 'react-native';


const formatAmount = (amount: any) => {
    if (!amount) return "Not specified";
    const num = parseFloat(amount);
    if (isNaN(num)) return "Not specified";
    return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

type UpdateFormValues = {
    statusId: string;
};

type PaymentFormValues = {
    note: string;
};

const MileStoneDetails = () => {
    const router = useRouter();
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const { milestoneId, projectId, milestoneName } = useLocalSearchParams<{
        milestoneId: string;
        projectId: string;
        mileStoneName: string;
    }>();

   

    const { singleMilestoneDetailsQuery, updateMileStoneMutation } = useProjects();
    const { data, isLoading, error, refetch } = singleMilestoneDetailsQuery(projectId, milestoneId);
    const { createPaymentInstructionsMutation } = useEscrow();

    const { control, handleSubmit, formState: { errors } } = useForm<UpdateFormValues>();
    const { control: paymentControl, handleSubmit: handlePaymentSubmit, formState: { errors: paymentErrors } } = useForm<PaymentFormValues>();

    const apiResponse = data?.data;
    const apiData = apiResponse?.data || apiResponse;
    const mileStoneData = apiData || {};

    const statusStyle = getStatusStyle(mileStoneData?.status);

    const isMilestoneCompleted = mileStoneData?.status?.toLowerCase() === "completed";

    const { data: milestoneStatuses = [], isLoading: isLoadingPlatforms } = useQuery({
        queryKey: ["milestoneStatuses"],
        queryFn: async () => {
            const response = await LookupService.milestoneStatuses();
            return response.data.data;
        },
    });

    const mileStoneStatusesData = milestoneStatuses?.map((item) => ({
        label: item.label,
        value: item.id,
        id: item.id,
    })) || [];

    const onSubmit = (formData: UpdateFormValues) => {
        updateMileStoneMutation.mutate({
            projectId,
            milestoneId,
            statusId: formData.statusId,
        });
        refetch();
    };

    const handleConfirmPaymentInstruction = (formData: PaymentFormValues) => {
        createPaymentInstructionsMutation.mutate(
            {
                projectId,
                milestoneId,
                currency: "NGN",
                note: formData.note,
            },
            {
                onSuccess: () => setShowPaymentModal(false),
            }
        );
    };

    if (isLoading) {
        return (
               <AppLayout screenName={milestoneName}>

            <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#2463EB" />
                <Text className="mt-4 text-gray-600">Loading milestone details...</Text>
            </View>
            </AppLayout>
        );
    }

    if (error) {
        return (
             <AppLayout screenName={milestoneName}>
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-red-500 text-center mb-4">
                    Error loading milestone details. Please try again.
                </Text>
            </View>
            </AppLayout>
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
                        <Text className="font-interbold text-lg text-green-700">
                            {formatAmount(mileStoneData?.amount)}
                        </Text>
                    </View>

                    <View className="px-4 py-4 flex-row justify-between items-center">
                        <Text className="font-interbold text-lg">Status</Text>
                        <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
                            <Text className={`font-interbold text-sm capitalize ${statusStyle.text}`}>
                                {mileStoneData?.status?.replace('_', ' ') || "Not specified"}
                            </Text>
                        </View>
                    </View>
                 
                   
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