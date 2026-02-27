
import { ENDPOINTS } from "@/constants/endpoints";
import axiosInstance from "../axios";

export interface CreateProjectPayload {
  title: string;
  description: string;
  location: string;
  projectTypeId: string;
  budget: string;
  timelineId?: string;
  startDate: string;
  endDate: string;
  milestones: Array<{
    name: string;
    description?: string;
    completionDate: string;
    amount: number;
  }>;
  mediaFileIds: string[];
  fileIds: string[];
  metadata: Record<string, any>;
}

export const ProjectService = {
  getProjects: (params :any) => axiosInstance.get(`${ENDPOINTS.PROJECTS.GET_PROJECTS}`,  { params }),
  createProject: (data: CreateProjectPayload) => 
    axiosInstance.post(ENDPOINTS.PROJECTS.CREATE_PROJECT, data),
    getProjectsMarketPlace: (params: any): Promise<any> => 
    axiosInstance.get(`${ENDPOINTS.PROJECTS.MARKETPLACE}/`, { params }),
getSingleProjectsMarketPlace: (id: any): Promise<any> => 
    axiosInstance.get(`${ENDPOINTS.PROJECTS.MARKETPLACE}/${id}`),
getSingleProject: (id: any): Promise<any> => 
    axiosInstance.get(`${ENDPOINTS.PROJECTS.PROJECTS}/${id}`),
  projectMilestone: (projectId:string, params:any) => axiosInstance.get(`${ENDPOINTS.PROJECTS.GET_PROJECTS}${projectId}/milestones`,  { params }),
    projectMilestoneDetails: (projectId:string, milestoneId:any) => axiosInstance.get(`${ENDPOINTS.PROJECTS.GET_PROJECTS}${projectId}/milestones/${milestoneId}`),
};

