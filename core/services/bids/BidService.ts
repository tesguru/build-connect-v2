import { ENDPOINTS } from "@/constants/endpoints";
import axiosInstance from "../axios";

export const BidService = {
  getBids: (params: any): Promise<any> => 
    axiosInstance.get(`${ENDPOINTS}/`, { params }),
   getBidsDetails: (bidId: any): Promise<any> => 
    axiosInstance.get(`${ENDPOINTS.BID.BIDS}${bidId}`),
  submitBid: (data: any) => axiosInstance.post(ENDPOINTS.BID.BIDS, data),
  generateContract: (data: any) => axiosInstance.post(ENDPOINTS.CONTRACT.CONTRACT, data),
  sendContract: (contractorId: any) => axiosInstance.post(`${ENDPOINTS.CONTRACT.CONTRACT}${contractorId}/send`),
  downloadContract: (contractorId: any) => axiosInstance.post(`${ENDPOINTS.CONTRACT.CONTRACT}${contractorId}/download`),
  bidRespond: (data: any) =>  axiosInstance.patch(`${ENDPOINTS.BID.BIDS}${data.bidId}/status`, data),
  bidRevisionRequest: (data: any) =>  axiosInstance.post(`${ENDPOINTS.BID.BIDS}${data.bidId}/revisions/request`, data),
  inviteToBids: (data: any) => axiosInstance.post(`${ENDPOINTS.BID.BIDS}invite`, data),
  getContractors: () => axiosInstance.get(ENDPOINTS.CONTRACTORS.GET_CONTRACTOR),
  singleContractor: (contractorId:any) => axiosInstance.get(`${ENDPOINTS.CONTRACTORS.GET_CONTRACTOR}${contractorId}/profile`),
  clientBids: (projectId:string, params:any) =>   axiosInstance.get(`${ENDPOINTS.BID.BIDS}project/${projectId}`, { params }),
};