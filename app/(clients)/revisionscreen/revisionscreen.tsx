import { FormTextArea } from '@/components/Forms/TextArea';
import AppLayout from '@/components/Layouts/AppLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import GradientButton from '@/components/Buttons/GradientButton';
import SuccessScreen from '@/components/Notifications/SucessScreen';
import { useBids } from '@/core/hooks/UseBids';
import { RevisionInput, revisionSchema } from '@/core/schemas/dashboardschema';
import { useLocalSearchParams } from 'expo-router';

const Revisionscreen = () => {
  const { bidRevisionMutation, revisionSuccess } = useBids();
  const { bidId, companyName, projectTitle, projectId  } =  useLocalSearchParams<{ bidId: string; companyName: string, projectTitle:string, projectId: string }>();

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
  navigateTo="/(clients)/proposalscreen/proposalscreen" 
  params={{bidId, companyName, projectTitle, projectId } }
 />
     );
   }

  return (
    <AppLayout screenName="Revision Request">
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