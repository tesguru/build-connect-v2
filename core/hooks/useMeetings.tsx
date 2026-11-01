import { useMutation, useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { useState } from "react";
import { meetingService } from "../services/meeting/meetingService";
import { handleApiError } from "../utils/handleapierror";

export type {
  Project,
  ProjectsResponse
} from "../services/projects/projectTypes";

export const useMeetings = () => {
  const [submitBidSuccess, setSubmitBidSuccess] = useState(false);
  const [scheduleMeetingSuccess, setMeetingSuccess] = useState(false);

  const getAllMeetings = (params: object) => {
    return useQuery({
      queryKey: ["getAllMeetings", params],
      queryFn: () => meetingService.getMeeting(params),
    });
  };

  const getMeetingsDetails = (id: any) => {
    return useQuery({
      queryKey: ["getMeetingDetails", id],
      queryFn: () => meetingService.getMeetingDetails(id),
    });
  };

  const scheduleMeetingMutation = useMutation({
    mutationFn: meetingService.createMeeting,
    onSuccess: (res: any) => {
      const scheduleMeeting = res?.data;

      if (scheduleMeeting.success === true) {
        Toast.show({
          type: "success",
          text1: "Meeting Scheduled",
          text2: "Your meeting has been scheduled successfully",
        });
        setMeetingSuccess(true);
      }
    },
    onError: (error: any) => {
      handleApiError(error, "Failed to schedule meeting.", {
        title: "Submit Failed",
        fallbackMessage: "Failed to schedule meeting. Please try again.",
      });
    },
  });

  const meetingsLookupQuery = (params: object) => {
    return useQuery({
      queryKey: ["getAllMeetings", params],
      queryFn: () => meetingService.getMeeting(params),
    });
  };

  const singleMeeting = (id: any) => {
    return useQuery({
      queryKey: ["singleMeeting", id],
      queryFn: () => meetingService.singleMeeting(id),
    });
  };

  return {
    getAllMeetings,
    getMeetingsDetails,
    scheduleMeetingMutation,
    scheduleMeetingSuccess,
    meetingsLookupQuery,
    singleMeeting,
  };
};
