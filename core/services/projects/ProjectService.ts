import { ENDPOINTS } from "@/constants/endpoints";
import axiosInstance from "../axios";

export interface CreateProjectPayload {
  name: string;
  description: string;
  location: string;
  budgetMinimum: number;
  budgetMaximum: number;
  currency: string;
  durationMinimum: number;
  durationMaximum: number;
  isApprovedBuildingDrawings: boolean;
  /** Confirmed upload IDs from prepare-upload → confirm-upload. */
  fileIds: string[];
  metadata?: Record<string, any>;
}

export const ProjectService = {
  getProjects: (params: any) =>
    axiosInstance.get(`${ENDPOINTS.PROJECTS.GET_PROJECTS}`, { params }),
  createProject: (data: CreateProjectPayload) =>
    axiosInstance.post(ENDPOINTS.PROJECTS.CREATE_PROJECT, data),
  getProjectsMarketPlace: (params: any): Promise<any> =>
    axiosInstance.get(`${ENDPOINTS.PROJECTS.MARKETPLACE}/`, { params }),
  getSingleProjectsMarketPlace: (id: any): Promise<any> =>
    axiosInstance.get(`${ENDPOINTS.PROJECTS.MARKETPLACE}/${id}`),
  getSingleProject: (id: any): Promise<any> =>
    axiosInstance.get(`${ENDPOINTS.PROJECTS.PROJECTS}/${id}`),
  projectMilestone: (projectId: string, params: any) =>
    axiosInstance.get(
      `${ENDPOINTS.PROJECTS.GET_PROJECTS}${projectId}/milestones`,
      { params },
    ),
  projectMilestoneDetails: (projectId: string, milestoneId: any) =>
    axiosInstance.get(
      `${ENDPOINTS.PROJECTS.GET_PROJECTS}${projectId}/milestones/${milestoneId}`,
    ),
  updateMilestone: (data: any) =>
    axiosInstance.patch(
      `${ENDPOINTS.PROJECTS.GET_PROJECTS}${data.projectId}/milestones/${data.milestoneId}/status`,
      data,
    ),
  clientExpressionOfInterest: (projectId: string, params: any) =>
    axiosInstance.get(
      `${ENDPOINTS.PROJECTS.GET_PROJECTS}${projectId}/interests`,
      {
        params,
      },
    ),

  builderExpressionOfInterest: (params: any) =>
    axiosInstance.get(`${ENDPOINTS.PROJECTS.GET_PROJECTS}my-interests`, {
      params,
    }),

  expressInterest: (data: { projectId: string; [key: string]: any }) =>
    axiosInstance.post(
      `${ENDPOINTS.PROJECTS.GET_PROJECTS}${data.projectId}/interest`,
      data,
    ),

  ReviewExpressionOfInterest: (data: {
    projectId: string;
    interestId: string;
    [key: string]: any;
  }) =>
    axiosInstance.patch(
      `${ENDPOINTS.PROJECTS.GET_PROJECTS}${data.projectId}/interests/${data.interestId}/review`,
      data,
    ),

  createMessage: (data: { projectId: string; [key: string]: any }) =>
    axiosInstance.post(
      `${ENDPOINTS.PROJECTS.GET_PROJECTS}${data.projectId}/messages`,
      data,
    ),

  viewMessage: (projectId: string, params: any) =>
    axiosInstance.get(
      `${ENDPOINTS.PROJECTS.GET_PROJECTS}${projectId}/messages`,
      {
        params,
      },
    ),
};
