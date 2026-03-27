
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

export const escrowService = {
paymentInstructions: (data :any) => axiosInstance.post(`${ENDPOINTS.ESCROW.ESCROW}payment-instructions`,  data),
getPaymentInstructions: (params :any) => axiosInstance.get(`${ENDPOINTS.ESCROW.ESCROW}payment-instructions`,  { params }),
createwalletFunding: (data :any) => axiosInstance.post(`${ENDPOINTS.ESCROW.ESCROW}wallet-fundings`,   data ),
walletFunding: (params :any) => axiosInstance.get(`${ENDPOINTS.ESCROW.ESCROW}wallet-fundings`,  { params }),
createPayoutAccount: (data :any) => axiosInstance.post(`${ENDPOINTS.ESCROW.ESCROW}builder/payout-account`,  data ),
getPayoutAccount: () => axiosInstance.get(`${ENDPOINTS.ESCROW.ESCROW}builder/payout-account`),
createEscrowAccount: (data :any) => axiosInstance.post(`${ENDPOINTS.ESCROW.ESCROW}account`,  data ),
getEscrowAccount: () => axiosInstance.get(`${ENDPOINTS.ESCROW.ESCROW}account`),
getSinglePaymentInstructions: (instructionId :any) => axiosInstance.get(`${ENDPOINTS.ESCROW.ESCROW}payment-instructions/${instructionId}`),
getSingleWalletFunding: (fundingId :any) => axiosInstance.get(`${ENDPOINTS.ESCROW.ESCROW}wallet-fundings/${fundingId}`),
};