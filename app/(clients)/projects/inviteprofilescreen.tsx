import GradientButton from "@/components/Buttons/GradientButton";
import AppLayout from "@/components/Layouts/AppLayout";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import { useBids } from "@/core/hooks/UseBids";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Award, ExternalLink, MapPin, ShieldCheck } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ContractorProfileScreen() {
  const { contractorId, projectId } = useLocalSearchParams<{
    contractorId: string;
    projectId: string;
  }>();

  const { singleContractorQuery, inviteBidMutation, inviteBidsuccess } =
    useBids();
  const { data, isLoading } = singleContractorQuery(contractorId || "");
  const contractor = data?.data?.data;
  const router = useRouter();
  const handleInviteToBid = () => {
    router.push({
      pathname: "/projects/sendInvitationtobid",
      params: {
        projectId,
        contractorId,
        contractorName: contractor?.businessName,
      },
    });
  };

  if (inviteBidsuccess) {
    return (
      <SuccessScreen
        title="Invitation Sent"
        message="Invitation Sent Successfully"
        buttonTitle="View more Projects"
        navigateTo="projects/projects"
        params={{ projectId, initialTab: "Bids" }}
      />
    );
  }

  if (isLoading || !contractor) {
    return (
      <AppLayout screenName="Contractor Profile">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600 font-inter">
            Loading profile...
          </Text>
        </View>
      </AppLayout>
    );
  }

  const {
    personalInfo,
    businessInfo,
    statistics,
    certificationsAndLicenses,
    portfolio,
  } = contractor;

  const initials =
    `${personalInfo.firstName?.[0] ?? ""}${personalInfo.lastName?.[0] ?? ""}`.toUpperCase();
  const workingDays: string[] = businessInfo?.workingHours?.days ?? [];

  return (
    <AppLayout screenName={"Contractor Profile Details"}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Profile Card ── */}
        <View className="pt-4 bg-white m-4 rounded-xl">
          {/* Avatar + name */}
          <View className="flex-row items-center gap-4 px-4 pb-4">
            <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center overflow-hidden">
              {personalInfo.profilePicture?.url ? (
                <Image
                  source={{ uri: personalInfo.profilePicture.url }}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                />
              ) : (
                <Text className="font-interbold text-blue-600 text-xl">
                  {initials}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="font-interbold text-xl text-gray-900">
                {personalInfo.firstName} {personalInfo.lastName}
              </Text>
              <Text className="font-inter text-sm text-gray-500 mt-0.5">
                {businessInfo?.businessName}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <MapPin size={12} color="#9CA3AF" />
                <Text className="font-inter text-xs text-gray-400">
                  {businessInfo?.location}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
              <View className="w-2 h-2 rounded-full bg-green-400" />
              <Text className="text-green-600 text-xs font-intersemibold">
                Active
              </Text>
            </View>
          </View>

          <View className="h-px bg-gray-100 mx-4" />
        </View>

        <View className="pt-4 bg-white m-4 rounded-xl">
          <Text className="font-interbold px-4 text-xl pb-4">
            Contact Details
          </Text>

          <View className="px-4 py-3 flex-row justify-between border-b border-gray-100">
            <Text className="font-inter text-gray-500">Email</Text>
            <Text className="font-intersemibold text-gray-900">
              {personalInfo.email}
            </Text>
          </View>

          <View className="px-4 py-3 flex-row justify-between border-b border-gray-100">
            <Text className="font-inter text-gray-500">Phone</Text>
            <Text className="font-intersemibold text-gray-900">
              {personalInfo.phoneNumber}
            </Text>
          </View>

          <View className="px-4 py-3 flex-row justify-between border-b border-gray-100">
            <Text className="font-inter text-gray-500">Availability</Text>
            <Text className="font-intersemibold text-gray-900">
              {businessInfo?.availability?.label ?? "—"}
            </Text>
          </View>

          <View className="px-4 py-3 flex-row justify-between">
            <Text className="font-inter text-gray-500">Working Hours</Text>
            <Text className="font-intersemibold text-gray-900">
              {businessInfo?.workingHours?.start &&
              businessInfo?.workingHours?.end
                ? `${businessInfo.workingHours.start.slice(0, 5)} – ${businessInfo.workingHours.end.slice(0, 5)}`
                : "—"}
            </Text>
          </View>

          {workingDays.length > 0 && (
            <View className="px-4 pb-4 pt-1">
              <Text className="font-inter text-xs text-gray-400 uppercase tracking-wider mb-2">
                Working Days
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {workingDays.map((day) => (
                  <View key={day} className="bg-blue-50 rounded-lg px-3 py-1.5">
                    <Text className="font-intersemibold text-xs text-blue-600 capitalize">
                      {day}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View className="pt-4 bg-white m-4 rounded-xl">
          <View className="flex-row items-center justify-between px-4 pb-4">
            <Text className="font-interbold text-xl">
              Certifications & Licenses
            </Text>
            {(certificationsAndLicenses?.certifications?.length > 0 ||
              certificationsAndLicenses?.licenses?.length > 0) && (
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-800 font-intersemibold text-xs">
                  {(certificationsAndLicenses?.certifications?.length ?? 0) +
                    (certificationsAndLicenses?.licenses?.length ?? 0)}{" "}
                  file(s)
                </Text>
              </View>
            )}
          </View>

          {certificationsAndLicenses?.certifications?.length > 0 ||
          certificationsAndLicenses?.licenses?.length > 0 ? (
            <View className="px-4 pb-4 gap-3">
              {certificationsAndLicenses?.certifications?.map(
                (cert: any, idx: number) => (
                  <TouchableOpacity
                    key={cert.id ?? idx}
                    onPress={() =>
                      cert.publicUrl && Linking.openURL(cert.publicUrl)
                    }
                    activeOpacity={0.8}
                    className="flex-row items-center gap-3 bg-gray-50 rounded-xl p-3"
                  >
                    <View className="bg-blue-50 rounded-xl p-3">
                      <Award size={18} color="#2563EB" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-intersemibold text-sm text-gray-900"
                        numberOfLines={1}
                      >
                        {cert.fileName || "Certificate"}
                      </Text>
                      <Text className="font-inter text-xs text-gray-400 mt-0.5">
                        Certification
                      </Text>
                    </View>
                    <View className="bg-blue-50 rounded-lg p-2">
                      <ExternalLink size={14} color="#2563EB" />
                    </View>
                  </TouchableOpacity>
                ),
              )}

              {certificationsAndLicenses?.licenses?.map(
                (lic: any, idx: number) => (
                  <TouchableOpacity
                    key={lic.id ?? idx}
                    onPress={() =>
                      lic.publicUrl && Linking.openURL(lic.publicUrl)
                    }
                    activeOpacity={0.8}
                    className="flex-row items-center gap-3 bg-gray-50 rounded-xl p-3"
                  >
                    <View className="bg-purple-50 rounded-xl p-3">
                      <ShieldCheck size={18} color="#7C3AED" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-intersemibold text-sm text-gray-900"
                        numberOfLines={1}
                      >
                        {lic.fileName || "License"}
                      </Text>
                      <Text className="font-inter text-xs text-gray-400 mt-0.5">
                        License · Verified
                      </Text>
                    </View>
                    <View className="bg-purple-50 rounded-lg p-2">
                      <ExternalLink size={14} color="#7C3AED" />
                    </View>
                  </TouchableOpacity>
                ),
              )}
            </View>
          ) : (
            <View className="px-4 pb-6 items-center gap-2">
              <ShieldCheck size={32} color="#D1D5DB" />
              <Text className="font-inter text-sm text-gray-400 text-center">
                No certifications or licenses on file
              </Text>
            </View>
          )}
        </View>

        {portfolio?.total > 0 && (
          <View className="pt-4 bg-white m-4 rounded-xl">
            <View className="flex-row items-center justify-between px-4 pb-4">
              <Text className="font-interbold text-xl">Portfolio</Text>
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-800 font-intersemibold text-xs">
                  {portfolio.total} {portfolio.total === 1 ? "item" : "items"}
                </Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 16,
                gap: 12,
              }}
            >
              {portfolio.items.map((item: any) => (
                <Image
                  key={item.id}
                  source={{ uri: item.url }}
                  style={{ width: 160, height: 110, borderRadius: 12 }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View className="p-4 mx-4 bg-white rounded-xl mt-4">
          <GradientButton title="Invite to Bid" onPress={handleInviteToBid} />
        </View>
      </ScrollView>
    </AppLayout>
  );
}
