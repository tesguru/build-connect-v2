import GradientButton from "@/components/Buttons/GradientButton";
import { FormDatePicker } from "@/components/Forms/DatePicker";
import DropdownField from "@/components/Forms/DropDown";
import FormInput from "@/components/Forms/Formnput";
import { FormTextArea } from "@/components/Forms/TextArea";
import TimePicker from "@/components/Forms/TimePicker";
import AppLayout from "@/components/Layouts/AppLayout";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import colors from "@/constants/colors";
import { useMeetings } from "@/core/hooks/useMeetings";
import { useProjects } from "@/core/hooks/useProjects";
import { ScheduleMeetingInput, scheduleMeetingSchema } from "@/core/schemas/dashboardschema";
import { LookupService } from "@/core/services/lookup/LookupService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Laptop, Phone, Users, Video } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type MeetingPlatform = {
  id: string;
  label: string;
  value: string;
  description?: string;
  icon?: string;
  requiresLink?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getPlatformMeta = (label: string): { Icon: React.ElementType; isVirtual: boolean } => {
  const lower = label.toLowerCase();
  if (lower.includes("zoom")) return { Icon: Video, isVirtual: true };
  if (lower.includes("meet")) return { Icon: Video, isVirtual: true };
  if (lower.includes("teams")) return { Icon: Laptop, isVirtual: true };
  if (lower.includes("phone")) return { Icon: Phone, isVirtual: true };
  if (lower.includes("physical")) return { Icon: Users, isVirtual: false };
  return { Icon: Video, isVirtual: true };
};

const getMeetingLinkMeta = (label: string): { label: string; placeholder: string } => {
  const lower = label.toLowerCase();
  if (lower.includes("zoom")) return { label: "Zoom Meeting Link", placeholder: "https://zoom.us/j/..." };
  if (lower.includes("meet")) return { label: "Google Meet Link", placeholder: "https://meet.google.com/..." };
  if (lower.includes("teams")) return { label: "Teams Meeting Link", placeholder: "https://teams.microsoft.com/..." };
  if (lower.includes("phone")) return { label: "Phone Number", placeholder: "+234 800 000 0000" };
  return { label: "Meeting Link", placeholder: "Enter link" };
};

