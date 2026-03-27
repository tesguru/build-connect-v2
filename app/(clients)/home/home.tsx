import ImageBanner from "@/components/AdsBanner/ImageBanner";
import ProjectsWithMilestone from "@/components/Cards/ProjectsWithMileStone";
import EmptyComponent from "@/components/Miscallaneous/EmptyComponent";
import DashboardHeader from "@/components/PagesComponent/Dashboard/Shared/DashboardHeader";
import QuickAccessCard from "@/components/PagesComponent/Dashboard/Shared/QuickAccessCard";
import { HomeBaseMortgageBankBanner } from "@/constants/banner";
import { BankIcon, PlusIcon, SupportIcon } from "@/constants/icon";
import { CustomSurvey } from "@/constants/image";
import { useProjects } from "@/core/hooks/useProjects";
import { useProperty } from "@/core/hooks/useProperty";
import { MarketplaceProperty, Project, ProjectQueryParams } from "@/core/types/api";
import { useAuthStore } from "@/store/Authstore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import ClientPropertiesComponent from "../../../components/Cards/ClientPropertiesComponent";

const ClientHome = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const router = useRouter();

  const [projectQueryParams] = useState<ProjectQueryParams>({
    page: 1,
    limit: 4,
    includeProgress: true,
  });

  // ── Projects ──────────────────────────────────────────────────────────────
  const { getAllProjectsQuery } = useProjects();
  const {
    data: projectsResponse,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = getAllProjectsQuery(projectQueryParams);

  const projectsList: Project[] = projectsResponse?.data?.data?.projects || [];

  // ── Marketplace Properties ────────────────────────────────────────────────
  const { propertyMarketPlaceQuery } = useProperty();
  const {
    data: marketplaceResponse,
    isLoading: isLoadingProperties,  // ← the fix
  } = propertyMarketPlaceQuery({ page: 1, limit: 10 });

  const marketplaceProperties: MarketplaceProperty[] =
    marketplaceResponse?.data?.data?.properties ?? [];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const firstName = user?.firstName || "User";

  const handleNotification = () => router.push("/notification/notification");
  const handleAddProject = () => router.push("/projects/addproject");
  const handleEscrowAccount = () => router.push("/(clients)/escrow/escrowaccount");
  const handleMortgageProperties = () => router.push("/(clients)/mortgage/viewmortgage/mortgages");
  const handleProject = () => router.push("/(clients)/projects/projects");

  return (
    <View className="flex-1">
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

        <TouchableOpacity
          onPress={() => router.push("/(clients)/properties/properties")}
          className="mx-2"
        >
          <ImageBanner imageSrc={HomeBaseMortgageBankBanner} />
        </TouchableOpacity>

        {/* Quick Access */}
        <View className="px-4">
          <Text className="font-interbold text-xl mb-4 text-gray-900">Quick Access</Text>
          <View className="flex-row gap-6">
            <QuickAccessCard icon={PlusIcon} title="Add Project" onPress={handleAddProject} />
            <QuickAccessCard icon={BankIcon} title="Escrow Account" onPress={handleEscrowAccount} />
            <QuickAccessCard icon={SupportIcon} title="My Mortgage" onPress={handleMortgageProperties} />
          </View>
        </View>


        <View className="mt-8 rounded-xl px-2">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-interbold text-xl text-gray-900">My Projects</Text>
            {projectsList.length > 2 && (
              <TouchableOpacity onPress={handleProject}>
                <Text className="font-inter text-blue-500">View all</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoadingProjects ? (
            <View className="justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
            </View>
          ) : projectsError || projectsList.length === 0 ? (
            <View className="items-center py-8">
              <Image source={CustomSurvey} resizeMode="contain" style={{ width: 90, height: 90 }} />
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
                  status={project.statusDetails?.value || "N/A"}
                  role="client"
                  bids="0"
                  onPress={() =>
                    router.push({
                      pathname: '/projects/clientprojectdetails',
                      params: { projectId: project.id, status: project.statusDetails?.value},
                    })
                  }
                />
              </View>
            ))
          )}
        </View>

        <View className="mt-8">
          <View className="mx-3 flex-row justify-between items-center mb-4">
            <Text className="font-interbold text-xl text-gray-900">Available Properties</Text>
            {marketplaceProperties.length > 2 && (
              <TouchableOpacity onPress={() => router.push('/(clients)/properties/properties')}>
                <Text className="font-inter text-blue-500">View all</Text>
              </TouchableOpacity>
            )}
          </View>


          {isLoadingProperties ? (
            <View className="justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
            </View>
          ) : marketplaceProperties.length === 0 ? (
            <EmptyComponent description="No properties in the marketplace yet" />
          ) : (
            marketplaceProperties.slice(0, 2).map((property, index) => (
              <ClientPropertiesComponent
                key={property?.id ?? `property-${index}`}
                property={property}
                onPress={() =>
                  router.push({
                    pathname: '/(clients)/properties/propertiesdetails',
                    params: { id: property.id },
                  })
                }
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