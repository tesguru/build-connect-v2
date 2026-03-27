
import { useMutation, useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";


import { useState } from "react";
import { escrowService } from "../services/escrow/escrowservice";
import { handleApiError } from "../utils/handleapierror";


export type { Project, ProjectsResponse } from "../services/projects/projectTypes";

export const useEscrow = () => {
  const [submitBidSuccess, setSubmitBidSuccess] = useState(false);

  

  const getWalletFunding = ( params: object) => {
  return useQuery({
    queryKey: ['getAllWalletFunding',  params], 
    queryFn: () => escrowService.walletFunding(params),
  });
};


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
        handleApiError(error, "Failed to create payment instructions")
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
         handleApiError(error, "Failed to create wallet funding")
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
        handleApiError(error, "Failed to create escrow account")
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
        handleApiError(error, "Failed to create payout account")
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


  const getSinglePaymentInstruction = (id :any) => {
      return useQuery({
        queryKey: ['getSinglePaymentInstructions', id], 
        queryFn: () => escrowService.getSinglePaymentInstructions(id),
      });
    };

    const getSingleWalletFunding = (id :any) => {
      return useQuery({
        queryKey: ['getSinglePaymentInstructions', id], 
        queryFn: () => escrowService.getSingleWalletFunding(id),
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
  getPayoutAccount,
  getSinglePaymentInstruction,
  getSingleWalletFunding
  };
};
