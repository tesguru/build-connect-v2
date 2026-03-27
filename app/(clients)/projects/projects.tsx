import ProjectsWithMilestone from '@/components/Cards/ProjectsWithMileStone'
import AppLayout from '@/components/Layouts/AppLayout'
import EmptyScreenComponent from '@/components/Miscallaneous/EmptyScreenComponent'
import { useProjects } from '@/core/hooks/useProjects'
import { Project, ProjectQueryParams } from '@/core/types/api'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const ClientProjectsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [queryParams, setQueryParams] = useState<ProjectQueryParams>({
    page: 1,
    limit: 100,
    includeProgress: true
  });

  const { getAllProjectsQuery } = useProjects();
  const router = useRouter(); 

  const {
    data: apiResponse,
    isLoading: isLoadingProjects,
    error: projectsError
  } = getAllProjectsQuery(queryParams);

  const projectsList: Project[] = apiResponse?.data?.data?.projects ||
    apiResponse?.data?.projects ||
    apiResponse?.projects ||
    [];

  const statusFilters = useMemo(() => {
    const counts: Record<string, number> = {
      draft: 0,
      posted: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const p of projectsList) {
     
      const val = p.statusDetails?.value;
      if (val && counts[val] !== undefined) {
        counts[val]++;
      }
    }
    const allCount = projectsList.length;
    return [
      { id: 'all',         label: 'All Projects', count: allCount          },
      { id: 'draft',       label: 'Draft',        count: counts.draft       },
      { id: 'posted',      label: 'Posted',       count: counts.posted      },
      { id: 'in_progress', label: 'In Progress',  count: counts.in_progress },
      { id: 'completed',   label: 'Completed',    count: counts.completed   },
      { id: 'cancelled',   label: 'Cancelled',    count: counts.cancelled   },
    ];
  }, [projectsList]);

  const handleStatusFilter = (status: string) => {
    setSelectedFilter(status);

    const newParams: ProjectQueryParams = {
      ...queryParams,
      page: 1,
    };

    if (status === 'all') {
      delete newParams.status;
    } else {
      newParams.status = status;
    }

    setQueryParams(newParams);
  };

  const getFilteredProjects = () => {
    if (selectedFilter === 'all') {
      return projectsList;
    }
   
    return projectsList.filter(
      (project) => project.statusDetails?.value === selectedFilter
    );
  };

  const filteredProjects = getFilteredProjects();

  const formatStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'Draft',
      'posted': 'Posted',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'all': 'All'
    };

    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const handleAddProject = () => {
    router.push('/projects/addproject'); 
  };

  const handleProjectPress = (projectId: string, status: string) => {
   
    router.push({
      pathname: '/projects/clientprojectdetails',
      params: { projectId: projectId, status: status }
    })
  };

  return (
    <AppLayout screenName="Projects" fullHeightContent>
      <View className="flex-1">
        
        <View className="mt-8 flex-1">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 1, gap: 10, alignItems: 'center' }}
            style={{ maxHeight: 60 }}
          >
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                className={`px-5 py-3.5 rounded-full border min-w-[90px] items-center justify-center ${selectedFilter === filter.id
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-200'
                  }`}
                onPress={() => handleStatusFilter(filter.id)}
              >
                <Text
                  className={`text-md font-inter font-medium text-center ${selectedFilter === filter.id ? 'text-white' : 'text-gray-800'}`}
                >
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {isLoadingProjects ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
              <Text className="mt-4 text-gray-600">Loading projects...</Text>
            </View>
          ) : projectsError ? (
            <View className="flex-1 justify-center items-center p-4">
              <Text className="text-red-500 text-center mb-4">
                Error loading projects. Please try again.
              </Text>
              <TouchableOpacity
                className="bg-blue-600 px-6 py-3 rounded-lg"
                onPress={() => { /* Add retry logic here */ }}
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredProjects.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20 px-4">
              <EmptyScreenComponent
                title={selectedFilter !== 'all'
                  ? `No "${formatStatusLabel(selectedFilter)}" Projects`
                  : "No Projects Found"}
                description={selectedFilter !== 'all'
                  ? `You don't have any ${formatStatusLabel(selectedFilter).toLowerCase()} projects yet`
                  : "You haven't created any projects yet"}
                buttonText="Add Your First Project"
                onButtonPress={handleAddProject}
              />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="mt-4"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {filteredProjects.map((project) => (
                <View key={project.id} className="mb-4 px-4">
                  <ProjectsWithMilestone
                    postedTime="Posted 1 hour ago"
                    projectName={project.title}
                    progress={project?.progress?.progressPercentage || 0}
                    status={project.statusDetails?.value || "N/A"}
                    location={project.location}
                    description={project.description}
                    budget={project.budgetRange?.label || "N/A"}
                    duration={project.timeline?.label || "N/A"}
                    role="client"
                    bids={String(project.bidCount || 0)}
                    onPress={() => handleProjectPress(project.id, project.statusDetails?.value)}
                  />
                </View>
              ))}

              {apiResponse?.data?.data?.pagination && (
                <View className="py-6 items-center">
                  <Text className="text-gray-500 text-sm mb-2">
                    Showing {filteredProjects.length} of {apiResponse.data.data.pagination.total} projects
                  </Text>
                  {apiResponse.data.data.pagination.page < apiResponse.data.data.pagination.totalPages && (
                    <TouchableOpacity
                      className="bg-blue-600 px-6 py-3 rounded-lg"
                      onPress={() => {
                        setQueryParams(prev => ({
                          ...prev,
                          page: (prev.page || 1) + 1,
                        }));
                      }}
                    >
                      <Text className="text-white font-medium">Load More Projects</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity
          onPress={handleAddProject}
          activeOpacity={0.9}
          className="absolute right-5 bottom-6 bg-blue-600 flex-row items-center justify-center rounded-full px-5 py-4 shadow-lg"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <Text className="text-white font-work-sans text-base font-medium">
            + Create Project
          </Text>
        </TouchableOpacity>
      </View>
    </AppLayout>
  )
}

export default ClientProjectsScreen