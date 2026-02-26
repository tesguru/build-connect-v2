
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

export const meetingService = {
  getMeeting: (params :any) => axiosInstance.get(`${ENDPOINTS.MEETINGS.MEETINGS}`,  { params }),
  getMeetingDetails: (data: CreateProjectPayload) => 
    axiosInstance.post(ENDPOINTS.MEETINGS.MEETINGS, data),
  createMeeting: (data: any) =>  axiosInstance.post(`${ENDPOINTS.MEETINGS.MEETINGS}schedule`, data),
};

