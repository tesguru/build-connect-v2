import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { ProjectService } from "../services/projects/ProjectService";
import { handleApiError } from "../utils/handleapierror";

function isOk(response: any) {
  const data = response?.data;
  return (
    (data?.statusCode === 200 || data?.statusCode === 201) &&
    data?.success === true
  );
}

export function useProjects() {
  const [submitBidSuccess, setSubmitBidSuccess] = useState(false);
  const queryClient = useQueryClient();
  const [expressInterestSuccess, setExpressInterestSuccess] = useState(false);
  const [reviewExpressInterestSuccess, setReviewExpressInterestSuccess] =
    useState(false);

  const submitBidMutation = useMutation({
    mutationFn: ProjectService.createProject,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      Toast.show({
        type: "success",
        text1: "Project Created",
        text2: "Your project has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["getAllProjects"] });
      setSubmitBidSuccess(true);
    },
    onError: (err: any) => handleApiError(err, "Error creating project"),
  });

  const createMessage = useMutation({
    mutationFn: ProjectService.createMessage,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      Toast.show({
        type: "success",
        text1: "Message Sent",
        text2: "Your message has been sent successfully",
      });
      // [sic] invalidates 'getAllProjects' rather than a message-specific
      // key — preserved exactly as decompiled.
      queryClient.invalidateQueries({ queryKey: ["getAllProjects"] });
      setSubmitBidSuccess(true);
    },
    // [sic] copy-pasted from createProject's error message.
    onError: (err: any) => handleApiError(err, "Error creating project"),
  });

  const updateMileStoneMutation = useMutation({
    mutationFn: ProjectService.updateMilestone,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      Toast.show({
        type: "success",
        text1: "Milestone Updated",
        text2: "Your milestone has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["getMilestoneQuery"] });
      queryClient.invalidateQueries({ queryKey: ["getSingleProject"] });
      queryClient.invalidateQueries({ queryKey: ["singleMilestonequery"] });
    },
    onError: (err: any) => handleApiError(err, "Error updating milestone"),
  });

  const createExpressionOfInterestMutation = useMutation({
    mutationFn: ProjectService.expressInterest,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      queryClient.invalidateQueries({
        queryKey: ["getBuildersExpressionOfInterest"],
      });
      setExpressInterestSuccess(true);
    },
    // [sic] copy-pasted "bid revision" message, unrelated to this mutation.
    onError: (err: any) =>
      handleApiError(
        err,
        "Error submitting bid revision request. Please try again.",
      ),
  });

  const reviewExpressionOfInterestMutation = useMutation({
    mutationFn: ProjectService.ReviewExpressionOfInterest,
    onSuccess: (response: any) => {
      if (!isOk(response)) return;
      queryClient.invalidateQueries({
        queryKey: ["getClientsExpressionOfInterest"],
      });
      setReviewExpressInterestSuccess(true);
    },
    onError: (err: any) =>
      handleApiError(
        err,
        "Error submitting bid revision request. Please try again.",
      ),
  });

  const getAllProjectsQuery = (params: any) =>
    useQuery({
      queryKey: ["getAllProjects", params],
      queryFn: () => ProjectService.getProjects(params),
    });

  const projectsMarketPlaceQuery = (params: any) =>
    useQuery({
      queryKey: ["getProjectQueryMarketplace", params],
      queryFn: () => ProjectService.getProjectsMarketPlace(params),
    });

  const singleProjectMarketPlaceQuery = (projectId: string) =>
    useQuery({
      queryKey: ["getProjectSingleQueryMarketplace", projectId],
      queryFn: () => ProjectService.getSingleProjectsMarketPlace(projectId),
    });

  const getSingleProjectQuery = (projectId: string) =>
    useQuery({
      queryKey: ["getSingleProject", projectId],
      queryFn: () => ProjectService.getSingleProject(projectId),
    });

  const getProjectMilestonesQuery = (projectId: string, params: any) =>
    useQuery({
      queryKey: ["getMilestoneQuery", projectId],
      queryFn: () => ProjectService.projectMilestone(projectId, params),
    });

  const singleMilestoneDetailsQuery = (
    projectId: string,
    milestoneId: string,
  ) =>
    useQuery({
      queryKey: ["singleMilestonequery", projectId, milestoneId],
      queryFn: () =>
        ProjectService.projectMilestoneDetails(projectId, milestoneId),
    });

  const getBuilderExpressionOfInterest = (params: any) =>
    useQuery({
      queryKey: ["getBuildersExpressionOfInterest"],
      queryFn: () => ProjectService.builderExpressionOfInterest(params),
    });

  const getClientsExpressionOfInterest = (projectId: string, params: any) =>
    useQuery({
      queryKey: ["getClientsExpressionOfInterest", projectId],
      queryFn: () =>
        ProjectService.clientExpressionOfInterest(projectId, params),
    });

  const viewMessages = (projectId: string) =>
    useQuery({
      queryKey: ["viewMessage", projectId],
      queryFn: () => ProjectService.viewMessage(projectId),
    });

  return {
    submitBidMutation,
    submitBidSuccess,
    getAllProjectsQuery,
    projectsMarketPlaceQuery,
    singleProjectMarketPlaceQuery,
    getSingleProjectQuery,
    getProjectMilestonesQuery,
    singleMilestoneDetailsQuery,
    updateMileStoneMutation,
    getBuilderExpressionOfInterest,
    getClientsExpressionOfInterest,
    createExpressionOfInterestMutation,
    expressInterestSuccess,
    reviewExpressionOfInterestMutation,
    viewMessages,
    createMessage,
  };
}
