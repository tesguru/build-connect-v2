
import { useMutation, useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";


import { useState } from "react";
import { SupportService } from "../services/support/SupportService";


export type { Project, ProjectsResponse } from "../services/projects/projectTypes";

export const useSupport = () => {
  const [submitTicketSuccess, setSubmitTicketSuccess] = useState(false);

  

  const getAllTicketsQuery = ( params: object) => {
  return useQuery({
    queryKey: ['getAllProjects',  params], 
    queryFn: () => SupportService.viewTicket(params),
  });
};

 const getTicketByIdQuery = (id :any) => {
    return useQuery({
      queryKey: ['getSingleTicketDetails', id], 
      queryFn: () => SupportService.viewTicketDetails(id),
    });
  };

  //MUTATIONS
  const submitTicketMutation = useMutation({
    mutationFn: SupportService.createTicket,
    onSuccess: (res: any) => {
      const responseData = res?.data;
      if (
        (responseData.statusCode === 200 || responseData.statusCode === 201) &&
        responseData.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Ticket Created",
          text2: "Your ticket has been created successfully",
        });
        setSubmitTicketSuccess(true);
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Create Project Failed",
        text2: error?.response?.data?.message || error instanceof Error ? error.message : "Failed to create project",
      });
    },
  });


  


 

 

  
  
  return {
  getTicketByIdQuery,
   submitTicketSuccess,
   getAllTicketsQuery,
    submitTicketMutation,
  
  };
};
