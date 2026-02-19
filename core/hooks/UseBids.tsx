
import { useMutation, useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";


import { useState } from "react";
import { BidService } from "../services/bids/BidService";


export const useBids = () => {
  const [submitBidSuccess, setSubmitBidSuccess] = useState(false);
  const [inviteBidsuccess, setinviteBidsuccess] = useState(false);
  const [respondBidSucess, setrespondBidSucess] = useState(false);
  const [contractSuccess, setContractSuccess] = useState(false);
   const [contractData, setContractData] = useState(false);
    const [revisionSuccess, setBidRevisionSucess] = useState(false);
  const submitBidMutation = useMutation({
    mutationFn: BidService.submitBid,
    onSuccess: (res: any) => {
      const submitBidData = res?.data;
      if (
        (submitBidData.statusCode === 200 || submitBidData.statusCode === 201) &&
        submitBidData.success === true
      ) {
         setSubmitBidSuccess(true);
      }
    },
    onError: (error: any) => {
         const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create Bids.";
      Toast.show({
        type: "error",
        text1: "Submit Failed",
        text2: errorMessage
      });   
    },
  });

   const inviteBidMutation = useMutation({
    mutationFn: BidService.inviteToBids,
    onSuccess: (res: any) => {
      const inviteBidData = res?.data;
      if (
        (inviteBidData.statusCode === 200 || inviteBidData.statusCode === 201) &&
        inviteBidData.success === true
      ) {
         setinviteBidsuccess(true);
      }
    },
    onError: (error: any) => {
         const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create Bids.";
      Toast.show({
        type: "error",
        text1: "Submit Failed",
        text2: errorMessage
      });   
    },
  });


  const getContractorsQuery = () => {
  return useQuery({
    queryKey: ['getContractors'], 
    queryFn: () => BidService.getContractors(),
  });
};

 const getClientsBidsQuery = (id :any, params:any) => {
    return useQuery({
      queryKey: ['getClientsBids', id], 
      queryFn: () => BidService.clientBids(id, params),
    });
  };
   const singleContractorQuery = (id :any) => {
      return useQuery({
        queryKey: ['singleContractor', id], 
        queryFn: () => BidService.singleContractor(id),
      });
    };

     const singleBidQuery = (id :any) => {
      return useQuery({
        queryKey: ['singleBidQuery', id], 
        queryFn: () => BidService.getBidsDetails(id),
      });
    };

      const respondToBidMutation = useMutation({
    mutationFn: BidService.bidRespond,
    onSuccess: (res: any) => {
      const respondToBidData = res?.data;
      if (
        (respondToBidData.statusCode === 200 || respondToBidData.statusCode === 201) &&
        respondToBidData.success === true
      ) {
         setrespondBidSucess(true);
      }
    },
    onError: (error: any) => {
         const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create Bids.";
      Toast.show({
        type: "error",
        text1: "Submit Failed",
        text2: errorMessage
      });   
    },
  });

  const createContractMutation = useMutation({
    mutationFn: BidService.generateContract,
    onSuccess: (res: any) => {
      const createContractData = res?.data;
      if (
        (createContractData.statusCode === 200 || createContractData.statusCode === 201) &&
        createContractData.success === true
      ) {
         setContractSuccess(true);
         setContractData(createContractData )
      }
    },
    onError: (error: any) => {
         const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create Bids.";
      Toast.show({
        type: "error",
        text1: "Submit Failed",
        text2: errorMessage
      });   
    },
  });

    const bidRevisionMutation = useMutation({
    mutationFn: BidService.bidRevisionRequest,
    onSuccess: (res: any) => {
      const bidRevisionData = res?.data;
      if (
        (bidRevisionData.statusCode === 200 || bidRevisionData.statusCode === 201) &&
        bidRevisionData.success === true
      ) {
         setBidRevisionSucess(true);
       
      }
    },
    onError: (error: any) => {
         const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send Revision request.";
      Toast.show({
        type: "error",
        text1: "Submit Failed",
        text2: errorMessage
      });   
    },
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
   bidRevisionMutation
  };
};
