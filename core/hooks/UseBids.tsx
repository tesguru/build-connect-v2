
import { useMutation, useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";


import { useState } from "react";
import { BidService } from "../services/bids/BidService";


export const useBids = () => {
  const [submitBidSuccess, setSubmitBidSuccess] = useState(false);

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
  return {
  submitBidMutation,
  submitBidSuccess,
  getContractorsQuery,
  getClientsBidsQuery,
  singleContractorQuery
  };
};
