
import { useMutation, useQuery } from "@tanstack/react-query";
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
        console.log('Schedule Meeting Response:', scheduleMeeting);
        if (
          scheduleMeeting.success === true
        ) {

          Toast.show({
                    type: "success",
                    text1: "Meeting Scheduled",
                    text2: "Your meeting has been scheduled successfully",
                  });
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

 
const meetingsLookupQuery = ( params: object) => {
  return useQuery({
    queryKey: ['getAllMeetings',  params], 
    queryFn: () => meetingService.getMeeting(params),
  });
};
  
  
  return {
   getAllMeetings,
   getMeetingsDetails,
   scheduleMeetingMutation,
   scheduleMeetingSuccess,
   meetingsLookupQuery
  };
};
