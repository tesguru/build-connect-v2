import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/Forms/Formnput";
import { FormTextArea } from "@/components/Forms/TextArea";
import { FormDatePicker } from "@/components/Forms/DatePicker";
import GradientButton from "@/components/Buttons/GradientButton";
import AppLayout from "@/components/Layouts/AppLayout";
import DropdownField from "@/components/Forms/DropDown";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import colors from "@/constants/colors";
import { useMeetings } from "@/core/hooks/useMeetings";
import Toast from "react-native-toast-message";
import { useLocalSearchParams } from "expo-router";
import { Video, Phone, Users, Laptop } from "lucide-react-native";
import { ScheduleMeetingInput, scheduleMeetingSchema } from "@/core/schemas/dashboardschema";


const PLATFORMS = [
  { id: "mp_zoom_001",  label: "Zoom",        Icon: Video,  isVirtual: true  },
  { id: "mp_gmeet_002", label: "Google Meet", Icon: Video,  isVirtual: true  },
  { id: "mp_teams_003", label: "MS Teams",    Icon: Laptop, isVirtual: true  },
  { id: "mp_phone_005", label: "Phone",       Icon: Phone,  isVirtual: true  },
  { id: "mp_phys_004",  label: "Physical",    Icon: Users,  isVirtual: false },
];


