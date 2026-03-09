
import { useMutation, useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";


import { useState } from "react";
import { escrowService } from "../services/escrow/escrowservice";


export type { Project, ProjectsResponse } from "../services/projects/projectTypes";

export const useEscrow = () => {
  const [submitBidSuccess, setSubmitBidSuccess] = useState(false);

  
//QUERY
  const getWalletFunding = ( params: object) => {
  return useQuery({
    queryKey: ['getAllWalletFunding',  params], 
    queryFn: () => escrowService.walletFunding(params),
  });
};

  //MUTATIONS
  const createPaymentInstructionsMutation = useMutation({
    mutationFn: escrowService.paymentInstructions,
    onSuccess: (res: any) => {
      const responseData = res?.data;
      if (
        (responseData.statusCode === 200 || responseData.statusCode === 201) &&
        responseData.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Payment Instructions Created",
          text2: "Your Payment Instructions has been created successfully",
        });
        setSubmitBidSuccess(true);
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Payment Instructions Failed",
        text2: error?.response?.data?.message || error instanceof Error ? error.message : "Failed to create project",
      });
    },
  });

   const createWalletFunding = useMutation({
    mutationFn: escrowService.createwalletFunding,
    onSuccess: (res: any) => {
      const responseData = res?.data;
      if (
        (responseData.statusCode === 200 || responseData.statusCode === 201) &&
        responseData.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Wallet Funding Created",
          text2: "Wallet Funding has been created successfully",
        });
        setSubmitBidSuccess(true);
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Wallet Funding failed",
        text2: error?.response?.data?.message || error instanceof Error ? error.message : "Failed to create project",
      });
    },
  });
    const createEscrowAccount = useMutation({
    mutationFn: escrowService.createEscrowAccount,
    onSuccess: (res: any) => {
      const responseData = res?.data;
      if (
        (responseData.statusCode === 200 || responseData.statusCode === 201) &&
        responseData.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Escrow Account Created",
          text2: "Escrow Account has been created successfully",
        });
        setSubmitBidSuccess(true);
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Escrow Account failed",
        text2: error?.response?.data?.message || error instanceof Error ? error.message : "Failed to create project",
      });
    },
  });

    const createPayoutAccount = useMutation({
    mutationFn: escrowService.createPayoutAccount,
    onSuccess: (res: any) => {
      const responseData = res?.data;
      if (
        (responseData.statusCode === 200 || responseData.statusCode === 201) &&
        responseData.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Payout Account Created",
          text2: "Payout Account has been created successfully",
        });
        setSubmitBidSuccess(true);
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Escrow Account failed",
        text2: error?.response?.data?.message || error instanceof Error ? error.message : "Failed to create project",
      });
    },
  });

   const getEscrowAccount = () => {
      return useQuery({
        queryKey: ['getEscrowAccount', ],
        queryFn: () => escrowService.getEscrowAccount(),
      });
    };

  const getPaymentInstructions = (params :any) => {
      return useQuery({
        queryKey: ['getPaymentInstructions', ],
        queryFn: () => escrowService.getPaymentInstructions(params),
      });
  };

  const getPayoutAccount = () => {
      return useQuery({
        queryKey: ['getPayoutAccount', ],
        queryFn: () => escrowService.getPayoutAccount(),
      });
  };

  return {
  createPaymentInstructionsMutation,
  createWalletFunding,
  createEscrowAccount,
  getWalletFunding,
  getEscrowAccount,
  getPaymentInstructions,
  createPayoutAccount,
  getPayoutAccount
  };
};
