import MilestoneCard from '@/components/Cards/MileStoneCard';
import { useProjects } from '@/core/hooks/useProjects';
import React, { useState } from 'react'; // Need useState for queryParams
import { View, Text, ActivityIndicator } from 'react-native';

const Milestone = (projectId: {projectId: string}) => {
    const [queryParams, setQueryParams] = useState({
        page: 1,
        limit: 100,
        projectId: projectId.projectId
    });
    
    const { getProjectMilestonesQuery } = useProjects();
    
    const { 
        data: apiResponse, 
        isLoading, 
        error 
    } = getProjectMilestonesQuery(projectId.projectId, queryParams); // TWO parameters!

    const milestones = apiResponse?.data?.data?.milestones || 
                      apiResponse?.data?.milestones || 
                      [];
    
    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#2463EB" />
                <Text className="mt-4 text-gray-600">Loading milestones...</Text>
            </View>
        );
    }
    
    if (error) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-red-500 text-center">
                    Error loading milestones.
                </Text>
            </View>
        );
    }
    
    // Empty state
    if (milestones.length === 0) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-gray-500">
                    No milestones found.
                </Text>
            </View>
        );
    }
    
    // Format date
    const formatDate = (dateString: string) => {
        if (!dateString) return "No date";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };
 
    const getProgress = (status: string) => {
        if (status === 'completed') return 100;
        if (status === 'in_progress') return 50;
        return 0;
    };
    

    const getStatusLabel = (status: string) => {
        if (status === 'completed') return 'Completed';
        if (status === 'in_progress') return 'In Progress';
        return 'Pending';
    };

    return (
        <View className="p-4">
            {milestones.map((milestone) => (
                <View key={milestone.id} className="mb-4">
                    <MilestoneCard
                        milestoneName={milestone.name}
                        dueDate={formatDate(milestone.completionDate)}
                        budget={`$${milestone.amount?.toLocaleString() || '0'}`}
                        progress={getProgress(milestone.status)}
                        status={getStatusLabel(milestone.status)}
                        onPress={() => console.log('Milestone pressed:', milestone.id)}
                    />
                </View>
            ))}
        </View>
    );
}

export default Milestone;