const PlatformButton = ({
  platform,
  selected,
  onPress,
}: {
  platform: (typeof PLATFORMS)[number]
  selected: boolean
  onPress: () => void
}) => {
  const { Icon, label } = platform;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 flex-1 ${
        selected ? "border-blue-600 bg-white" : "border-gray-200 bg-white"
      }`}
    >
      <Icon size={18} color={selected ? "#2563eb" : "#9ca3af"} />
      <Text
        className={`font-inter text-[13px] font-medium ${
          selected ? "text-blue-600" : "text-gray-500"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};


const ScheduleMeetingScreen = () => {
  const [openDatePicker, setOpenDatePicker] = React.useState<"date" | null>(null);
    const {  projectId} = useLocalSearchParams<{  projectId: string }>();
 

  const { scheduleMeetingMutation, scheduleMeetingSuccess } = useMeetings();


  const MILESTONE_OPTIONS = [
    { label: "Foundation",         value: "milestone_1" },
    { label: "Roofing",            value: "milestone_2" },
    { label: "Interior Finishing", value: "milestone_3" },
  ];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ScheduleMeetingInput>({
    resolver: zodResolver(scheduleMeetingSchema),
    defaultValues: {
      title:       "",
      milestoneId: "",
      attendees:   undefined,
      date:        "",
      time:        "",
      platform:    "",    
      meetingLink: "",
      location:    "",        
      agenda:      "",
    },
  });

  const selectedPlatform        = watch("platform");
  const selectedPlatformConfig  = PLATFORMS.find(p => p.id === selectedPlatform);
  const isVirtual               = selectedPlatformConfig?.isVirtual === true;
  const isPhysical              = selectedPlatformConfig?.isVirtual === false;

  
  const handlePlatformSelect = (platformId: string) => {
    setValue("platform",    platformId, { shouldValidate: true, shouldDirty: true });
    setValue("meetingLink", "");
    setValue("location",    "");
  };

 
  const meetingLinkLabel = (): string => {
    if (selectedPlatform === "mp_zoom_001")  return "Zoom Meeting Link";
    if (selectedPlatform === "mp_gmeet_001") return "Google Meet Link";
    if (selectedPlatform === "mp_teams_001") return "Teams Meeting Link";
    if (selectedPlatform === "mp_phone_001") return "Phone Number";
    return "Meeting Link";
  };

  const meetingLinkPlaceholder = (): string => {
    if (selectedPlatform === "mp_zoom_001")  return "https://zoom.us/j/...";
    if (selectedPlatform === "mp_gmeet_001") return "https://meet.google.com/...";
    if (selectedPlatform === "mp_teams_001") return "https://teams.microsoft.com/...";
    if (selectedPlatform === "mp_phone_001") return "+234 800 000 0000";
    return "Enter link";
  };


  const onSubmit = async (data: ScheduleMeetingInput) => {
    try {
      const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      };

      const payload: Record<string, any> = {
        projectId:   projectId,
        milestoneId: "3d029e53-6343-433d-833f-94eb520423a7",
        title:       data.title,
        attendees:   data.attendees,
        date:        formatDate(data.date),
        time:        data.time,
        platform:    data.platform,
        agenda:      data.agenda ?? "",
        ...(isVirtual  && data.meetingLink && { meetingLink: data.meetingLink }),
        ...(isPhysical && data.location    && { location:    data.location    }),
      };
     
      scheduleMeetingMutation.mutate(payload);
    } catch (error: any) {
      Toast.show({
        type:  "error",
        text1: "Error",
        text2: error?.message || "Failed to schedule meeting",
      });
    }
  };


  if (scheduleMeetingSuccess) {
    return (
      <SuccessScreen
        title="Meeting Scheduled!"
        message="Your meeting has been scheduled. All participants will be notified."
        buttonTitle="View Meetings"
        navigateTo="/meetings"
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
            {errors.title && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.title.message}
              </Text>
            )}
          </View>

        
          <View>
            <DropdownField
              name="milestoneId"
              control={control}
              label="Meeting Purpose"
              placeholder="Select milestone"
              data={MILESTONE_OPTIONS}
              error={errors.milestoneId?.message}
            />
          </View>

          
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
                  onChangeText={(text) => {
                    const num = parseInt(text, 10);
                    field.onChange(isNaN(num) ? undefined : num);
                  }}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.attendees && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.attendees.message}
              </Text>
            )}
          </View>

      
          <View className="flex-row gap-4">
            <View className="flex-1">
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

            <View className="flex-1">
              <Controller
                control={control}
                name="time"
                render={({ field }) => (
                  <FormInput
                    label="Time"
                    placeholder="e.g 10:00AM"
                    value={field.value}
                    hasError={!!errors.time}
                    onChangeText={field.onChange}
                  />
                )}
              />
              {errors.time && (
                <Text className="font-inter pt-1 text-red-500 text-sm">
                  {errors.time.message}
                </Text>
              )}
            </View>
          </View>

     
          <View>
            <Text className="font-interbold text-gray-900 text-[15px] mb-2">
              Platform
            </Text>

    
            <View className="flex-row gap-3 mb-3">
              {PLATFORMS.slice(0, 3).map((p) => (
                <PlatformButton
                  key={p.id}
                  platform={p}
                  selected={selectedPlatform === p.id}
                  onPress={() => handlePlatformSelect(p.id)}
                />
              ))}
            </View>

            
            <View className="flex-row gap-3">
              {PLATFORMS.slice(3).map((p) => (
                <PlatformButton
                  key={p.id}
                  platform={p}
                  selected={selectedPlatform === p.id}
                  onPress={() => handlePlatformSelect(p.id)}
                />
              ))}
            </View>

            {errors.platform && (
              <Text className="font-inter pt-2 text-red-500 text-sm">
                {errors.platform.message}
              </Text>
            )}
          </View>

       
          {isVirtual && (
            <View>
              <Controller
                control={control}
                name="meetingLink"
                render={({ field }) => (
                  <FormInput
                    label={meetingLinkLabel()}
                    placeholder={meetingLinkPlaceholder()}
                    value={field.value ?? ""}
                    hasError={!!errors.meetingLink}
                    onChangeText={field.onChange}
                  />
                )}
              />
              {errors.meetingLink && (
                <Text className="font-inter pt-1 text-red-500 text-sm">
                  {errors.meetingLink.message}
                </Text>
              )}
            </View>
          )}

       
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
              {errors.location && (
                <Text className="font-inter pt-1 text-red-500 text-sm">
                  {errors.location.message}
                </Text>
              )}
            </View>
          )}

       
          <View>
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
          </View>

     
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