import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { ProjectService } from "../services/projects/ProjectService";
import { handleApiError } from "../utils/handleapierror";
export type { Project, ProjectsResponse } from "../services/projects/projectTypes";
export const useProjects = () => {
  const [submitBidSuccess, setSubmitBidSuccess] = useState(false);
  const queryClient = useQueryClient();

  const getAllProjectsQuery = (params: object) => {
    return useQuery({
      queryKey: ['getAllProjects', params],
      queryFn: () => ProjectService.getProjects(params),
    });
  };

  const getSingleProjectQuery = (id: any) => {
    return useQuery({
      queryKey: ['getSingleProject', id],
      queryFn: () => ProjectService.getSingleProject(id),
    });
  };

  const getProjectMilestonesQuery = (id: any, params: any) => {
    return useQuery({
      queryKey: ['getMilestoneQuery', id],
      queryFn: () => ProjectService.projectMilestone(id, params),
    });
  };

  const createProjectMutation = useMutation({
    mutationFn: ProjectService.createProject,
    onSuccess: (res: any) => {
      const responseData = res?.data;
      if (
        (responseData.statusCode === 200 || responseData.statusCode === 201) &&
        responseData.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Project Created",
          text2: "Your project has been created successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['getAllProjects'] });
        setSubmitBidSuccess(true);
      }
    },
    onError: (error: any) => {
      handleApiError(error, "Error creating project");
    },
  });

  const updateMileStoneMutation = useMutation({
    mutationFn: ProjectService.updateMilestone,
    onSuccess: (res: any) => {
      const responseData = res?.data;
      if (
        (responseData.statusCode === 200 || responseData.statusCode === 201) &&
        responseData.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Milestone Updated",
          text2: "Your milestone has been updated successfully",
        });

        queryClient.invalidateQueries({ queryKey: ['getMilestoneQuery'] });
        queryClient.invalidateQueries({ queryKey: ['getSingleProject'] });
        queryClient.invalidateQueries({ queryKey: ['singleMilestonequery'] });
        
      }
    },
    onError: (error: any) => {
      handleApiError(error, "Error updating milestone");
    },
  });

  const projectsMarketPlaceQuery = (params: object) => {
    return useQuery({
      queryKey: ['getProjectQueryMarketplace', params],
      queryFn: () => ProjectService.getProjectsMarketPlace(params),
    });
  };

  const singleProjectMarketPlaceQuery = (id: any) => {
    return useQuery({
      queryKey: ['getProjectSingleQueryMarketplace', id],
      queryFn: () => ProjectService.getSingleProjectsMarketPlace(id),
    });
  };

  const singleMilestoneDetailsQuery = (projectId: any, milestoneId: any) => {
    return useQuery({
      queryKey: ['singleMilestonequery', projectId, milestoneId],
      queryFn: () => ProjectService.projectMilestoneDetails(projectId, milestoneId),
    });
  };

  const submitBidMutation = createProjectMutation;

  return {
    submitBidMutation,
    submitBidSuccess,
    getAllProjectsQuery,
    projectsMarketPlaceQuery,
    singleProjectMarketPlaceQuery,
    getSingleProjectQuery,
    getProjectMilestonesQuery,
    singleMilestoneDetailsQuery,
    updateMileStoneMutation,
  };
};