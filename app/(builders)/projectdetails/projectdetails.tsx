import GradientButton from "@/components/Buttons/GradientButton";
import AppLayout from "@/components/Layouts/AppLayout";
import EmptyScreenComponent from "@/components/Miscallaneous/EmptyScreenComponent";
import ExpressInterestConfirmModal from "@/components/Miscallaneous/ExressionOfInterestConfirmationModal";

import SuccessScreen from "@/components/Notifications/SucessScreen";
import { useProjects } from "@/core/hooks/useProjects";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Clock as ClockIcon,
  FileText,
  Flag,
  Hourglass,
  MapPin,
  Users,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProjectDetailsScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { projectId } = route.params as { projectId: string };
  const {
    singleProjectMarketPlaceQuery,
    createExpressionOfInterestMutation,
    expressInterestSuccess,
  } = useProjects();
  const { data, isLoading, error } = singleProjectMarketPlaceQuery(projectId);
  const [showExpressInterestModal, setShowExpressInterestModal] =
    useState(false);

  const apiResponse = data?.data;
  const projectData = apiResponse?.data || apiResponse;
  const router = useRouter();

  // ── Extract flags from API data ──────────────────────────────────────────
  const canBid = projectData?.canBid ?? false;
  const hasExpressedInterest = projectData?.hasExpressedInterest ?? false;
  const hasBid = projectData?.hasBid ?? false;

  const handleSubmitBid = () => {
    router.push({
      pathname: "/submitbid/submitbid",
      params: { projectId: projectData.id, currency: projectData.currency },
    });
  };

  // ── Express Interest ──────────────────────────────────────────────────────
  const onExpressInterestPress = () => {
    setShowExpressInterestModal(true);
  };

  const onConfirmExpressInterest = () => {
    createExpressionOfInterestMutation.mutate(
      { projectId },
      {
        onSuccess: () => {
          setShowExpressInterestModal(false);
        },
        onError: () => {
          setShowExpressInterestModal(false);
        },
      },
    );
  };

  const getStatus = () => {
    return projectData?.status || "unknown";
  };

  const formatStatus = (status: string) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  const getMilestoneStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return { bg: "bg-green-100", text: "text-green-800" };
      case "in_progress":
        return { bg: "bg-blue-100", text: "text-blue-800" };
      case "pending":
        return { bg: "bg-yellow-100", text: "text-yellow-800" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800" };
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // ── Success State ──────────────────────────────────────────────────────
  if (expressInterestSuccess == false) {
    return (
      <SuccessScreen
        title="Successfully!"
        message="Congratulations! Your Interest Has Been Expressed Successfully"
        navigateTo="/(tab)/findprojects"
        buttonTitle="Return to projects Marketplace"
      />
    );
  }

  if (isLoading) {
    return (
      <AppLayout screenName="Project Details">
        <View className="flex-1 justify-center items-center py-80">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading project details...</Text>
        </View>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout screenName="Project Details">
        <View className="flex-1 justify-center items-center p-4">
          <EmptyScreenComponent
            title="Unable to Load Project"
            message="There was an error loading the project details. Please try again."
          />
        </View>
      </AppLayout>
    );
  }

  if (!projectData) {
    return (
      <AppLayout screenName="Project Details">
        <View className="flex-1 justify-center items-center p-4">
          <EmptyScreenComponent
            title="Project Not Found"
            message="The project you're looking for doesn't exist or has been removed."
          />
        </View>
      </AppLayout>
    );
  }

  const title = projectData.name || "Untitled Project";
  const description = projectData.description || "No description available";
  const location = projectData.location || "Location not specified";
  const bidCount = projectData.bidCount || 0;
  const status = getStatus();
  const budgetMin = projectData.budgetMin || 0;
  const budgetMax = projectData.budgetMax || 0;
  const currency = projectData.currency || "NGN";
  const durationMin = projectData.durationMin || 0;
  const durationMax = projectData.durationMax || 0;
  const requiredSkills = projectData.requiredSkills || [];
  const attachedDocuments = projectData.attachedDocuments || [];
  const deadlinePassed = projectData.deadlinePassed || false;
  const applicationDeadline = projectData.applicationDeadline || null;
  const hasDeadline = !!applicationDeadline;
  const owner = projectData.owner || {};
  const images = projectData.images || [];
  const milestones = projectData.milestones || [];

  // Format budget label
  const budgetLabel =
    budgetMin && budgetMax
      ? `${currency} ${budgetMin.toLocaleString()} - ${currency} ${budgetMax.toLocaleString()}`
      : "Not specified";

  // Format duration label
  const durationLabel =
    durationMin && durationMax
      ? durationMin === durationMax
        ? `${durationMin} months`
        : `${durationMin} - ${durationMax} months`
      : "Not specified";

  const totalMilestoneAmount = milestones.reduce(
    (sum: number, m: any) => sum + (m.amount || 0),
    0,
  );
  const completedMilestones = milestones.filter(
    (m: any) => m.status === "completed",
  ).length;

  // ── Determine which button to show ──────────────────────────────────────
  const showHasBid = hasBid;
  const showExpressInterest = !hasBid && !hasExpressedInterest && !canBid;
  const showAwaitingApproval = !hasBid && hasExpressedInterest && !canBid;
  const showSubmitBid = !hasBid && hasExpressedInterest && canBid;

  return (
    <AppLayout screenName="Project Details">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6">
          <Text className="font-worksanssemibold text-2xl pt-4">{title}</Text>

          {owner && Object.keys(owner).length > 0 && (
            <Text className="font-inter pt-2 text-gray-600">
              Posted by:{" "}
              {(owner as any)?.name ||
                `${(owner as any)?.firstName || ""} ${(owner as any)?.lastName || ""}`.trim() ||
                "Anonymous"}
            </Text>
          )}

          {/* Status Badge */}
          <View className="mt-3">
            <View
              className={`self-start px-4 py-2 rounded-full ${
                status === "draft"
                  ? "bg-yellow-100"
                  : status === "posted"
                    ? "bg-blue-100"
                    : status === "in_progress"
                      ? "bg-purple-100"
                      : status === "completed"
                        ? "bg-green-100"
                        : "bg-red-100"
              }`}
            >
              <Text
                className={`text-sm font-worksanssemibold ${
                  status === "draft"
                    ? "text-yellow-800"
                    : status === "posted"
                      ? "text-blue-800"
                      : status === "in_progress"
                        ? "text-purple-800"
                        : status === "completed"
                          ? "text-green-800"
                          : "text-red-800"
                }`}
              >
                {formatStatus(status)}
              </Text>
            </View>
          </View>

          {/* Budget and Timeline Cards */}
          <View className="flex-row gap-4 pt-6">
            <View className="flex-1 bg-white p-4 rounded-xl border border-gray-100">
              <View className="flex-row items-center justify-center mb-2">
                <Clock size={20} color="#3B82F6" />
                <Text className="text-center text-md font-inter text-gray-600 ml-2">
                  Budget
                </Text>
              </View>
              <Text className="text-center text-sm font-worksanssemibold text-blue-600">
                {budgetLabel}
              </Text>
            </View>

            <View className="flex-1 bg-white p-4 rounded-xl border border-gray-100">
              <View className="flex-row items-center justify-center mb-2">
                <ClockIcon size={20} color="#3B82F6" />
                <Text className="text-center text-md font-inter text-gray-600 ml-2">
                  Timeline
                </Text>
              </View>
              <Text className="text-center text-sm font-worksanssemibold text-gray-800">
                {durationLabel}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="pt-6">
            <Text className="font-worksanssemibold text-xl mb-3">
              Description
            </Text>
            <View className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <Text className="font-inter text-gray-700 leading-6">
                {description}
              </Text>
            </View>
          </View>

          {/* Key Information Grid */}
          <View className="pt-6">
            <Text className="font-worksanssemibold text-xl mb-3">
              Key Information
            </Text>

            <View className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Location */}
              <View className="flex-row items-center p-4 border-b border-gray-100">
                <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-4">
                  <MapPin size={22} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="font-inter text-sm text-gray-500 mb-1">
                    Location
                  </Text>
                  <Text className="font-worksanssemibold text-gray-900">
                    {location}
                  </Text>
                </View>
              </View>

              {/* Competition */}
              <View
                className={`flex-row items-center p-4 ${
                  hasDeadline ? "border-b border-gray-100" : ""
                }`}
              >
                <View className="w-12 h-12 bg-orange-50 rounded-xl items-center justify-center mr-4">
                  <Users size={22} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="font-inter text-sm text-gray-500 mb-1">
                    Competition
                  </Text>
                  <Text className="font-worksanssemibold text-gray-900">
                    {bidCount}{" "}
                    {bidCount === 1 ? "contractor has" : "contractors have"} bid
                  </Text>
                </View>
              </View>

              {/* Bid Deadline - only shown when a deadline exists */}
              {hasDeadline && (
                <View className="flex-row items-center p-4">
                  <View className="w-12 h-12 bg-red-50 rounded-xl items-center justify-center mr-4">
                    <AlertCircle size={22} color="#EF4444" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter text-sm text-gray-500 mb-1">
                      Bid Deadline
                    </Text>
                    <Text className="font-worksanssemibold text-gray-900">
                      {new Date(applicationDeadline).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </Text>
                    {deadlinePassed && (
                      <Text className="text-red-600 text-xs mt-1 font-inter">
                        Deadline has passed
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* ── MILESTONES ── */}
          {milestones.length > 0 && (
            <View className="pt-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-worksanssemibold text-xl">
                  Milestones
                </Text>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-800 font-worksanssemibold text-xs">
                    {milestones.length}{" "}
                    {milestones.length === 1 ? "milestone" : "milestones"}
                  </Text>
                </View>
              </View>

              <>
                {/* Summary strip */}
                <View className="flex-row gap-3 mb-3">
                  <View className="flex-1 bg-blue-50 p-3 rounded-xl border border-blue-100 items-center">
                    <Text className="text-xs font-inter text-blue-600 mb-1">
                      Total Value
                    </Text>
                    <Text className="font-worksanssemibold text-blue-800 text-sm">
                      {formatCurrency(totalMilestoneAmount)}
                    </Text>
                  </View>
                  <View className="flex-1 bg-green-50 p-3 rounded-xl border border-green-100 items-center">
                    <Text className="text-xs font-inter text-green-600 mb-1">
                      Completed
                    </Text>
                    <Text className="font-worksanssemibold text-green-800 text-sm">
                      {completedMilestones} / {milestones.length}
                    </Text>
                  </View>
                </View>

                {/* Milestone cards */}
                <View className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {milestones.map((milestone: any, index: number) => {
                    const mStyle = getMilestoneStatusStyle(milestone.status);
                    return (
                      <View
                        key={milestone.id || index}
                        className={`p-4 ${
                          index < milestones.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        {/* Top row: order + name + status badge */}
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-row items-center flex-1 mr-2">
                            <View className="w-7 h-7 rounded-full bg-blue-600 items-center justify-center mr-3">
                              <Text className="text-white text-xs font-worksanssemibold">
                                {milestone.orderIndex || index + 1}
                              </Text>
                            </View>
                            <Text
                              className="font-worksanssemibold text-gray-900 flex-1"
                              numberOfLines={1}
                            >
                              {milestone.name}
                            </Text>
                          </View>
                          <View
                            className={`px-2 py-1 rounded-full ${mStyle.bg}`}
                          >
                            <Text
                              className={`text-xs font-worksanssemibold ${mStyle.text}`}
                            >
                              {formatStatus(milestone.status)}
                            </Text>
                          </View>
                        </View>

                        {/* Description */}
                        {milestone.description && (
                          <Text className="font-inter text-gray-600 text-sm leading-5 mb-3 ml-10">
                            {milestone.description}
                          </Text>
                        )}

                        {/* Bottom row: amount + due date */}
                        <View className="flex-row items-center ml-10 gap-4">
                          <Text className="font-worksanssemibold text-blue-600 text-sm">
                            {formatCurrency(milestone.amount)}
                          </Text>
                          {milestone.completionDate && (
                            <View className="flex-row items-center">
                              <Flag size={14} color="#9CA3AF" />
                              <Text className="font-inter text-gray-500 text-xs ml-1">
                                Due:{" "}
                                {new Date(
                                  milestone.completionDate,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            </View>
          )}

          {/* Required Skills */}
          {requiredSkills.length > 0 && (
            <View className="pt-6">
              <Text className="font-worksanssemibold text-xl mb-3">
                Required Skills
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {requiredSkills.map((skill: string, index: number) => (
                  <View
                    key={index}
                    className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-100"
                  >
                    <CheckCircle size={16} color="#3B82F6" />
                    <Text className="text-blue-700 ml-2 font-inter">
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

         

          {/* Project Documents */}
          {attachedDocuments.length > 0 && (
            <View className="pt-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-worksanssemibold text-xl">
                  Approved Documents
                </Text>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-800 font-worksanssemibold text-xs">
                    {attachedDocuments.length}{" "}
                    {attachedDocuments.length === 1 ? "file" : "files"}
                  </Text>
                </View>
              </View>

              <View className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {attachedDocuments.map((doc: any, index: number) => (
                  <View
                    key={doc.fileId || index}
                    className={`flex-row items-center p-4 ${
                      index < attachedDocuments.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-3">
                      <FileText size={24} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-worksanssemibold text-gray-900 mb-1"
                        numberOfLines={1}
                      >
                        {doc.fileName || `Document ${index + 1}`}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-xs text-gray-500 font-inter">
                          {doc.fileType?.split("/")[1]?.toUpperCase() || "FILE"}
                        </Text>
                        <Text className="text-xs text-gray-400 mx-2">•</Text>
                        <Text className="text-xs text-gray-500 font-inter">
                          {(doc.fileSize / 1024).toFixed(1)} KB
                        </Text>
                        <Text className="text-xs text-gray-400 mx-2">•</Text>
                        <Text className="text-xs text-gray-500 font-inter">
                          {new Date(doc.uploadedAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── ACTION BUTTONS ── */}
          <View className="pt-6 pb-8 gap-3">
            {/* Case 0: User has already placed a bid */}
            {showHasBid && (
              <GradientButton
                title="You Have Placed a Bid"
                onPress={() => {}}
                disabled
              />
            )}

            {/* Case 1: Show Express Interest - User hasn't expressed interest yet */}
            {showExpressInterest && (
              <GradientButton
                title="Express Interest"
                onPress={onExpressInterestPress}
                loading={createExpressionOfInterestMutation.isPending}
              />
            )}

            {/* Case 2: Show Awaiting Approval - User expressed interest but not approved yet */}
            {showAwaitingApproval && (
              <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <View className="flex-row items-center gap-3">
                  <Hourglass size={24} color="#D97706" />
                  <View className="flex-1">
                    <Text className="font-worksanssemibold text-yellow-800">
                      Awaiting Approval
                    </Text>
                    <Text className="font-inter text-yellow-600 text-sm mt-1">
                      You have expressed interest in this project. The client
                      will review your profile and approve you to bid.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Case 3: Show Submit Bid - User is approved to bid */}
            {showSubmitBid && (
              <GradientButton
                title="Submit Bid"
                onPress={handleSubmitBid}
                disabled={deadlinePassed}
              />
            )}

            {deadlinePassed && !hasBid && (
              <View className="flex-row items-center justify-center mt-3 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} color="#EF4444" />
                <Text className="text-red-600 ml-2 font-inter">
                  The bid deadline has passed
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <ExpressInterestConfirmModal
        visible={showExpressInterestModal}
        projectTitle={title}
        onCancel={() => setShowExpressInterestModal(false)}
        onConfirm={onConfirmExpressInterest}
        isLoading={createExpressionOfInterestMutation.isPending}
      />
    </AppLayout>
  );
};

export default ProjectDetailsScreen;