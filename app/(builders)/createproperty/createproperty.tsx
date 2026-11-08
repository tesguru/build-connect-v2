import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react-native";
import React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

import GradientButton from "@/components/Buttons/GradientButton";
import DropdownField from "@/components/Forms/DropDown";
import FileUploadComponent from "@/components/Forms/FileUploadComponent";
import FormInput from "@/components/Forms/Formnput";
import { FormTextArea } from "@/components/Forms/TextArea";
import AppLayout from "@/components/Layouts/AppLayout";
import SuccessScreen from "@/components/Notifications/SucessScreen";
import { reportImage } from "@/constants/icon";
import { useProperty } from "@/core/hooks/useProperty";
import { LookupService } from "@/core/services/lookup/LookupService";
import { rooms } from "@/core/utils/data";
import { uploadFile } from "@/core/utils/fileUpload";
import {
  getApiErrorMessage,
  handleApiError,
} from "@/core/utils/handleapierror";

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────
const createPropertySchema = z.object({
  title: z.string().min(1, "Property title is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  propertyTypeId: z.string().min(1, "Property type is required"),
  location: z.string().min(1, "Location is required"),
  bedrooms: z.coerce.number().min(0, "Bedrooms is required"),
  bathrooms: z.coerce.number().min(0, "Bathrooms is required"),
  description: z.string().min(1, "Description is required"),
  keyFeatures: z.string().min(1, "Key features are required"),
  mediaFiles: z.array(
    z.object({ file: z.any().nullable(), fileId: z.string().optional() }),
  ),
  status: z.enum(["draft", "published"]),
});

type CreatePropertyInput = z.infer<typeof createPropertySchema>;

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft", id: "draft" },
  { label: "Published", value: "published", id: "published" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const CreateProperty = () => {
  const [isUploading, setIsUploading] = React.useState(false);

  const { createPropertyMutation, addPropertySucess } = useProperty();

  // ── Lookups ────────────────────────────────────────────────────────────────
  const { data: propertyTypesResponse, isLoading: isLoadingPropertyTypes } =
    useQuery({
      queryKey: ["propertyTypes"],
      queryFn: async () => {
        const response = await LookupService.getPropertyTypes();
        return response.data.data.items;
      },
    });

  const propertyTypesData =
    propertyTypesResponse?.map((item) => ({
      label: item.label,
      value: item.id,
      id: item.id,
    })) ?? [];

  // ── Form ───────────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.input<typeof createPropertySchema>, any, CreatePropertyInput>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      title: "",
      price: 0,
      propertyTypeId: "",
      location: "",
      bedrooms: 0,
      bathrooms: 0,
      description: "",
      keyFeatures: "",
      mediaFiles: [],
      status: "draft",
    },
  });

  const {
    fields: mediaFields,
    append: appendMedia,
    remove: removeMedia,
  } = useFieldArray({ control, name: "mediaFiles" });

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data: CreatePropertyInput) => {
    try {
      setIsUploading(true);

      // ✅ Build parallel upload tasks
      const mediaFileIds: (string | null)[] = new Array(
        data.mediaFiles.length,
      ).fill(null);

      const mediaTasks = data.mediaFiles.map((item, i) => {
        if (item.file) {
          return uploadFile(item.file, "property_media", "Property Media").then(
            (res) => {
              mediaFileIds[i] = res.id;
              setValue(`mediaFiles.${i}.fileId`, res.id);
            },
          );
        }
        if (item.fileId) {
          mediaFileIds[i] = item.fileId;
        }
        return Promise.resolve();
      });

      // ✅ Upload all in parallel
      const allResults = await Promise.allSettled(mediaTasks);

      const failed = allResults.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        const reasons = failed
          .map((r) =>
            getApiErrorMessage(
              (r as PromiseRejectedResult).reason,
              "Please retry.",
            ),
          )
          .filter(Boolean)
          .join(", ");
        Toast.show({
          type: "error",
          text1: `${failed.length} file(s) failed to upload`,
          text2: reasons || "Please retry.",
        });
        setIsUploading(false);
        return;
      }

      // ── Build payload ──────────────────────────────────────────────────────
      const apiPayload = {
        title: data.title,
        price: data.price,
        propertyTypeId: data.propertyTypeId,
        location: data.location,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        description: data.description,
        keyFeatures: data.keyFeatures
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        mediaFileIds: mediaFileIds.filter((id): id is string => !!id),
        status: data.status,
      };

      createPropertyMutation.mutate(apiPayload, {
        onSettled: () => setIsUploading(false),
        onError: (error: any) => {
          handleApiError(error, "Something went wrong.", {
            title: "Submission Failed",
            fallbackMessage: "Something went wrong.",
          });
        },
      });
    } catch (error: any) {
      setIsUploading(false);
      handleApiError(error, "Failed to upload files. Please try again.", {
        title: "Upload Failed",
        fallbackMessage: "Failed to upload files. Please try again.",
      });
    }
  };

  const isLoading = isUploading || createPropertyMutation.isPending;

  // ── Success ────────────────────────────────────────────────────────────────
  if (addPropertySucess) {
    return (
      <SuccessScreen
        title="Successfully!"
        message="Congratulations! Your Property Has Been Created Successfully"
        navigateTo="/(tab)/properties"
        buttonTitle="Return properties page"
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout screenName="Add Property Listing">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-3">
          {/* Title */}
          <View className="pt-3">
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <FormInput
                  label="Property Title"
                  placeholder="Enter Property Title"
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

          {/* Price & Property Type */}
          <View className="flex-row gap-6 pt-4">
            <View className="flex-1">
              <Controller
                control={control}
                name="price"
                render={({ field }) => (
                  <FormInput
                    label="Price (₦)"
                    placeholder="Enter Price"
                    value={field.value === 0 ? "" : String(field.value)}
                    hasError={!!errors.price}
                    onChangeText={(text) =>
                      field.onChange(parseFloat(text) || 0)
                    }
                    keyboardType="numeric"
                    formatNumber
                  />
                )}
              />
              {errors.price && (
                <Text className="font-inter pt-1 text-red-500 text-sm">
                  {errors.price.message}
                </Text>
              )}
            </View>
            <View className="flex-1 pt-3">
              <DropdownField
                name="propertyTypeId"
                control={control}
                label="Property Type"
                placeholder={
                  isLoadingPropertyTypes ? "Loading..." : "Select type"
                }
                data={propertyTypesData}
                error={errors.propertyTypeId?.message as string}
              />
            </View>
          </View>

          {/* Location */}
          <View className="pt-4">
            <Controller
              control={control}
              name="location"
              render={({ field }) => (
                <FormInput
                  label="Location"
                  placeholder="Enter Location"
                  value={field.value}
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

          {/* Bedrooms & Bathrooms */}
          <View className="flex-row gap-6 pt-4">
            <View className="flex-1">
              <DropdownField
                name="bedrooms"
                control={control}
                label="Bedrooms"
                placeholder="Select"
                data={rooms}
                error={errors.bedrooms?.message as string}
              />
            </View>
            <View className="flex-1">
              <DropdownField
                name="bathrooms"
                control={control}
                label="Bathrooms"
                placeholder="Select"
                data={rooms}
                error={errors.bathrooms?.message as string}
              />
            </View>
          </View>

          {/* Status */}
          <View className="pt-4">
            <DropdownField
              name="status"
              control={control}
              label="Listing Status"
              placeholder="Select status"
              data={STATUS_OPTIONS}
              error={errors.status?.message as string}
            />
          </View>

          {/* Description */}
          <View className="pt-4">
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <FormTextArea
                  label="Description"
                  placeholder="Describe the property"
                  value={field.value}
                  onChangeText={field.onChange}
                  hasError={!!errors.description}
                  errorMessage={errors.description?.message}
                  width="w-full"
                />
              )}
            />
          </View>

          {/* Key Features */}
          <View className="pt-4">
            <Controller
              control={control}
              name="keyFeatures"
              render={({ field }) => (
                <FormTextArea
                  label="Key Features"
                  placeholder="e.g Gate, garden, pool, parking etc"
                  value={field.value}
                  onChangeText={field.onChange}
                  hasError={!!errors.keyFeatures}
                  errorMessage={errors.keyFeatures?.message}
                  width="w-full"
                />
              )}
            />
          </View>

          <View className="mt-6 mx-2">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-worksanssemibold text-xl">Media Files</Text>
              <Text className="font-inter text-gray-400 text-sm">
                Images, Videos (Optional)
              </Text>
            </View>

            {mediaFields.map((field, index) => (
              <View
                key={field.id}
                className="border border-gray-300 rounded-xl p-4 mb-4"
              >
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="font-inter text-lg">Image {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeMedia(index)}>
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* ✅ field wired — file saves to form state */}
                <Controller
                  control={control}
                  name={`mediaFiles.${index}.file`}
                  render={() => (
                    <FileUploadComponent
                      title="Click to upload media"
                      icon={reportImage}
                      label="Property Image"
                      note="PNG, JPG, MP4 (max. 10MB)"
                      control={control}
                      name={`mediaFiles.${index}.file`}
                      error={
                        errors.mediaFiles?.[index]?.file?.message as
                          | string
                          | undefined
                      }
                      maxSizeMB={10}
                    />
                  )}
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={() => appendMedia({ file: null })}
              className="flex-row gap-2 justify-end mb-6"
            >
              <Plus size={20} color="#2563eb" />
              <Text className="text-blue-600 font-inter">Add image</Text>
            </TouchableOpacity>
          </View>

          {/* ── Submit ─────────────────────────────────────────────────────── */}
          <View className="pt-4 pb-8">
            <GradientButton
              title="Publish Listing"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              loadingText="Uploading..."
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default CreateProperty;
