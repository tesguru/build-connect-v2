import GradientButton from '@/components/Buttons/GradientButton';
import DropdownField from '@/components/Forms/DropDown';
import { FormTextArea } from '@/components/Forms/TextArea';

import AppLayout from '@/components/Layouts/AppLayout';
import ProgressBar from '@/components/Miscallaneous/ProgressBar';
import { useEscrow } from '@/core/hooks/useEscrow';
import { useProjects } from '@/core/hooks/useProjects';
import { LookupService } from '@/core/services/lookup/LookupService';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
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

    const { milestoneId, projectId } = useLocalSearchParams<{
        milestoneId: string;
        projectId: string;
    }>();

    console.log(projectId)

    const { singleMilestoneDetailsQuery, updateMileStoneMutation } = useProjects();
    const { data, isLoading, error } = singleMilestoneDetailsQuery(projectId, milestoneId);
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

                    <ProgressBar progress={mileStoneData?.progress?.progressPercentage || 0} />
                </View>

                <View className="pt-4 bg-white m-4 rounded-xl">
                    <Text className="font-interbold px-4 text-xl">Description</Text>
                    <Text className="font-inter p-5">
                        {mileStoneData.description || "No description available"}
                    </Text>
                </View>

                {/* Update Milestone Status */}
                <View className="pt-3 p-4 mx-4 bg-white rounded-xl gap-y-3">
                    <DropdownField
                        name="statusId"
                        control={control}
                        label="Update Milestone"
                        placeholder={isLoadingPlatforms ? "Loading..." : "Select milestone status"}
                        data={mileStoneStatusesData || []}
                        error={errors.statusId?.message as string}
                    />

                    <GradientButton
                        loading={updateMileStoneMutation.isPending}
                        title="Update Milestone"
                        onPress={handleSubmit(onSubmit)}
                    />
                </View>

                {/* Payment Instruction button — only when status is completed */}
                {isMilestoneCompleted && (
                    <View className="pt-3 p-4 mx-4 bg-white rounded-xl">
                        <GradientButton
                            loading={false}
                            title="Send Payment Instruction"
                            onPress={() => setShowPaymentModal(true)}
                        />
                    </View>
                )}
            </View>

            {/* Payment Instruction Confirmation Modal */}
            <Modal
                visible={showPaymentModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPaymentModal(false)}
            >
                <Pressable
                    className="flex-1 bg-black/50 justify-center items-center px-5"
                    onPress={() => setShowPaymentModal(false)}
                >
                    {/* Prevent modal close when tapping inside */}
                    <Pressable
                        className="bg-white w-full rounded-2xl p-6 gap-y-4"
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <View className="items-center gap-y-1">
                            <Text className="font-interbold text-xl text-center">
                                Send Payment Instruction
                            </Text>
                            <Text className="font-inter text-sm text-gray-500 text-center">
                                You are sending a notification to{" "}
                                <Text className="font-interbold text-gray-700">
                                    Homebase Mortgage Bank
                                </Text>
                                . Please add a note and confirm to proceed.
                            </Text>
                        </View>

                        {/* Note Field */}
                        <View>
                            <Controller
                                control={paymentControl}
                                name="note"
                                render={({ field }) => (
                                    <FormTextArea
                                        label="Note"
                                        placeholder="Add a note for this payment instruction..."
                                        value={field.value}
                                        onChangeText={field.onChange}
                                        hasError={!!paymentErrors.note}
                                        errorMessage={paymentErrors.note?.message}
                                        width="w-full"
                                    />
                                )}
                            />
                        </View>

                        {/* Actions */}
                        <View className="flex-row gap-x-3 pt-2">
                            <TouchableOpacity
                                className="flex-1 border border-gray-300 rounded-xl py-3 items-center"
                                onPress={() => setShowPaymentModal(false)}
                            >
                                <Text className="font-interbold text-gray-600">Cancel</Text>
                            </TouchableOpacity>

                            <View className="flex-1">
                                <GradientButton
                                    loading={createPaymentInstructionsMutation.isPending}
                                    title="Proceed"
                                    onPress={handlePaymentSubmit(handleConfirmPaymentInstruction)}
                                />
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </AppLayout>
    );
};

export default MileStoneDetails;