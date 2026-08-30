import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { BidService } from "../services/bids/BidService";
import { handleApiError } from "../utils/handleapierror";

function isOk(response: any) {
  const data = response?.data;
  return (
    (data?.statusCode === 200 || data?.statusCode === 201) &&
    data?.success === true
  );
}

export function useBids() {
  const queryClient = useQueryClient();
  const [submitBidSuccess, setSubmitBidSuccess] = useState(false);
  const [inviteBidsuccess, setInviteBidsuccess] = useState(false);
  const [respondBidSucess, setRespondBidSucess] = useState(false);
  const [respondToInvitationSuccess, setRespondToInvitationSuccess] =
    useState(false);
  const [contractSuccess, setContractSuccess] = useState(false);
  const [contractData, setContractData] = useState<any>(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);
  const [revisionSuccess, setRevisionSuccess] = useState(false);

  const submitBidMutation = useMutation({
    mutationFn: BidService.submitBid,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      queryClient.invalidateQueries({ queryKey: ["getAllBids"] });
      setSubmitBidSuccess(true);
    },
    onError: (err: any) => handleApiError(err),
  });

  const inviteBidMutation = useMutation({
    mutationFn: BidService.inviteToBids,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      queryClient.invalidateQueries({ queryKey: ["contractByBidQuery"] });
      queryClient.invalidateQueries({ queryKey: ["myInvitations"] });
      setInviteBidsuccess(true);
    },
    onError: (err: any) => handleApiError(err),
  });

  const respondToBidMutation = useMutation({
    mutationFn: BidService.bidRespond,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      queryClient.invalidateQueries({ queryKey: ["getAllBids"] });
      queryClient.invalidateQueries({ queryKey: ["getClientsBids"] });
      queryClient.invalidateQueries({ queryKey: ["getSingleProject"] });
      queryClient.invalidateQueries({ queryKey: ["singleBidQuery"] });
      queryClient.invalidateQueries({ queryKey: ["getAllProjects"] });
      setRespondBidSucess(true);
    },
    onError: (err: any) => handleApiError(err),
  });

  const respondToBidInvitationMutation = useMutation({
    mutationFn: BidService.respondToBidInvitations,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      queryClient.invalidateQueries({ queryKey: ["getAllBids"] });
      queryClient.invalidateQueries({ queryKey: ["getClientsBids"] });
      queryClient.invalidateQueries({ queryKey: ["getSingleProject"] });
      queryClient.invalidateQueries({ queryKey: ["singleBidQuery"] });
      queryClient.invalidateQueries({ queryKey: ["getAllProjects"] });
      setRespondToInvitationSuccess(true);
    },
    onError: (err: any) => handleApiError(err),
  });

  const createContractMutation = useMutation({
    mutationFn: BidService.generateContract,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      Toast.show({
        type: "success",
        text1: "Contract Created",
        text2: "Contract created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["getAllBids"] });
      queryClient.invalidateQueries({ queryKey: ["getClientsBids"] });
      queryClient.invalidateQueries({ queryKey: ["getSingleProject"] });
      queryClient.invalidateQueries({ queryKey: ["singleBidQuery"] });
      queryClient.invalidateQueries({ queryKey: ["getAllProjects"] });
      setContractData(response?.data?.data ?? true);
      setContractSuccess(true);
    },
    onError: (err: any) => handleApiError(err),
  });

  const bidRevisionMutation = useMutation({
    mutationFn: BidService.bidRevisionRequest,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      queryClient.invalidateQueries({ queryKey: ["getAllBids"] });
      queryClient.invalidateQueries({ queryKey: ["getClientsBids"] });
      queryClient.invalidateQueries({ queryKey: ["getSingleProject"] });
      queryClient.invalidateQueries({ queryKey: ["singleBidQuery"] });
      queryClient.invalidateQueries({ queryKey: ["getAllProjects"] });
      setRevisionSuccess(true);
    },
    onError: (err: any) => handleApiError(err),
  });

  const builderBidRevisionMutation = useMutation({
    mutationFn: BidService.builderBidRevisionRequest,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      queryClient.invalidateQueries({ queryKey: ["getAllBids"] });
      queryClient.invalidateQueries({ queryKey: ["getClientsBids"] });
      queryClient.invalidateQueries({ queryKey: ["getSingleProject"] });
      queryClient.invalidateQueries({ queryKey: ["singleBidQuery"] });
      queryClient.invalidateQueries({ queryKey: ["getAllProjects"] });
      setRevisionSuccess(true);
    },
    onError: (err: any) => handleApiError(err),
  });

  const sendContractMutation = useMutation({
    mutationFn: BidService.sendContract,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      queryClient.invalidateQueries({ queryKey: ["contractByBidQuery"] });
      queryClient.invalidateQueries({ queryKey: ["singleContract"] });
      queryClient.invalidateQueries({ queryKey: ["getSingleProject"] });
      setSendSuccess(true);
    },
    onError: (err: any) => handleApiError(err),
  });

  const signContractMutation = useMutation({
    mutationFn: BidService.signContract,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      setSignSuccess(true);
    },
    onError: (err: any) => handleApiError(err),
  });

  const downloadContractMutation = useMutation({
    mutationFn: BidService.downloadContract,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      Toast.show({
        type: "success",
        text1: "Download",
        text2: "Contract downloaded successfully.",
      });
    },
    onError: (err: any) => handleApiError(err),
  });

  const getContractorsQuery = (projectId: string, params: any) =>
    useQuery({
      queryKey: ["getContractors", projectId, params],
      queryFn: () => BidService.getContractors(projectId, params),
    });

  const getClientsBidsQuery = (projectId: string, params: any) =>
    useQuery({
      queryKey: ["getClientsBids", projectId, params],
      queryFn: () => BidService.clientBids(projectId, params),
    });

  const singleContractorQuery = (contractorId: string) =>
    useQuery({
      queryKey: ["singleContractor", contractorId],
      queryFn: () => BidService.singleContractor(contractorId),
    });

  const singleBidQuery = (bidId: string) =>
    useQuery({
      queryKey: ["singleBidQuery", bidId],
      queryFn: () => BidService.getBidsDetails(bidId),
    });

  const getAllBids = (params: any) =>
    useQuery({
      queryKey: ["getAllBids", params],
      queryFn: () => BidService.myBids(params),
    });

  const singleContractQuery = (contractId: string) =>
    useQuery({
      queryKey: ["singleContract", contractId],
      queryFn: () => BidService.getContract(contractId),
    });

  const myInvitations = (params: any) =>
    useQuery({
      queryKey: ["myInvitations", params],
      queryFn: () => BidService.myInvitations(params),
    });

  const clientInvitations = (params: any) =>
    useQuery({
      queryKey: ["clientInvitations", params],
      queryFn: () => BidService.clientInvitations(params),
    });

  const getContractByBidQuery = (bidId: string) =>
    useQuery({
      queryKey: ["contractByBidQuery", bidId],
      queryFn: () => BidService.getContractByBidId(bidId),
    });

  const bidRevisionSummary = (bidId: string) =>
    useQuery({
      queryKey: ["BidRevisionSummary", bidId],
      queryFn: () => BidService.bidRevisionSummary(bidId),
    });

  return {
    submitBidMutation,
    submitBidSuccess,
    getContractorsQuery,
    getClientsBidsQuery,
    singleContractorQuery,
    inviteBidMutation,
    inviteBidsuccess,
    singleBidQuery,
    respondToBidMutation,
    respondBidSucess,
    createContractMutation,
    contractSuccess,
    contractData,
    revisionSuccess,
    bidRevisionMutation,
    sendContractMutation,
    downloadContractMutation,
    signContractMutation,
    getAllBids,
    singleContractQuery,
    myInvitations,
    clientInvitations,
    getContractByBidQuery,
    bidRevisionSummary,
    respondToBidInvitationMutation,
    builderBidRevisionMutation,
    sendSuccess,
    signSuccess,
  };
}
