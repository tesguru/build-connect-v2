import { ENDPOINTS } from "@/constants/endpoints";
import axiosInstance from "../axios";

export const BidService = {
  getBids: (params: any): Promise<any> => 
    axiosInstance.get(`${ENDPOINTS}/`, { params }),
  submitBid: (data: any) => axiosInstance.post(ENDPOINTS.BID.BIDS, data),
  getContractors: () => axiosInstance.get(ENDPOINTS.CONTRACTORS.GET_CONTRACTOR),
  singleContractor: (contractorId:any) => axiosInstance.get(`${ENDPOINTS.CONTRACTORS.GET_CONTRACTOR}${contractorId}/profile`),
  clientBids: (projectId:string, params:any) =>   axiosInstance.get(`${ENDPOINTS.BID.BIDS}project/${projectId}`, { params }),
};