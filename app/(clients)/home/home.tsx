import ImageBanner from "@/components/AdsBanner/ImageBanner";
import ProjectsWithMilestone from "@/components/Cards/ProjectsWithMileStone";
import EmptyComponent from "@/components/Miscallaneous/EmptyComponent";
import DashboardHeader from "@/components/PagesComponent/Dashboard/Shared/DashboardHeader";
import QuickAccessCard from "@/components/PagesComponent/Dashboard/Shared/QuickAccessCard";
import SearchBarWithFilter from "@/components/PagesComponent/Dashboard/Shared/SearchBarWithFilter";
import { HomeBaseMortgageBankBanner } from "@/constants/banner";
import { BankIcon, PlusIcon, SupportIcon } from "@/constants/icon";
import { useProjects } from "@/core/hooks/useProjects";
import { useAuthStore } from "@/store/Authstore";
import { Project, ProjectQueryParams, MarketplaceProperty } from "@/core/types/api";

import React, { useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CustomSurvey } from "@/constants/image";
import ClientPropertiesComponent from "../properties/ClientPropertiesComponent";
import { useRouter } from "expo-router";

const ClientHome = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [queryParams, setQueryParams] = useState<ProjectQueryParams>({
    page: 1,
    limit: 2,
    includeProgress: true
  });

  const { getAllProjectsQuery, projectsMarketPlaceQuery } = useProjects();

  const {
    data: apiResponse,
    isLoading: isLoadingProjects,
    error: projectsError
  } = getAllProjectsQuery(queryParams);

  const { data: marketplaceResponse } = projectsMarketPlaceQuery({});

  const projectsList: Project[] = apiResponse?.data?.data?.projects ||
    apiResponse?.data?.projects ||
    apiResponse?.data?.projects ||
    [];

  const marketplaceProperties: MarketplaceProperty[] =
    marketplaceResponse?.data?.data?.properties ??
    marketplaceResponse?.data?.data?.items ??
    marketplaceResponse?.data?.properties ??
    marketplaceResponse?.data?.items ??
    (Array.isArray(marketplaceResponse?.data?.data) ? marketplaceResponse.data.data : []);
  const recommendedProperties = marketplaceProperties.slice(0, 2);

  const firstName = user?.firstName || "User";
  const router = useRouter();
  const handleNotification = () => {
    router.push("/notification/notification")
  };

  const handleAddProject = () => {
    router.push("/projects/addproject")
  };

  const handleEscrowAccount = () => {

    router.push("/escrow/escrowaccount")
  };

  const handleSupport = () => {
     router.push("/support/support")
  };

  const handleProject = () => {
    navigation.navigate("AllProjects");
  }

  const handleViewAllRecommendations = () => {
    navigation.navigate("Recommendations");
  }

  return (
    <View className="flex-1 ">
      {/* Header */}
      <DashboardHeader
        userName={firstName}
        showDropdown={true}
        onNotificationPress={handleNotification}
        onProfilePress={() => router.push("/profilescreen")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 8 }}
      >

        <SearchBarWithFilter
          placeholder="Search..."
          onFilterPress={() => { }}
        />

        <View className="mx-2">
          <ImageBanner imageSrc={HomeBaseMortgageBankBanner} />
        </View>

        <View className="px-4">
          <Text className="font-interbold text-xl mb-4 text-gray-900">
            Quick Access
          </Text>
          <View className="flex-row justify-between">
            <QuickAccessCard
              icon={PlusIcon}
              title="Add Project"
              onPress={handleAddProject}
            />
            <QuickAccessCard
              icon={BankIcon}
              title="Escrow Account"
              onPress={handleEscrowAccount}
            />
            <QuickAccessCard
              icon={SupportIcon}
              title="Support"
              onPress={handleSupport}
            />
          </View>
        </View>


        {/* My Projects */}
        <View className="mt-8 mx-2  rounded-xl p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-interbold text-xl text-gray-900">
              My Projects
            </Text>
            {projectsList && projectsList.length > 2 && (
              <TouchableOpacity onPress={handleProject}>
                <Text className="font-inter text-blue-500">View all</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoadingProjects ? (
            <View className="justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
            </View>
          ) : projectsError || !projectsList || projectsList.length === 0 ? (
            <View className="items-center py-8">
              <Image
                source={CustomSurvey}
                resizeMode="contain"
                style={{ width: 90, height: 90 }}
              />
              <Text className="font-worksanssemibold text-2xl mt-4">Oops!</Text>
              <Text className="font-work-sans text-base text-gray-500 text-center mt-2 px-4">
                You do not have any project yet
              </Text>
            </View>
          ) : (
            projectsList.slice(0, 2).map((project) => (
              <View key={project.id} className="mb-4">
                <ProjectsWithMilestone
                  postedTime="Posted 1 hour ago"
                  projectName={project.title}
                  progress={(project as any)?.progress?.progressPercentage}
                  location={project.location}
                  description={project.description}
                  budget={project.budgetRange?.label || "N/A"}
                  duration={project.timeline?.label || "N/A"}
                  role="client"
                  bids="0"
                  onPress={() =>
                  router.push({
                    pathname: '/projects/clientprojectdetails',
                    params: { projectId: project.id }
                  })
                  }
                />
              </View>
            ))
          )}
        </View>

     
        <View className="mt-8">
          <View className="mx-3 flex-row justify-between items-center mb-4">
            <Text className="font-interbold text-xl text-gray-900">
              Recommended Properties
            </Text>
            {recommendedProperties.length > 0 && (
              <TouchableOpacity onPress={handleViewAllRecommendations}>
                <Text className="font-inter text-blue-500">View all</Text>
              </TouchableOpacity>
            )}
          </View>

          {recommendedProperties.length === 0 ? (
            <EmptyComponent
              description="No properties in the marketplace yet"
            />
          ) : (
            recommendedProperties.map((property, index) => (
              <ClientPropertiesComponent
                key={property?.id ?? `recommended-${index}`}
                property={property}
              />
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handleAddProject}
        className="absolute bottom-6 right-6 bg-blue-600 rounded-full flex-row items-center px-6 py-4 shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text className="text-white text-2xl font-bold mr-2">+</Text>
        <Text className="text-white font-inter text-base font-medium">Add Project</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ClientHome;