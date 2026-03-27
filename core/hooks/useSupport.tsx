import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { SupportService } from "../services/support/SupportService";
import { handleApiError } from "../utils/handleapierror";

export type { Project, ProjectsResponse } from "../services/projects/projectTypes";

export const useSupport = () => {
  const [submitTicketSuccess, setSubmitTicketSuccess] = useState(false);
  const queryClient = useQueryClient();

  const getAllTicketsQuery = (params: object) => {
    return useQuery({
      queryKey: ['getAllTickets', params], // ✅ fixed key — was 'getAllProjects'
      queryFn: () => SupportService.viewTicket(params),
    });
  };

  const getTicketByIdQuery = (id: any) => {
    return useQuery({
      queryKey: ['getSingleTicketDetails', id],
      queryFn: () => SupportService.viewTicketDetails(id),
    });
  };

  // ── Mutations ──────────────────────────────────────────────────────────────

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

        
        queryClient.invalidateQueries({ queryKey: ['getAllTickets'] });

        setSubmitTicketSuccess(true);
      }
    },
    onError: (error: any) => {
      handleApiError(error, "Failed to create support");
    },
  });

  return {
    getTicketByIdQuery,
    submitTicketSuccess,
    getAllTicketsQuery,
    submitTicketMutation,
  };
};