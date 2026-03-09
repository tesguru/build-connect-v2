import { BidsCard } from '@/components/Cards/BidsCard';
import InfoCard from '@/components/Cards/InfoCard';
import ProjectsComponent from '@/components/Cards/ProjectsComponent';
import MyProperties from '@/components/PagesComponent/Dashboard/Builders/HomeComponents/Properties';
import DashboardHeader from '@/components/PagesComponent/Dashboard/Shared/DashboardHeader';
import { AddCircle, Code, Dollar } from '@/constants/icon';
import { bidImage, CustomSurvey } from '@/constants/image';
import { useBids } from '@/core/hooks/UseBids';
import { Project, useProjects } from '@/core/hooks/useProjects';
import { ProjectQueryParams } from '@/core/types/api';
import { formatTimeAgo } from '@/core/utils/data';
import { useAuthStore } from '@/store/Authstore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const Home = () => {
  const router = useRouter();
  const { clearAuthData, user } = useAuthStore();
  const firstName = user?.firstName || "Builder";

  // ── Projects query ──────────────────────────────────────
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

  // ── Bids query ──────────────────────────────────────────
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

  // ── Handlers ────────────────────────────────────────────
  const handleNotification = () => router.push("/notification/notification");
  const handleNavigation = () => router.replace("/builders/createproperty/createproperty");
  const handleAllProjects = () => router.push("/findprojects/findprojects");
  const handleAllBids = () => router.push("/mybids/mybids");

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
        contentContainerStyle={{ paddingBottom: 40 }}
      >
     

        {/* ── Welcome Banner ───────────────────────────────── */}
        <View className="bg-dashboard mt-8 mx-2 rounded-xl pt-6 px-4 pb-4">
          <Text className="font-worksanssemibold text-white text-3xl">Welcome Back!</Text>
          <Text className="text-white font-work-sans">Let's start the day with you.</Text>

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
                onPress={() => router.push("/mybids/mybids")}
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
                title="Portfolio"
                subtitle="Showcase your work"
                onPress={() => {}}
              />
            </View>
          </View>
        </View>

        {/* ── Available Projects ───────────────────────────── */}
        <View className="mt-8 rounded-xl px-2">
          <View className="flex-row justify-between items-center mb-4 mx-4">
            <Text className="font-interbold text-xl text-gray-900">Available Projects</Text>
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
              <Image source={CustomSurvey} resizeMode="contain" style={{ width: 90, height: 90 }} />
              <Text className="font-worksanssemibold text-2xl mt-4">Oops!</Text>
              <Text className="font-work-sans text-base text-gray-500 text-center mt-2 px-4">
                No projects available yet
              </Text>
            </View>
          ) : (
            projectsList.slice(0, 2).map((project) => (
              <View key={project.id} className="mb-4">
                <ProjectsComponent
                  postedTime={`Posted ${formatTimeAgo(project.createdAt)}`}
                  projectName={project.title}
                  location={project.location}
                  description={project.description}
                  budget={project.budgetRange?.label || 'Budget not specified'}
                  duration={project.timeline?.label || 'Duration not specified'}
                  bids={String(project.bidCount || 0)}
                  status={project.status}
                  onPress={() =>
                    router.push({
                      pathname: '/projectdetails/projectdetails',
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
            <Text className="font-interbold text-xl text-gray-900">My Bids</Text>
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
              <Image source={CustomSurvey} resizeMode="contain" style={{ width: 90, height: 90 }} />
              <Text className="font-worksanssemibold text-2xl mt-4">Oops!</Text>
              <Text className="font-work-sans text-base text-gray-500 text-center mt-2 px-4">
                You have not placed any bids yet
              </Text>
            </View>
          ) : (
            bidsList.slice(0, 2).map((bid) => (
              <View key={bid.id} className="mb-4 px-4 py-2">
                <BidsCard
                  image={bidImage}
                  projectName={bid?.project?.title}
                  projectId={bid.id}
                  amount={bid.bidAmount}
                  bidStatus={bid.status}
                  contractId={bid.contractId}
                  bidId={bid.id}
                />
              </View>
            ))
          )}
        </View>

     
        <View className="pt-2">
          <MyProperties />
        </View>

      
        <View className="flex-row justify-end mr-3 mt-4">
          <TouchableOpacity
            onPress={handleNavigation}
            className="bg-blue-600 w-40 flex-row items-center px-6 py-3 rounded-full"
          >
            <Text className="text-white text-2xl">+</Text>
            <Text className="text-white font-work-sans text-base ml-2">Add Property</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;