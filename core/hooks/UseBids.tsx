
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";


import { useState } from "react";
import { BidService } from "../services/bids/BidService";


export const useBids = () => {
    const queryClient = useQueryClient();
  const [submitBidSuccess, setSubmitBidSuccess] = useState(false);
  const [inviteBidsuccess, setinviteBidsuccess] = useState(false);
  const [respondBidSucess, setrespondBidSucess] = useState(false);
    const [sendSuccess, setSendSuccess]   = useState(false)
  const [signSuccess, setSignSuccess]   = useState(false)
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
                queryClient.invalidateQueries({ queryKey: ['getAllBids'] });
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

    const getAllBids = ( params: object) => {
    return useQuery({
      queryKey: ['getAllBids',  params], 
      queryFn: () => BidService.myBids(params),
    });
  };
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

  const getClientsBidsQuery = (id: any, params: any) => {
    return useQuery({
      queryKey: ['getClientsBids', id],
      queryFn: () => BidService.clientBids(id, params),
    });
  };

   const myInvitations = (params: any) => {
    return useQuery({
      queryKey: ['myInvitations', params],
      queryFn: () => BidService.myInvitations(params),
    });
  };

  

    const clientInvitations = (params: any) => {
    return useQuery({
      queryKey: ['clientInvitations', params],
      queryFn: () => BidService.clientInvitations(params),
    });
  };

  const singleContractorQuery = (id: any) => {
    return useQuery({
      queryKey: ['singleContractor', id],
      queryFn: () => BidService.singleContractor(id),
    });
  };

 const getContractByBidQuery = (id: any) => {
    return useQuery({
      queryKey: ['contractByBidQuery', id],
      queryFn: () => BidService.getContractByBidId(id),
    });
  };

   const bidRevisionSummary = (id: any) => {
    return useQuery({
      queryKey: ['BidRevisionSummary', id],
      queryFn: () => BidService.bidRevisionSummary(id),
    });
  };

  const singleContractQuery = (id: any) => {
    return useQuery({
      queryKey: ['singleContract', id],
      queryFn: () => BidService.getContract(id),
         enabled: !!id, 
    });
  };

  const singleBidQuery = (id: any) => {
    return useQuery({
      queryKey: ['singleBidQuery', id],
      queryFn: () => BidService.getBidsDetails(id),
       enabled: !!id, 
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
          queryClient.invalidateQueries({ queryKey: ['getAllBids'] });
          queryClient.invalidateQueries({ queryKey: ['getSingleProject'] });
          queryClient.invalidateQueries({ queryKey: ['getAllProjects'] });
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

  const respondToBidInvitationMutation = useMutation({
    mutationFn: BidService.respondToBidInvitations,
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
        "Failed to Update Invitation Bids.";
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
        setContractData(createContractData)
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
  const builderBidRevisionMutation = useMutation({
    mutationFn: BidService.builderBidRevisionRequest,
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
  const sendContractMutation = useMutation({
    mutationFn: BidService.sendContract,
    onSuccess: (res: any) => {
      const sendContractData = res?.data;
      if (
        (sendContractData.statusCode === 200 || sendContractData.statusCode === 201) &&
        sendContractData.success === true
      ) {
       setSendSuccess(true);
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

    const signContractMutation = useMutation({
    mutationFn: BidService.signContract,
    onSuccess: (res: any) => {
      const sendContractData = res?.data;
      if (
        (sendContractData.statusCode === 200 || sendContractData.statusCode === 201) &&
        sendContractData.success === true
      ) {
        queryClient.invalidateQueries({ queryKey: ['contractByBidQuery'] });
        queryClient.invalidateQueries({ queryKey: ['singleContract'] });
        queryClient.invalidateQueries({ queryKey: ['getSingleProject'] });
setSignSuccess(true);

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
  const downloadContractMutation = useMutation({
    mutationFn: BidService.downloadContract,
    onSuccess: (res: any) => {
      const downloadContractData = res?.data;
      if (
        (downloadContractData.statusCode === 200 || downloadContractData.statusCode === 201) &&
        downloadContractData.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Download",
          text2: "Contract downloaded successfully.",
        });

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
    signSuccess
  };
};
