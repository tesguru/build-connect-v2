import ProjectTimeline from '@/components/Cards/ProjectTimeline';
import ProgressBar from '@/components/Miscallaneous/ProgressBar';
import { useProjects } from '@/core/hooks/useProjects';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';


const Overview = (projectId:{projectId : string}) => {

    const router = useRouter();
    const { getSingleProjectQuery } = useProjects();
    const { data, isLoading, error } = getSingleProjectQuery(projectId);
    
    const apiResponse = data?.data;
    const apiData = apiResponse?.data || apiResponse; 
    const projectData = apiData || {};
    
   
    
  
    
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
        <View>
            <View className="pt-4 bg-white m-4 rounded-xl">
                <Text className="font-interbold px-4 text-xl pb-2">Project Description</Text>
                <Text className="font-inter px-4 pt-4">
                    {projectData?.description || "No description available"}
                </Text>
                <View className="px-3">
                <ProgressBar progress={projectData?.progress?.progressPercentage || 0}/>
                </View>
                <View className="px-4 py-4 flex-row justify-between">
                    <Text className="font-interbold text-lg">Budget</Text>
                    <Text className="font-interbold text-lg">
                        {projectData?.budgetRange?.label || "Not specified"}
                    </Text>
                </View>
                <View className="px-4 py-4 flex-row justify-between">
                    <Text className="font-interbold text-lg">Timeline</Text>
                    <Text className="font-interbold text-lg">
                        {projectData?.timeline?.label || "Not specified"}
                    </Text>
                </View>
                <View className="px-4 py-4 flex-row justify-between">
                    <Text className="font-interbold text-lg">Project Type</Text>
                    <Text className="font-interbold text-lg">
                        {projectData?.projectType?.label || "Not specified"}
                    </Text>
                </View>
            </View>

            <ProjectTimeline milestones={projectData?.milestones || []}/>
            
        </View>
    )
}

export default Overview