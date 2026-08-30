import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { escrowService } from "../services/escrow/escrowservice";
import { handleApiError } from "../utils/handleapierror";

function isOk(response: any) {
  const data = response?.data;
  return (
    (data?.statusCode === 200 || data?.statusCode === 201) &&
    data?.success === true
  );
}

export function useEscrow() {
  const [paymentInstructionSuccess, setPaymentInstructionSuccess] =
    useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const createPaymentInstructionsMutation = useMutation({
    mutationFn: escrowService.paymentInstructions,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      Toast.show({
        type: "success",
        text1: "Payment Instructions Created",
        text2: "Your Payment Instructions has been created successfully",
      });
      setPaymentInstructionSuccess(true);
    },
    onError: (err: any) =>
      handleApiError(err, "Failed to create payment instructions"),
  });

  const createWalletFunding = useMutation({
    mutationFn: escrowService.createwalletFunding,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      Toast.show({
        type: "success",
        text1: "Wallet Funding Created",
        text2: "Wallet Funding has been created successfully",
      });
      router.back();
    },
    onError: (err: any) =>
      handleApiError(err, "Failed to create wallet funding"),
  });

  const createEscrowAccount = useMutation({
    mutationFn: escrowService.createEscrowAccount,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      Toast.show({
        type: "success",
        text1: "Escrow Account Created",
        text2: "Escrow Account has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["getEscrowAccount"] });
      router.back();
    },
    onError: (err: any) =>
      handleApiError(err, "Failed to create escrow account"),
  });

  const createPayoutAccount = useMutation({
    mutationFn: escrowService.createPayoutAccount,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      Toast.show({
        type: "success",
        text1: "Payout Account Created",
        text2: "Payout Account has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["getPayoutAccount"] });
      router.back();
    },
    onError: (err: any) =>
      handleApiError(err, "Failed to create payout account"),
  });

  const getWalletFunding = (params: any) =>
    useQuery({
      queryKey: ["getAllWalletFunding", params],
      queryFn: () => escrowService.walletFunding(params),
    });

  const getEscrowAccount = () =>
    useQuery({
      queryKey: ["getEscrowAccount"],
      queryFn: () => escrowService.getEscrowAccount(),
    });

  const getPaymentInstructions = (params: any) =>
    useQuery({
      queryKey: ["getPaymentInstructions"],
      queryFn: () => escrowService.getPaymentInstructions(params),
    });

  const getPayoutAccount = () =>
    useQuery({
      queryKey: ["getPayoutAccount"],
      queryFn: () => escrowService.getPayoutAccount(),
    });

  const getSinglePaymentInstruction = (instructionId: string) =>
    useQuery({
      queryKey: ["getSinglePaymentInstructions", instructionId],
      queryFn: () => escrowService.getSinglePaymentInstructions(instructionId),
    });

  const getSingleWalletFunding = (fundingId: string) =>
    useQuery({
      queryKey: ["getSingleWalletFunding", fundingId],
      queryFn: () => escrowService.getSingleWalletFunding(fundingId),
    });

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
    getSingleWalletFunding,
  };
}
