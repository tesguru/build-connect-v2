import { View } from 'react-native'
import React from 'react'
import AppLayout from '@/components/Layouts/AppLayout';
import { FormTextArea } from '@/components/Forms/TextArea';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import GradientButton from '@/components/Buttons/GradientButton';
import { useBids } from '@/core/hooks/UseBids';
import { useLocalSearchParams, router } from 'expo-router';
import SuccessScreen from '@/components/Notifications/SucessScreen';
import { RevisionInput, revisionSchema } from '@/core/schemas/dashboardschema';

const Revisionscreen = () => {
  const { bidRevisionMutation, revisionSuccess } = useBids();
  const { bidId, companyName, projectTitle } =  useLocalSearchParams<{ bidId: string; companyName: string, projectTitle: string }>();

  const {
    control,
    handleSubmit,
    formState: { errors,},
    reset
  } = useForm<RevisionInput>({
    resolver: zodResolver(revisionSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSubmit =  (data: RevisionInput) => {

    const formData = {
      bidId:bidId,
      ...data
    }
        bidRevisionMutation.mutate(formData);
  };
if (revisionSuccess) {
     return (
      <SuccessScreen
  title="Request Revision Sent"
  message="Your revision request has been sent to the builder. They have been notified and will review your request shortly"
  buttonTitle="Return to Proposal Details"
  navigateTo="/proposalscreen" 
  params={{bidId,companyName, projectTitle} }
/>
     );
   }


  return (
    <AppLayout screenName="Revision">
      <View className="pt-4 mx-4">
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormTextArea
              label="Send Revision"
              placeholder="Describe your requests and feedback"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              hasError={!!errors.message}
              errorMessage={errors.message?.message}
              width="w-full"
            />
          )}
        />
      </View>
      
      <View className="mx-4 mt-4">
        <GradientButton 
          title="Submit Revision" 
          onPress={handleSubmit(onSubmit)}
          loading={bidRevisionMutation.isPending}
          disabled={bidRevisionMutation.isPending}
        />
      </View>
    </AppLayout>
  );
}

export default Revisionscreen;