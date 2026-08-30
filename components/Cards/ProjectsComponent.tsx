import { ClockIcon, LocationIcon, UserIcon } from "@/constants/icon";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProjectsComponentProps {
  postedTime: string;
  projectName: string;
  location: string;
  description?: string;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  durationMin?: number;
  durationMax?: number;
  bids: number | string;
  status?:
    | "draft"
    | "posted"
    | "in_progress"
    | "completed"
    | "cancelled"
    | string;
  onPress?: () => void;
  locationIcon?: ImageSourcePropType;
  clockIcon?: ImageSourcePropType;
  userIcon?: ImageSourcePropType;
}

const ProjectsComponent: React.FC<ProjectsComponentProps> = ({
  postedTime,
  projectName,
  location,
  budgetMin,
  budgetMax,
  currency,
  durationMin,
  durationMax,
  bids,
  status,
  onPress,
  locationIcon = LocationIcon,
  clockIcon = ClockIcon,
  userIcon = UserIcon,
}) => {
  // Helper function to format number with commas
  const formatAmount = (amount?: number): string => {
    if (amount == null) return "0";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "0";
    return num.toLocaleString("en-NG");
  };

  // Function to get status badge styling
  const getStatusBadgeStyles = () => {
    switch (status) {
      case "draft":
        return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Draft" };
      case "posted":
        return { bg: "bg-blue-100", text: "text-blue-800", label: "Posted" };
      case "in_progress":
        return {
          bg: "bg-purple-100",
          text: "text-purple-800",
          label: "In Progress",
        };
      case "completed":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          label: "Completed",
        };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          label: status || "Unknown",
        };
    }
  };

  const statusStyles = getStatusBadgeStyles();

  const durationLabel =
    durationMin != null && durationMax != null
      ? `${durationMin}–${durationMax} months`
      : "Not specified";

  return (
    <TouchableOpacity className="m-4 p-4 bg-white rounded-xl" onPress={onPress}>
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-inter text-gray-500 text-sm">{postedTime}</Text>

        {/* Status Badge */}
        {status && (
          <View className={`${statusStyles.bg} px-3 py-1 rounded-full`}>
            <Text className={`${statusStyles.text} text-xs font-medium`}>
              {statusStyles.label}
            </Text>
          </View>
        )}
      </View>

      <View>
        <Text className="text-xl font-worksanssemibold text-gray-800 mb-2">
          {projectName}
        </Text>

        <View className="flex-row gap-2 py-2 items-center">
          <Image
            source={locationIcon}
            style={{ width: 15, height: 15 }}
            resizeMode="contain"
          />
          <Text className="font-inter text-gray-600">{location}</Text>
        </View>

        <View className="flex-row gap-2 items-center mb-4">
          <Text className="font-inter text-gray-600">Budget:</Text>
          {budgetMin != null && budgetMax != null ? (
            <Text className="font-worksanssemibold text-md text-blue-600">
              {currency} {formatAmount(budgetMin)} – {currency}{" "}
              {formatAmount(budgetMax)}
            </Text>
          ) : (
            <Text className="font-worksanssemibold text-xl text-blue-600">
              Not specified
            </Text>
          )}
        </View>

        <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
          <View className="flex-row gap-1 items-center">
            <Image
              style={{ width: 15, height: 15 }}
              source={clockIcon}
              resizeMode="contain"
            />
            <Text className="font-inter text-gray-600">{durationLabel}</Text>
          </View>

          <View className="flex-row gap-1 items-center">
            <Image
              style={{ width: 15, height: 15 }}
              source={userIcon}
              resizeMode="contain"
            />
            <Text className="font-inter text-gray-600">{bids} bids</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProjectsComponent;
