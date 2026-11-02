
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
  milestones: {
    name: string;
    description?: string;
    completionDate: string;
    amount: number;
  }[];
  mediaFileIds: string[];
  fileIds: string[];
  metadata: Record<string, any>;
}

export const ProjectService = {
  getEscrow: (params: any) => axiosInstance.get(`${ENDPOINTS.ESCROW.ESCROW}`, { params }),
  createProject: (data: CreateProjectPayload) =>
    axiosInstance.post(ENDPOINTS.PROJECTS.CREATE_PROJECT, data),
  getProjectsMarketPlace: (params: any): Promise<any> =>
    axiosInstance.get(`${ENDPOINTS.PROJECTS.MARKETPLACE}/`, { params }),
};