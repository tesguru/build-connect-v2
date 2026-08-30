import { BidsCard } from "@/components/Cards/BidsCard";
import InfoCard from "@/components/Cards/InfoCard";
import ProjectsComponent from "@/components/Cards/ProjectsComponent";
import PropertiesComponent from "@/components/Cards/PropertiesComponent";
import DashboardHeader from "@/components/PagesComponent/Dashboard/Shared/DashboardHeader";
import { AddCircle, Code, Dollar } from "@/constants/icon";
import { CustomSurvey } from "@/constants/image";
import { useBids } from "@/core/hooks/UseBids";
import { useProjects } from "@/core/hooks/useProjects";
import { useProperty } from "@/core/hooks/useProperty";
import { ProjectQueryParams } from "@/core/types/api";
import { useAuthStore } from "@/store/Authstore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Home = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const firstName = user?.firstName || "Builder";

  const { projectsMarketPlaceQuery } = useProjects();
  const [projectQueryParams] = useState<ProjectQueryParams>({
    page: 1,
    limit: 4,
    includeProgress: true,
  });

  const {
    data: projectsApiResponse,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = projectsMarketPlaceQuery(projectQueryParams);

  const projectsList: Project[] =
    projectsApiResponse?.data?.data?.projects ||
    projectsApiResponse?.data?.projects ||
    projectsApiResponse?.projects ||
    [];

  const { getAllBids } = useBids();
  const [bidsQueryParams] = useState<ProjectQueryParams>({
    page: 1,
    limit: 4,
    includeProgress: true,
  });

  const {
    data: bidsApiResponse,
    isLoading: isLoadingBids,
    error: bidsError,
  } = getAllBids(bidsQueryParams);

  const bidsList = bidsApiResponse?.data?.data?.bids ?? [];

  const { myProperty } = useProperty();

  const {
    data: apiResponse,
    isLoading: isLoadingProperties,
    error: propertiesError,
  } = myProperty();

  const propertyList = apiResponse?.data?.data?.properties || [];

  const handleNotification = () => router.push("/notification/notification");
  const handleCreateProperty = () =>
    router.replace("/(builders)/createproperty/createproperty");
  const handleAllProjects = () => router.push("/findprojects/findprojects");
  const handleAllBids = () => router.push("/mybids/bids");
  const handleAllProperties = () =>
    router.push("/(builders)/properties/properties");

  return (
    <View className="flex-1">
      <DashboardHeader
        userName={firstName}
        showDropdown={false}
        onNotificationPress={handleNotification}
        onProfilePress={() => router.push("/profilescreen")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Welcome Banner */}
        <View className="bg-dashboard mt-8 mx-2 rounded-xl pt-6 px-4 pb-4">
          <Text className="font-worksanssemibold text-white text-3xl">
            Welcome Back!
          </Text>
          <Text className="text-white font-work-sans">
            Let's start the day with you.
          </Text>

          <View className="flex-row items-center mt-4 gap-2">
            <View className="flex-1">
              <InfoCard
                icon={AddCircle}
                title="Find Projects"
                subtitle="Browse new projects"
                onPress={() => router.push("/findprojects/findprojects")}
              />
            </View>
            <View className="flex-1">
              <InfoCard
                icon={Code}
                title="My Bids"
                subtitle="Manage Bid works"
                onPress={() => router.push("/mybids/bids")}
              />
            </View>
          </View>

          <View className="flex-row items-center mt-4 gap-2">
            <View className="flex-1">
              <InfoCard
                icon={Dollar}
                title="Escrow"
                subtitle="Track your income"
                onPress={() => router.push("/(builders)/escrow/escrowaccount")}
              />
            </View>
            <View className="flex-1">
              <InfoCard
                icon={Code}
                title="Mortgage"
                subtitle="View Mortgages"
                onPress={() =>
                  router.push("/(builders)/viewmortgage/mortgages")
                }
              />
            </View>
          </View>
        </View>

        {/* Available Projects */}
        <View className="mt-8 rounded-xl px-2">
          <View className="flex-row justify-between items-center mb-4 mx-4">
            <Text className="font-interbold text-xl text-gray-900">
              Available Projects
            </Text>
            {projectsList.length > 2 && (
              <TouchableOpacity onPress={handleAllProjects}>
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
              <Image
                source={CustomSurvey}
                resizeMode="contain"
                style={{ width: 90, height: 90 }}
              />
              <Text className="font-worksanssemibold text-2xl mt-4">Oops!</Text>
              <Text className="font-work-sans text-base text-gray-500 text-center mt-2 px-4">
                No projects available yet
              </Text>
            </View>
          ) : (
            projectsList.slice(0, 2).map((project) => (
              <View key={project.id} className="mb-4">
                <ProjectsComponent
                  postedTime={`Posted ${project.postedTime || ""}`}
                  projectName={project.name}
                  location={project.location}
                  description={project.description}
                  budgetMin={project.budgetMin}
                  budgetMax={project.budgetMax}
                  currency={project.currency}
                  durationMin={project.durationMin}
                  durationMax={project.durationMax}
                  bids={project.bidsCount}
                  status={project.status}
                  onPress={() =>
                    router.push({
                      pathname: "/projectdetails/projectdetails",
                      params: { projectId: project.id },
                    })
                  }
                />
              </View>
            ))
          )}
        </View>

        <View className="mt-8 rounded-xl px-2">
          <View className="flex-row justify-between items-center mb-4 mx-4">
            <Text className="font-interbold text-xl text-gray-900">
              My Bids
            </Text>
            {bidsList.length > 2 && (
              <TouchableOpacity onPress={handleAllBids}>
                <Text className="font-inter text-blue-500">View all</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoadingBids ? (
            <View className="justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
            </View>
          ) : bidsError || bidsList.length === 0 ? (
            <View className="items-center py-8">
              <Image
                source={CustomSurvey}
                resizeMode="contain"
                style={{ width: 90, height: 90 }}
              />
              <Text className="font-worksanssemibold text-2xl mt-4">Oops!</Text>
              <Text className="font-work-sans text-base text-gray-500 text-center mt-2 px-4">
                You have not placed any bids yet
              </Text>
            </View>
          ) : (
            bidsList.slice(0, 2).map((bid) => (
              <View key={bid.id} className="mb-4 px-4 py-2">
                <BidsCard
                  currency={bid.project?.currency}
                  projectName={bid.project?.name}
                  projectId={bid.project?.id}
                  amount={bid.bidAmount}
                  bidStatus={bid.status}
                  contractId={bid.contractId}
                  bidId={bid.id}
                />
              </View>
            ))
          )}
        </View>

        <View className="mt-8 rounded-xl px-2">
          <View className="flex-row justify-between items-center mb-4 mx-4">
            <Text className="font-interbold text-xl text-gray-900">
              My Properties
            </Text>
            {propertyList.length > 2 && (
              <TouchableOpacity onPress={handleAllProperties}>
                <Text className="font-inter text-blue-500">View all</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoadingProperties ? (
            <View className="justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
            </View>
          ) : propertiesError || propertyList.length === 0 ? (
            <View className="items-center py-8">
              <Image
                source={CustomSurvey}
                resizeMode="contain"
                style={{ width: 90, height: 90 }}
              />
              <Text className="font-worksanssemibold text-2xl mt-4">Oops!</Text>
              <Text className="font-work-sans text-base text-gray-500 text-center mt-2 px-4">
                You have not created any properties yet
              </Text>
            </View>
          ) : (
            propertyList.slice(0, 2).map((property) => (
              <View key={property.id} className="mb-4">
                <PropertiesComponent
                  image={{ uri: property.media?.[0]?.publicUrl }}
                  title={property.title}
                  status={property.status}
                  address={property.location}
                  price={property.price}
                  onView={() =>
                    router.push({
                      pathname: "/properties/propertiesdetails",
                      params: { id: property.id },
                    })
                  }
                  onEdit={() =>
                    router.push({
                      pathname: "/createproperty/updateproperty",
                      params: { id: property.id },
                    })
                  }
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handleCreateProperty}
        activeOpacity={0.9}
        className="absolute bottom-6 right-6 bg-blue-600 rounded-full flex-row items-center px-6 py-4 shadow-lg"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text className="text-white text-2xl font-bold mr-2">+</Text>
        <Text className="text-white font-inter text-base font-medium">
          Create Property
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;
