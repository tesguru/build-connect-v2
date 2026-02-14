import { View, Text, Image, ScrollView, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import GradientButton from "@/components/Buttons/GradientButton";
import AppLayout from "@/components/Layouts/AppLayout";
import { useProjects } from "@/core/hooks/useProjects";
import EmptyScreenComponent from "@/components/Miscallaneous/EmptyScreenComponent";
import {
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import React from "react";
import { ConstructionBuilding } from "@/constants/image";
import { useRouter } from "expo-router";

const ProjectDetailsScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { projectId } = route.params as { projectId: string };
  const { singleProjectMarketPlaceQuery } = useProjects();
  const { data, isLoading, error } = singleProjectMarketPlaceQuery(projectId);

  const apiResponse = data?.data;
  const projectData = apiResponse?.data || apiResponse;
  const router = useRouter();
  const handleSubmitBid = () => {
    router.push({
      pathname: "/submitbid/submitbid",
      params: { projectId: projectData.id },
    });
  };

  const getStatus = () => {
    return projectData?.status || "unknown";
  };

  const formatStatus = (status: string) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

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

  const title = projectData.title || "Untitled Project";
  const description = projectData.description || "No description available";
  const location = projectData.location || "Location not specified";
  const startDate = projectData.startDate || "Not specified";
  const endDate = projectData.endDate || "Not specified";
  const bidCount = projectData.bidCount || 0;
  const status = getStatus();
  const budgetRange = projectData.budgetRange || {};
  const timeline = projectData.timeline || {};
  const projectType = projectData.projectType || {};
  const requiredSkills = projectData.requiredSkills || [];
  const attachedDocuments = projectData.attachedDocuments || [];
  const deadlinePassed = projectData.deadlinePassed || false;
  const owner = projectData.owner || {};
  const applicationDeadline =
    projectData.applicationDeadline || "Not specified";

  return (
    <AppLayout screenName="Project Details">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-center m-4 ">
          <Image
            className="rounded-xl"
            style={{ width: "100%", height: 200 }}
            resizeMode="cover"
            source={ConstructionBuilding}
          />
        </View>

        <View className="px-6">
          <Text className="font-worksanssemibold text-2xl pt-4">{title}</Text>

          {owner && Object.keys(owner).length > 0 && (
            <Text className="font-inter pt-2 text-gray-600">
              Posted by: {(owner as any)?.name || "Anonymous"}
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
            <View className="flex-1 bg-white p-4 rounded-xl  border border-gray-100">
              <View className="flex-row items-center justify-center mb-2">
                <DollarSign size={20} color="#3B82F6" />
                <Text className="text-center text-md font-inter text-gray-600 ml-2">
                  Budget
                </Text>
              </View>
              <Text className="text-center text-xl font-worksanssemibold text-blue-600">
                {(budgetRange as any)?.label || "Not specified"}
              </Text>
            </View>

            <View className="flex-1 bg-white p-4 rounded-xl  border border-gray-100">
              <View className="flex-row items-center justify-center mb-2">
                <Clock size={20} color="#3B82F6" />
                <Text className="text-center text-md font-inter text-gray-600 ml-2">
                  Timeline
                </Text>
              </View>
              <Text className="text-center text-xl font-worksanssemibold text-gray-800">
                {(timeline as any)?.label || "Not specified"}
              </Text>
            </View>
          </View>

          {/* About This Project */}
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

              {/* Project Type */}
              {Object.keys(projectType).length > 0 && (
                <View className="flex-row items-center p-4 border-b border-gray-100">
                  <View className="w-12 h-12 bg-purple-50 rounded-xl items-center justify-center mr-4">
                    <Briefcase size={22} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter text-sm text-gray-500 mb-1">
                      Project Type
                    </Text>
                    <Text className="font-worksanssemibold text-gray-900">
                      {(projectType as any)?.label || "Not specified"}
                    </Text>
                  </View>
                </View>
              )}

              {/* Project Duration */}
              <View className="flex-row items-center p-4 border-b border-gray-100">
                <View className="w-12 h-12 bg-green-50 rounded-xl items-center justify-center mr-4">
                  <Calendar size={22} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="font-inter text-sm text-gray-500 mb-1">
                    Project Duration
                  </Text>
                  <Text className="font-worksanssemibold text-gray-900">
                    {new Date(startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>

              {/* Competition */}
              <View className="flex-row items-center p-4 border-b border-gray-100">
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

              {/* Bid Deadline */}
              <View className="flex-row items-center p-4">
                <View className="w-12 h-12 bg-red-50 rounded-xl items-center justify-center mr-4">
                  <AlertCircle size={22} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="font-inter text-sm text-gray-500 mb-1">
                    Bid Deadline
                  </Text>
                  <Text className="font-worksanssemibold text-gray-900">
                    {applicationDeadline !== "Not specified"
                      ? new Date(applicationDeadline).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )
                      : "Not specified"}
                  </Text>
                  {deadlinePassed && (
                    <Text className="text-red-600 text-xs mt-1 font-inter">
                      Deadline has passed
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Required Skills */}
          {requiredSkills.length > 0 && (
            <View className="pt-6">
              <Text className="font-worksanssemibold text-xl mb-3">
                Required Skills
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {requiredSkills.map((skill, index) => (
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
          <View className="pt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-worksanssemibold text-xl">
                Attached Documents
              </Text>
              {attachedDocuments.length > 0 && (
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-800 font-worksanssemibold text-xs">
                    {attachedDocuments.length}{" "}
                    {attachedDocuments.length === 1 ? "file" : "files"}
                  </Text>
                </View>
              )}
            </View>

            {attachedDocuments.length > 0 ? (
              <View className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {attachedDocuments.map((doc, index) => (
                  <View
                    key={doc.fileId}
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
                          {doc.fileType?.split("/")[1]?.toUpperCase() || "PDF"}
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
            ) : (
              <View className="bg-gray-50 p-6 rounded-xl border border-gray-100 items-center">
                <FileText size={40} color="#9CA3AF" />
                <Text className="font-worksanssemibold text-gray-500 mt-3">
                  Not Available
                </Text>
                <Text className="font-inter text-gray-400 text-sm mt-1">
                  No documents attached to this project
                </Text>
              </View>
            )}
          </View>

          {projectData.requirements || projectData.clientRequirements ? (
            <View className="pt-6">
              <Text className="font-worksanssemibold text-xl mb-3">
                Client Requirements
              </Text>
              <View className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <Text className="font-inter text-gray-700 leading-6">
                  {projectData.requirements ||
                    projectData.clientRequirements ||
                    "No specific requirements mentioned."}
                </Text>
              </View>
            </View>
          ) : null}

          <View className="pt-6 pb-8">
            <GradientButton title="Submit Bid" onPress={handleSubmitBid} />

            {deadlinePassed && (
              <View className="flex-row items-center justify-center mt-3 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} color="#EF4444" />
                <Text className="text-red-600 ml-2 font-inter">
                  The bid deadline has passed
                </Text>
              </View>
            )}

            {status !== "posted" && !deadlinePassed && (
              <View className="bg-gray-50 p-3 rounded-lg mt-3">
                <Text className="text-gray-600 text-center font-inter">
                  This project is not currently accepting bids
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default ProjectDetailsScreen;
