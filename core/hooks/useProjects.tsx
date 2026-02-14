
import { useMutation, useQuery } from "@tanstack/react-query";
import { ProjectService } from "../services/projects/ProjectService";
import Toast from "react-native-toast-message";


import { useState } from "react";


export type { Project, ProjectsResponse } from "../services/projects/projectTypes";

export const useProjects = () => {
  const [submitBidSuccess, setSubmitBidSuccess] = useState(false);

  

  const getAllProjectsQuery = ( params: object) => {
  return useQuery({
    queryKey: ['getAllProjects',  params], 
    queryFn: () => ProjectService.getProjects(params),
  });
};

 const getSingleProjectQuery = (id :any) => {
    return useQuery({
      queryKey: ['getSingleProject', id], 
      queryFn: () => ProjectService.getSingleProject(id),
    });
  };

   const getProjectMilestonesQuery = (id :any, params:any) => {
      return useQuery({
        queryKey: ['getClientsBids', id], 
        queryFn: () => ProjectService.projectMilestone(id, params),
      });
    };

  //MUTATIONS
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
        setSubmitBidSuccess(true);
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Create Project Failed",
        text2: error?.response?.data?.message || error instanceof Error ? error.message : "Failed to create project",
      });
    },
  });


  const projectsMarketPlaceQuery = ( params: object) => {
  return useQuery({
    queryKey: ['getProjectQueryMarketplace',  params], 
    queryFn: () => ProjectService.getProjectsMarketPlace(params),
  });
};


 const singleProjectMarketPlaceQuery = (id :any) => {
    return useQuery({
      queryKey: ['getProjectSingleQueryMarketplace', id], 
      queryFn: () => ProjectService.getSingleProjectsMarketPlace(id),
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
   getProjectMilestonesQuery
  };
};
