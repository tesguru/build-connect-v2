
import { useMutation, useQuery } from "@tanstack/react-query";
import { ProjectService } from "../services/projects/ProjectService";
import Toast from "react-native-toast-message";


import { useState } from "react";
import { meetingService } from "../services/meeting/meetingService";


export type { Project, ProjectsResponse } from "../services/projects/projectTypes";

export const useMeetings = () => {
  const [submitBidSuccess, setSubmitBidSuccess] = useState(false);
    const [scheduleMeetingSuccess, setMeetingSuccess] = useState(false);

  

  const getAllMeetings = ( params: object) => {
  return useQuery({
    queryKey: ['getAllMeetings',  params], 
    queryFn: () => meetingService.getMeeting(params),
  });
};

 const getMeetingsDetails = (id :any) => {
    return useQuery({
      queryKey: ['getMeetingDetails', id], 
      queryFn: () => meetingService.getMeetingDetails(id),
    });
  };

    const scheduleMeetingMutation = useMutation({
      mutationFn: meetingService.createMeeting,
      onSuccess: (res: any) => {
        const scheduleMeeting = res?.data;
        if (
          (scheduleMeeting.statusCode === 200 || scheduleMeeting.statusCode === 201) &&
          scheduleMeeting.success === true
        ) {
           setMeetingSuccess(true);
         
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
   getAllMeetings,
   getMeetingsDetails,
   scheduleMeetingMutation,
   scheduleMeetingSuccess
  
  };
};