const formatDate = (dateString: string): string => {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const PlatformButton = React.memo(({
  label,
  Icon,
  selected,
  onPress,
}: {
  label: string;
  Icon: React.ElementType;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    // ✅ flex-1 so each button takes equal width in its row
    className={`flex-1 flex-col items-center justify-center gap-1.5 px-2 py-3.5 rounded-xl border-2 ${selected ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
      }`}
  >
    <Icon size={20} color={selected ? "#2563eb" : "#9ca3af"} />
    <Text
      numberOfLines={1}
      className={`font-inter text-[11px] text-center font-medium ${selected ? "text-blue-600" : "text-gray-500"
        }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
));

// ─── Screen ───────────────────────────────────────────────────────────────────

const ScheduleMeetingScreen = () => {
  const [openDatePicker, setOpenDatePicker] = useState<"date" | null>(null);
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { scheduleMeetingMutation, scheduleMeetingSuccess } = useMeetings();
  const { getProjectMilestonesQuery } = useProjects();

  // ─── Meeting Platforms ──────────────────────────────────────────────────
  const { data: meetingPlatforms = [], isLoading: isLoadingPlatforms } = useQuery<MeetingPlatform[]>({
    queryKey: ["meetingTypes"],
    queryFn: async () => {
      const response = await LookupService.meetingTypes();
      return response.data.data;
    },
  });

  // ─── Milestones ─────────────────────────────────────────────────────────
  const { data: milestonesResponse, isLoading: isLoadingMilestones } = getProjectMilestonesQuery(
    projectId,
    { page: 1, limit: 100, projectId, includeProgress: false }
  );

  const milestoneOptions = useMemo(() => {
    const raw = milestonesResponse?.data?.data?.milestones ?? milestonesResponse?.data?.milestones ?? [];
    return raw.map((m: any) => ({ label: m.name, value: m.id }));
  }, [milestonesResponse]);

  // ─── Form ────────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ScheduleMeetingInput>({
    resolver: zodResolver(scheduleMeetingSchema),
    defaultValues: {
      title: "", milestoneId: "", attendees: undefined,
      date: "", time: "", platform: "",
      meetingLink: "", location: "", agenda: "",
    },
  });

  const selectedPlatformId = watch("platform");

  const selectedPlatformLabel = useMemo(
    () => meetingPlatforms.find(p => p.id === selectedPlatformId)?.label ?? "",
    [meetingPlatforms, selectedPlatformId]
  );

  const { isVirtual } = useMemo(() => getPlatformMeta(selectedPlatformLabel), [selectedPlatformLabel]);
  const isPhysical = !isVirtual && !!selectedPlatformId;
  const linkMeta = useMemo(() => getMeetingLinkMeta(selectedPlatformLabel), [selectedPlatformLabel]);

  const handlePlatformSelect = useCallback((platformId: string) => {
    setValue("platform", platformId, { shouldValidate: true, shouldDirty: true });
    setValue("meetingLink", "");
    setValue("location", "");
  }, [setValue]);


  const onSubmit = (data: ScheduleMeetingInput) => {
    scheduleMeetingMutation.mutate({
      projectId,
      milestoneId: data.milestoneId,
      title: data.title,
      attendees: data.attendees,
      date: formatDate(data.date),
      time: data.time,
      platform: data.platform,
      agenda: data.agenda ?? "",
      ...(isVirtual && data.meetingLink && { meetingLink: data.meetingLink }),
      ...(isPhysical && data.location && { location: data.location }),
    });
  };


  if (scheduleMeetingSuccess) {
    return (
      <SuccessScreen
        title="Meeting Scheduled!"
        message="Your meeting has been successfully scheduled."
        buttonTitle="View Meeting"
        navigateTo="projects/clientprojectdetails"
        params={{ projectId: projectId, initialTab: 'Meeting' }}
      />
    );
  }


  return (
    <AppLayout screenName="Schedule New Meeting">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ backgroundColor: colors.background_light }}
      >
        <View className="px-5 pt-5 gap-5">

          {/* Title */}
          <View>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <FormInput
                  label="Meeting Title"
                  placeholder="e.g Weekly project sync"
                  value={field.value}
                  hasError={!!errors.title}
                  onChangeText={field.onChange}
                />
              )}
            />
            {errors.title && <Text className="font-inter pt-1 text-red-500 text-sm">{errors.title.message}</Text>}
          </View>

          {/* Milestone — ✅ fixed typo "Milesstone" → "Milestone" */}
          <DropdownField
            name="milestoneId"
            control={control}
            label="Milestone"
            placeholder={isLoadingMilestones ? "Loading milestones..." : "Select milestone"}
            data={milestoneOptions}
            error={errors.milestoneId?.message}
            disabled={isLoadingMilestones}
          />

          {/* Attendees */}
          <View>
            <Controller
              control={control}
              name="attendees"
              render={({ field }) => (
                <FormInput
                  label="Attendees"
                  placeholder="How many attendees"
                  value={field.value ? String(field.value) : ""}
                  hasError={!!errors.attendees}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const num = parseInt(text, 10);
                    field.onChange(isNaN(num) ? undefined : num);
                  }}
                />
              )}
            />
            {errors.attendees && <Text className="font-inter pt-1 text-red-500 text-sm">{errors.attendees.message}</Text>}
          </View>

      
          <View className="flex-row gap-4">
            <View className="flex-1 pt-2">
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <FormDatePicker
                    label="Date"
                    value={field.value ? new Date(field.value) : new Date()}
                    onChange={(date) => field.onChange(date.toISOString())}
                    hasError={!!errors.date}
                    errorMessage={errors.date?.message}
                    isOpen={openDatePicker === "date"}
                    onOpen={() => setOpenDatePicker("date")}
                    onClose={() => setOpenDatePicker(null)}
                    minimumDate={new Date()}
                    placeholder="Select Date"
                  />
                )}
              />
            </View>
            <View className="flex-1 pt-6">
              <Controller
                control={control}
                name="time"
                render={({ field }) => (
                  <TimePicker
                    label="Time"
                    placeholder="e.g 10:00"
                    value={field.value}
                    onChange={field.onChange}
                    hasError={!!errors.time}
                    errorMessage={errors.time?.message}
                  />
                )}
              />
            </View>
          </View>

          {/* Platform — ✅ responsive: icon on top, label below, equal columns */}
          <View>
            <Text className="font-interbold text-gray-900 text-[15px] mb-3">Platform</Text>

            {isLoadingPlatforms ? (
              <Text className="font-inter text-gray-400 text-sm">Loading platforms...</Text>
            ) : (
              <View className="flex-row flex-wrap gap-3">
                {meetingPlatforms.map((platform) => {
                  const { Icon } = getPlatformMeta(platform.label);
                  return (
                    <View key={platform.id} style={{ flexBasis: "30%", flexGrow: 1 }}>
                      <PlatformButton
                        label={platform.label}
                        Icon={Icon}
                        selected={selectedPlatformId === platform.id}
                        onPress={() => handlePlatformSelect(platform.id)}
                      />
                    </View>
                  );
                })}
              </View>
            )}

            {errors.platform && <Text className="font-inter pt-2 text-red-500 text-sm">{errors.platform.message}</Text>}
          </View>


          {isVirtual && !!selectedPlatformId && (
            <View>
              <Controller
                control={control}
                name="meetingLink"
                render={({ field }) => (
                  <FormInput
                    label={linkMeta.label}
                    placeholder={linkMeta.placeholder}
                    value={field.value ?? ""}
                    hasError={!!errors.meetingLink}
                    onChangeText={field.onChange}
                  />
                )}
              />
              {errors.meetingLink && <Text className="font-inter pt-1 text-red-500 text-sm">{errors.meetingLink.message}</Text>}
            </View>
          )}

          {/* Location (physical) */}
          {isPhysical && (
            <View>
              <Controller
                control={control}
                name="location"
                render={({ field }) => (
                  <FormInput
                    label="Venue / Location"
                    placeholder="e.g. Site Office, 12 Victoria Island"
                    value={field.value ?? ""}
                    hasError={!!errors.location}
                    onChangeText={field.onChange}
                  />
                )}
              />
              {errors.location && <Text className="font-inter pt-1 text-red-500 text-sm">{errors.location.message}</Text>}
            </View>
          )}

          {/* Agenda */}
          <Controller
            control={control}
            name="agenda"
            render={({ field }) => (
              <FormTextArea
                label="Meeting Agenda (Optional)"
                placeholder="e.g discuss blueprints changes, budgets review..."
                value={field.value ?? ""}
                onChangeText={field.onChange}
                hasError={!!errors.agenda}
                errorMessage={errors.agenda?.message}
                width="w-full"
              />
            )}
          />

          {/* Submit */}
          <View className="pt-2 pb-10">
            <GradientButton
              loading={scheduleMeetingMutation?.isPending}
              title="Schedule Meeting"
              onPress={handleSubmit(onSubmit)}
            />
          </View>

        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default ScheduleMeetingScreen;