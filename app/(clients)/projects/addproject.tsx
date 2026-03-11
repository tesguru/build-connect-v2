import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import GradientButton from "@/components/Buttons/GradientButton";
import { FormDatePicker } from "@/components/Forms/DatePicker";
import DropdownField from "@/components/Forms/DropDown";
import { FileUploadResult } from "@/components/Forms/FileUploadComponent";
import FormInput from "@/components/Forms/Formnput";
import ImageUploadComponent from "@/components/Forms/ImageForm";
import { FormTextArea } from "@/components/Forms/TextArea";
import AppLayout from "@/components/Layouts/AppLayout";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import colors from "@/constants/colors";
import { reportImage } from "@/constants/icon";
import { useProjects } from "@/core/hooks/useProjects";
import { AddProjectInput, addProjectSchema } from "@/core/schemas/dashboardschema";
import { LookupService } from "@/core/services/lookup/LookupService";
import { uploadFile } from "@/core/utils/fileUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react-native";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Toast from "react-native-toast-message";

const AddProject = () => {
  const [openDatePicker, setOpenDatePicker] = React.useState<'start' | 'end' | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);


  const { data: getTimelineResponse, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ["getTimeline"],
    queryFn: async () => {
      const response = await LookupService.getTimelines();
      return response.data.data.items;
    },
  });

  const { data: getBudgetRangesResponse, isLoading: isLoadingBudgetRanges } = useQuery({
    queryKey: ["budgetRange"],
    queryFn: async () => {
      const response = await LookupService.getBudgetRanges();
      return response.data.data.items;
    },
  });

  const { data: projectTypesResponse, isLoading: isLoadingProjectTypes } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => {
      const response = await LookupService.getProjectTypes();
      return response.data.data.items;
    },
  });


  const projectTypesData = projectTypesResponse?.map((item) => ({
    label: item.label,
    value: item.value,
    id: item.id,
  })) || [];

  const timelimeData = getTimelineResponse?.map((item) => ({
    label: item.label,
    value: item.value,
    id: item.id,
  })) || [];

  const budgetData = getBudgetRangesResponse?.map((item) => ({
    label: item.label,
    value: item.value,
    id: item.id,
  })) || [];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddProjectInput>({
    resolver: zodResolver(addProjectSchema),
    defaultValues: {
      projectName: "",
      projectType: "",
      budgetRangeId: "",   
      timelineId: "",      
      location: "",
      budget: "",
      startDate: "",
      endDate: "",
      description: "",
      milestones: [
        {
          milestoneName: "",
          completionDate: "",
          paymentAmount: 0,
        },
      ],
      projectMedia: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

  const { submitBidMutation, submitBidSuccess } = useProjects();

  const onSubmit = async (data: AddProjectInput) => {
    try {
      setIsUploading(true);

     
      let mediaFileId: string | null = null;
      if (data.projectMedia) {
        let fileData: FileUploadResult;

        if ('size' in data.projectMedia && 'name' in data.projectMedia) {
          fileData = data.projectMedia as FileUploadResult;
        } else {
          const response = await fetch(data.projectMedia.uri);
          const blob = await response.blob();
          const fileName = data.projectMedia.uri.split('/').pop() || 'image.jpg';
          const mediaData = data.projectMedia as any;
          fileData = {
            uri: data.projectMedia.uri,
            name: fileName,
            type: mediaData.type || 'image/jpeg',
            width: mediaData.width,
            height: mediaData.height,
            size: blob.size,
          };
        }

        const uploadResult = await uploadFile(fileData, "portfolio", "portfolio");
        mediaFileId = uploadResult.fileId;
      }

      setIsUploading(false);

      const selectedProjectType = projectTypesResponse?.find(
        (item) => item.value === data.projectType
      );

      const selectedBudgetRange = getBudgetRangesResponse?.find(
        (item) => item.value === data.budgetRangeId
      );
      const selectedTimeline = getTimelineResponse?.find(
        (item) => item.value === data.timelineId
      );

      const budgetStr = String(data.budget ?? "").replace(/,/g, "");
      const budgetNum = budgetStr ? parseFloat(budgetStr) : NaN;

      if (!selectedProjectType) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please select a valid project type" });
        return;
      }
      if (!selectedBudgetRange) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please select a budget range" });
        return;
      }
      if (!selectedTimeline) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please select a timeline" });
        return;
      }
      if (!Number.isFinite(budgetNum) || budgetNum <= 0) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter a valid budget amount" });
        return;
      }

     
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const apiPayload = {
        title:         data.projectName,
        description:   data.description,
        location:      data.location,
        projectTypeId: selectedProjectType.id,
        budgetRangeId: selectedBudgetRange.id,   
        exactBudget:   budgetNum,               
        timelineId:    selectedTimeline.id,     
        startDate:     formatDate(data.startDate),
        endDate:       formatDate(data.endDate),
        milestones: data.milestones.map((milestone) => ({
          name:           milestone.milestoneName,
          description:    milestone.milestoneName,
          completionDate: formatDate(milestone.completionDate),
          amount:         milestone.paymentAmount,
        })),
        mediaFileIds: mediaFileId ? [mediaFileId] : [],
        fileIds: [],
        metadata: {},
      };

      submitBidMutation.mutate(apiPayload);
    } catch (error: any) {
      setIsUploading(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to process project data",
      });
    }
  };

  if (submitBidSuccess) {
    return (
      <SuccessScreen
        title="Project Posted Successfully"
        message="Your project has been posted. Builders will start submitting bids soon"
        buttonTitle="View my Projects"
        navigateTo={"/projects/projects"}
      />
    );
  }

  return (
    <AppLayout screenName="Add Project">
      <View style={{ backgroundColor: colors.background_light, padding: 16, flex: 1 }}>
        <Text className="font-interbold pt-4">Project Details</Text>

        <View>
       
          <View>
            <Controller
              control={control}
              name="projectName"
              render={({ field }) => (
                <FormInput
                  placeholder="e.g Modern Bungalow Construction"
                  label="Project Name"
                  value={String(field.value)}
                  hasError={!!errors.projectName}
                  onChangeText={field.onChange}
                />
              )}
            />
            {errors.projectName && (
              <Text className="font-inter pt-1 text-red-500 text-sm">{errors.projectName.message}</Text>
            )}
          </View>

        
          <View className="pt-3 pb-2">
            <DropdownField
              name="projectType"
              control={control}
              label="Project Type"
              placeholder={isLoadingProjectTypes ? "Loading..." : "Select project type"}
              data={projectTypesData || []}
              error={errors.projectType?.message as string}
            />
          </View>

        
          <View className="pb-2">
            <DropdownField
              name="budgetRangeId"
              control={control}
              label="Budget Range"
              placeholder={isLoadingBudgetRanges ? "Loading..." : "Select budget range"}
              data={budgetData || []}
              error={errors.budgetRangeId?.message as string}
            />
          </View>

       
          <View className="pb-2">
            <DropdownField
              name="timelineId"
              control={control}
              label="Timeline"
              placeholder={isLoadingTimeline ? "Loading..." : "Select timeline"}
              data={timelimeData || []}
              error={errors.timelineId?.message as string}
            />
          </View>

        
          <View>
            <Controller
              control={control}
              name="location"
              render={({ field }) => (
                <FormInput
                  placeholder="eg Lagos, Nigeria"
                  label="Location"
                  value={field.value}
                  hasError={!!errors.location}
                  onChangeText={field.onChange}
                />
              )}
            />
            {errors.location && (
              <Text className="font-inter pt-1 text-red-500 text-sm">{errors.location.message}</Text>
            )}
          </View>

       
          <View className="pt-3 pb-2">
            <Controller
              control={control}
              name="budget"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Exact Budget (₦)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="0"
                  keyboardType="numeric"
                  formatNumber
                  hasError={!!errors.budget}
                />
              )}
            />
            {errors.budget && (
              <Text className="font-inter pt-1 text-red-500 text-sm">{errors.budget.message}</Text>
            )}
          </View>

    
          <View className="flex-row justify-between">
            <View className="pt-3 flex-1 mr-2">
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <FormDatePicker
                    label="Start Date"
                    value={field.value ? new Date(field.value) : new Date()}
                    onChange={(date) => field.onChange(date.toISOString())}
                    hasError={!!errors.startDate}
                    errorMessage={errors.startDate?.message}
                    isOpen={openDatePicker === 'start'}
                    onOpen={() => setOpenDatePicker('start')}
                    onClose={() => setOpenDatePicker(null)}
                    minimumDate={new Date()}
                  />
                )}
              />
            </View>
            <View className="pt-3 flex-1 ml-2">
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <FormDatePicker
                    label="End Date"
                    value={field.value ? new Date(field.value) : new Date()}
                    onChange={(date) => field.onChange(date.toISOString())}
                    hasError={!!errors.endDate}
                    errorMessage={errors.endDate?.message}
                    isOpen={openDatePicker === 'end'}
                    onOpen={() => setOpenDatePicker('end')}
                    onClose={() => setOpenDatePicker(null)}
                  />
                )}
              />
            </View>
          </View>

        
          <View className="pt-4">
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <FormTextArea
                  label="Description"
                  placeholder="Describe your project requirements..."
                  value={field.value}
                  onChangeText={field.onChange}
                  hasError={!!errors.description}
                  errorMessage={errors.description?.message}
                  width="w-full"
                />
              )}
            />
          </View>

          <View className="mt-4 mx-2">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-worksanssemibold text-xl">Milestones</Text>
            </View>

            {fields.map((field, index) => (
              <View key={field.id} className="border border-gray-300 rounded-xl p-4 mb-4">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="font-inter text-xl">Milestone {index + 1}</Text>
                  {fields.length > 1 && (
                    <TouchableOpacity onPress={() => remove(index)}>
                      <X size={24} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                </View>

                <View>
                  <Controller
                    control={control}
                    name={`milestones.${index}.milestoneName`}
                    render={({ field }) => (
                      <FormInput
                        placeholder="Foundation"
                        label="Milestone Name"
                        value={field.value}
                        hasError={!!errors.milestones?.[index]?.milestoneName}
                        onChangeText={field.onChange}
                      />
                    )}
                  />
                  {errors.milestones?.[index]?.milestoneName && (
                    <Text className="font-inter pt-1 text-red-500 text-sm">
                      {errors.milestones[index]?.milestoneName?.message}
                    </Text>
                  )}
                </View>

                <View className="flex-row gap-2 justify-between">
                  <View className="pt-7 flex-1">
                    <Controller
                      control={control}
                      name={`milestones.${index}.completionDate`}
                      render={({ field }) => (
                        <FormDatePicker
                          label="Completion Date"
                          value={field.value ? new Date(field.value) : new Date()}
                          onChange={(date) => field.onChange(date.toISOString())}
                          hasError={!!errors.milestones?.[index]?.completionDate}
                          errorMessage={errors.milestones?.[index]?.completionDate?.message}
                        />
                      )}
                    />
                  </View>

                  <View className="pt-3 flex-1">
                    <Controller
                      control={control}
                      name={`milestones.${index}.paymentAmount`}
                      render={({ field }) => (
                        <FormInput
                          placeholder="Enter amount"
                          label="Amount"
                          value={String(field.value)}
                          hasError={!!errors.milestones?.[index]?.paymentAmount}
                          onChangeText={(text) => field.onChange(Number(text.replace(/,/g, "")))}
                          keyboardType="numeric"
                          formatNumber={true}
                        />
                      )}
                    />
                    {errors.milestones?.[index]?.paymentAmount && (
                      <Text className="font-inter pt-1 text-red-500 text-sm">
                        {errors.milestones[index]?.paymentAmount?.message}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => append({ milestoneName: "", completionDate: "", paymentAmount: 0 })}
            className="flex-row gap-2 justify-end"
          >
            <Plus size={20} color="#2563eb" />
            <Text className="text-blue-600 font-inter">Add milestone</Text>
          </TouchableOpacity>

   
          <View>
            <Controller
              control={control}
              name="projectMedia"
              render={() => (
                <ImageUploadComponent
                  title="Click to upload or drag and drop"
                  image={reportImage}
                  label="Project Media"
                  note="PNG, JPG, PDF (max. 5MB)"
                  control={control}
                  name="projectMedia"
                  error={errors.projectMedia?.message as string | undefined}
                />
              )}
            />
          </View>

          <View className="pt-6">
            <GradientButton
              loading={isUploading || submitBidMutation.isPending}
              title="Create Project"
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </View>
      </View>
    </AppLayout>
  );
};

export default AddProject;