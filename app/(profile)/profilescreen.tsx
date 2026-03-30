import AuthHeader from "@/components/Miscallaneous/PageHeader";
import { AvatarImage } from "@/constants/image";
import { useAuth } from "@/core/hooks/useAuth";
import { useAuthStore } from "@/store/Authstore";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


const VERIFICATION_STATUS_CONFIG: Record<
  string,
  { label: string; badgeBg: string; badgeText: string; dot: string }
> = {
  not_started: {
    label: "Not Verified",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-500",
    dot: "bg-gray-400",
  },
  pending: {
    label: "Awaiting Approval",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-700",
    dot: "bg-yellow-400",
  },
  verified: {
    label: "Verified",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Verification Rejected",
    badgeBg: "bg-red-100",
    badgeText: "text-red-600",
    dot: "bg-red-500",
  },
};

// ─── Badge Component ──────────────────────────────────────────────────────────
const Badge = ({
  label,
  badgeBg,
  badgeText,
  dot,
}: {
  label: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
}) => (
  <View className={`flex-row items-center mt-3 px-4 py-1.5 rounded-full ${badgeBg}`}>
    <View className={`w-2 h-2 rounded-full mr-2 ${dot}`} />
    <Text className={`font-interbold text-xs tracking-wide ${badgeText}`}>
      {label}
    </Text>
  </View>
);

// ─── Menu Item Component ──────────────────────────────────────────────────────
const MenuItem = ({
  iconSource,
  iconBg,
  iconTint,
  title,
  subtitle,
  onPress,
  danger = false,
  disabled = false,
}: {
  iconSource: any;
  iconBg: string;
  iconTint: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={disabled ? 1 : 0.7}
    disabled={disabled}
    className={`bg-white rounded-xl p-4 mb-3 border flex-row items-center justify-between ${
      danger ? "border-red-200" : "border-gray-200"
    } ${disabled ? "opacity-50" : ""}`}
  >
    <View className="flex-row items-center flex-1">
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${iconBg}`}
      >
        {typeof iconSource === "string" ? (
          <Text className={`text-xl font-bold ${iconTint}`}>{iconSource}</Text>
        ) : (
          <Image
            source={iconSource}
            className="w-5 h-5"
            style={{ tintColor: iconTint }}
          />
        )}
      </View>
      <View className="flex-1">
        <Text
          className={`font-interbold text-base ${
            danger ? "text-red-600" : "text-gray-900"
          }`}
        >
          {title}
        </Text>
        <Text className="font-inter text-sm text-gray-500 mt-0.5">
          {subtitle}
        </Text>
      </View>
    </View>
    {!danger && !disabled && (
      <Image
        source={require("@/assets/icons/arrow-left.png")}
        className="w-5 h-5"
        style={{ tintColor: "#9CA3AF", transform: [{ rotate: "180deg" }] }}
      />
    )}
  </TouchableOpacity>
);


const ProfileScreen = () => {
  const { user, clearAuthData } = useAuthStore();
  const router = useRouter();
  const { getUserProfile } = useAuth();

  const { data, isLoading } = getUserProfile();


  const userData = data?.data?.data;
  const userRole = user?.role; 

  const fullName = userData
    ? `${userData.firstName} ${userData.lastName}`
    : user
    ? `${user.firstName} ${user.lastName}`
    : "User Name";

  const email = userData?.email ?? user?.email ?? "user@example.com";

  const verificationStatus = userData?.verificationStatus ?? "not_started";
  const verificationBadge =
    VERIFICATION_STATUS_CONFIG[verificationStatus] ??
    VERIFICATION_STATUS_CONFIG.not_started;

  
const clientVerification = userData?.verification?.documents?.length > 0 
  ? userData.verification.documents 
  : null;
  const clientHasSubmitted = clientVerification !== null;
  const contractorProfile = userData?.contractorProfile ?? null;
  const builderHasSubmitted = contractorProfile !== null && contractorProfile !== undefined;


  const menuConfig =
    userRole === "builder"
      ? builderHasSubmitted
        ? {
            iconBg: "bg-green-50",
            iconTint: "#16A34A",
            title: "Profile Submitted",
            subtitle: "View your submitted profile & documents",
          }
        : {
            iconBg: "bg-blue-50",
            iconTint: "#3B82F6",
            title: "Complete Your Profile",
            subtitle: "Submit your profile and documents to get verified",
          }
      : clientHasSubmitted
      ? {
          iconBg: "bg-green-50",
          iconTint: "#16A34A",
          title: "Documents Submitted",
          subtitle: "View your submitted verification documents",
        }
      : {
          iconBg: "bg-blue-50",
          iconTint: "#3B82F6",
          title: "Verify Your Identity",
          subtitle: "Submit your identity documents to get verified",
        };


  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tab)");
    }
  };

  const handlePersonalInformation = () => router.push("/editprofilescreen");

  const handleVerificationAction = () => {
    if (userRole === "client") {
      if (clientHasSubmitted) {
    
        router.push("/verification_details");
      } else {
       
        router.push({
          pathname: "/(auth)/sign_up/client/verify_identity",
          params: { dontShowSkip: "true" },
        });
      }
    } else {
      if (builderHasSubmitted) {
        router.push("/verification_details");
      } else {
        router.push({
          pathname: "/(auth)/sign_up/builder/basic_Info_screen",
          params: { dontShowSkip: "true" },
        });
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await clearAuthData();
            router.replace("/sign_in/signin");
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <AuthHeader title="Profile" onBackPress={handleBack} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-3 font-inter text-gray-500">
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <AuthHeader title="Profile" onBackPress={handleBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
       
        <View className="items-center pt-8 pb-8 bg-white mx-4 mt-4 rounded-2xl border border-gray-100 shadow-sm">
          <View className="relative">
            <Image source={AvatarImage} className="w-24 h-24 rounded-full" />
            <View className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-2 border-white items-center justify-center">
              <Text className="text-white text-xs font-bold">✓</Text>
            </View>
          </View>

          <Text className="font-interbold text-xl mt-4 text-gray-900">
            {fullName}
          </Text>
          <Text className="font-inter text-sm mt-1 text-gray-500">{email}</Text>


          <Badge
            label={verificationBadge.label}
            badgeBg={verificationBadge.badgeBg}
            badgeText={verificationBadge.badgeText}
            dot={verificationBadge.dot}
          />
        </View>


        <View className="px-4 mt-6">
          <Text className="font-interbold text-sm text-gray-400 uppercase tracking-widest mb-3 ml-1">
            Account
          </Text>
          <MenuItem
            iconSource={require("@/assets/icons/profile-2user.png")}
            iconBg="bg-blue-50"
            iconTint="#3B82F6"
            title="Personal Information"
            subtitle="Edit your personal details"
            onPress={handlePersonalInformation}
          />
        </View>


        <View className="px-4 mt-4">
          <Text className="font-interbold text-sm text-gray-400 uppercase tracking-widest mb-3 ml-1">
            Settings
          </Text>
          <MenuItem
            iconSource={require("@/assets/icons/settings.png")}
            iconBg={menuConfig.iconBg}
            iconTint={menuConfig.iconTint}
            title={menuConfig.title}
            subtitle={menuConfig.subtitle}
            onPress={handleVerificationAction}
          />
        </View>


        <View className="px-4 mt-4">
          <MenuItem
            iconSource="↪"
            iconBg="bg-red-50"
            iconTint="text-red-600"
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            danger
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;