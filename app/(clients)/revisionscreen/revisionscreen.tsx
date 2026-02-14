import { View, Text } from 'react-native'
import React from 'react'
import AppLayout from '@/components/Layouts/AppLayout';
import { FormTextArea } from '@/components/Forms/TextArea';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddProjectInput, addProjectSchema } from '@/core/schemas/dashboardschema';
import GradientButton from '@/components/Buttons/GradientButton';

const Revisionscreen = () => {
     const {
        control,
        handleSubmit,
        formState: { errors },
      } = useForm<AddProjectInput>({
        resolver: zodResolver(addProjectSchema),
        defaultValues: {
          description: "",
        },
      })
   
  return (
    <AppLayout screenName="Revision">
    <View className="pt-4 mx-4">
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <FormTextArea
                label="Send Revision"
                placeholder="Describe your requests and feedback"
                value={field.value}
                onChangeText={field.onChange}
                hasError={!!errors.description}
                errorMessage={errors.description?.message}
                width="w-full"
              />
            )}
          />
        </View>
            <View className="mx-4 mt-4">
    <GradientButton title="Accept Proposal" />
  </View>

    </AppLayout>

    
  )
}

export default Revisionscreen;