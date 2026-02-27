
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

export const SupportService = {
createTicket: (data :any) => axiosInstance.post(`${ENDPOINTS.SUPPORT.TICKETS}`, data),
viewTicket: (params: any) => 
axiosInstance.get(ENDPOINTS.SUPPORT.TICKETS, { params}),
viewTicketDetails: (ticketId :any) => 
axiosInstance.get(`${ENDPOINTS.SUPPORT.TICKETS}/${ticketId}`),
  
}

