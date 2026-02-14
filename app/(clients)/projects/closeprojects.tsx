import { View, Text, Image } from "react-native";
import React from "react";
import AppLayout from "@/components/Layouts/AppLayout";
import StarRating from "@/components/Miscallaneous/Starrating";
import { FormTextArea } from "@/components/Forms/TextArea";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RatingInput, ratingSchema } from "@/core/schemas/dashboardschema";
import GradientButton from "@/components/Buttons/GradientButton";
import { markicon } from "@/constants/icon";

const ClosedProjects = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RatingInput>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      comment: "",
    },
  });
  return (
    <AppLayout screenName="Closed Projects">
      <View className="mt-6 bg-white mx-4 px-4 rounded-xl pb-4">
        <View >
          <Text className="font-interbold text-xl py-2">Project Summary</Text>
          <Text>Project name:</Text>
          <Text className="py-2 font-inter text-xl">Modern Bungalow Built</Text>
        </View>

        <View className="flex-row justify-between mb-6 mt-4">
          <View>
            <Text className="font-inter">Completed Milestones</Text>
            <Text className="text-lg font-interbold">6/6</Text>
          </View>

          <View>
            <Text className="font-inter">Category</Text>
            <Text className="text-lg font-interbold">Newly build</Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <View>
            <Text className="font-inter">Total Budget</Text>
            <Text className="font-interbold text-lg">#85, 000</Text>
          </View>

          <View className="mr-4">
            <Text className="font-inter">Timeline</Text>
            <Text className="font-interbold text-lg">8 months</Text>
          </View>
        </View>
      </View>

      <View className="mt-4 mx-4 p-4 rounded-xl bg-white">
        <Text className="text-xl font-interbold">Rate your Experience</Text>
        <View className="py-3">
          <StarRating />
        </View>

        <View>
          <View className="pt-14">
            <Controller
              control={control}
              name="comment"
              render={({ field }) => (
                <FormTextArea
                  label="Write your preview"
                  placeholder="Share your details of your own experience with the build..."
                  value={field.value}
                  onChangeText={field.onChange}
                  hasError={!!errors.comment}
                  errorMessage={errors.comment?.message}
                  width="w-full"
                />
              )}
            />
          </View>
        </View>
      </View>

         <View className="bg-green-50 border rounded-xl border-gray-200 mx-4 mt-4">
          <View className="flex-row justify-center pt-4">
            <Image
              className="w-10 h-10"
              source={markicon}
              resizeMode="contain"
            />
          </View>
          <View className="">
            <Text className="text-center font-interbold tex-lg my-4">Ready to Close Project</Text>

            <Text className="text-center font-inter px-5">
              All milestones have been approved. Closing this project will mark
              it as completed and finalize all payments.
            </Text>

<View className="mx-2 my-6">
  <GradientButton title="Close & Submit Feedback" />
</View>
          
          </View>
        </View>
    </AppLayout>
  );
};

export default ClosedProjects;
