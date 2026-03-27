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
  downloadContract: (contractorId: any) => axiosInstance.get(`${ENDPOINTS.CONTRACT.CONTRACT}${contractorId}/download`),
  getContract: (contractorId: any) => axiosInstance.get(`${ENDPOINTS.CONTRACT.CONTRACT}${contractorId}`),
  getContractByBidId: (bidId: any) => axiosInstance.get(`${ENDPOINTS.CONTRACT.CONTRACT}bid/${bidId}`),
  signContract: (contractorId: any) => axiosInstance.post(`${ENDPOINTS.CONTRACT.CONTRACT}${contractorId}/sign`),
  bidRespond: (data: any) =>  axiosInstance.patch(`${ENDPOINTS.BID.BIDS}${data.bidId}/status`, data),
  bidRevisionRequest: (data: any) =>  axiosInstance.post(`${ENDPOINTS.BID.BIDS}${data.bidId}/revisions/request`, data),
  inviteToBids: (data: any) => axiosInstance.post(`${ENDPOINTS.BID.BIDS}invite`, data),
  myInvitations: (data: any) => axiosInstance.get(`${ENDPOINTS.BID.BIDS}my-invitations`, data),
  getInvitations: (data: any) => axiosInstance.get(`${ENDPOINTS.BID.BIDS}my-invitations`, data),
  clientInvitations: (params: any) => axiosInstance.get(`${ENDPOINTS.BID.BIDS}invitations`, {params}),
  respondToBidInvitations: (data: any) => axiosInstance.patch(`${ENDPOINTS.BID.BIDS}invitations/${data.id}/respond`, data),
  myBids: (params: any) => axiosInstance.get(`${ENDPOINTS.BID.BIDS}my-bids`, { params }),
  getContractors: () => axiosInstance.get(ENDPOINTS.CONTRACTORS.GET_CONTRACTOR),
  singleContractor: (contractorId:any) => axiosInstance.get(`${ENDPOINTS.CONTRACTORS.GET_CONTRACTOR}${contractorId}/profile`),
  bidRevisionSummary: (bidId: any) =>  axiosInstance.get(`${ENDPOINTS.BID.BIDS}${bidId}/revisions/request`),
  clientBids: (projectId:string, params:any) =>   axiosInstance.get(`${ENDPOINTS.BID.BIDS}project/${projectId}`, { params }),
};