import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { z } from "zod";

import GradientButton from "@/components/Buttons/GradientButton";
import FormInput from "@/components/Forms/Formnput";
import AppLayout from "@/components/Layouts/AppLayout";
import colors from "@/constants/colors";
import { useEscrow } from "@/core/hooks/useEscrow";

const linkMortgageSchema = z.object({
  bankName:      z.string().min(1, "Bank name is required"),
  accountName:   z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
});

type LinkMortgageInput = z.infer<typeof linkMortgageSchema>;

const CreateAccount = () => {
  /* ── Read params passed from EscrowAccount ── */
  const params = useLocalSearchParams<{
    mode?:          string
    bankName?:      string
    accountName?:   string
    accountNumber?: string
  }>();

  const isUpdateMode = params.mode === 'update';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LinkMortgageInput>({
    resolver: zodResolver(linkMortgageSchema),
    defaultValues: {
      bankName:      params.bankName      ?? "",
      accountName:   params.accountName   ?? "",
      accountNumber: params.accountNumber ?? "",
    },
  });

  const { createEscrowAccount } = useEscrow();

  /* Both create and update call the same mutation */
  const onSubmit = async (data: LinkMortgageInput) => {
    createEscrowAccount.mutate(data);
  };

  return (
    <AppLayout screenName={isUpdateMode ? "Update account information " : "Supply account information"}>
      <ScrollView
        style={{ backgroundColor: colors.background_light, flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* ── Update mode banner ── */}
        {isUpdateMode && (
          <View className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
            <Text className="text-blue-700 font-intersemibold text-sm">
              Updating existing account
            </Text>
            <Text className="text-blue-500 font-inter text-xs mt-0.5">
              Edit the fields below and tap "Update Account" to save changes.
            </Text>
          </View>
        )}

        <View className="mb-6">
          <Text className="font-inter text-base mb-4">
            {isUpdateMode ? 'Update Account Details' : 'Have you created an account with Homebase Mortgage Bank? Supply the account information below for record purposes.'}
          </Text>

          {/* Bank Name */}
          <View className="mb-4">
            <Controller
              control={control}
              name="bankName"
              render={({ field }) => (
                <FormInput
                  placeholder="e.g Homebase Mortgage Bank"
                  label="Bank Name"
                  value={field.value}
                  hasError={!!errors.bankName}
                  onChangeText={field.onChange}
                />
              )}
            />
            {errors.bankName && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.bankName.message}
              </Text>
            )}
          </View>

          {/* Account Name */}
          <View className="mb-4">
            <Controller
              control={control}
              name="accountName"
              render={({ field }) => (
                <FormInput
                  placeholder="Account holder name"
                  label="Account Name"
                  value={field.value}
                  hasError={!!errors.accountName}
                  onChangeText={field.onChange}
                />
              )}
            />
            {errors.accountName && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.accountName.message}
              </Text>
            )}
          </View>

          {/* Account Number */}
          <View className="mb-4">
            <Controller
              control={control}
              name="accountNumber"
              render={({ field }) => (
                <FormInput
                  placeholder="Mortgage account number"
                  label="Account Number"
                  value={field.value}
                  hasError={!!errors.accountNumber}
                  onChangeText={field.onChange}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.accountNumber && (
              <Text className="font-inter pt-1 text-red-500 text-sm">
                {errors.accountNumber.message}
              </Text>
            )}
          </View>
        </View>

        {/* Disclaimer — only on create */}
        {!isUpdateMode && (
          <View className="bg-gray-100 p-4 rounded-xl mb-6">
            <Text className="font-inter text-xs text-gray-600 text-center leading-5">
              By linking your mortgage, you authorize BuildConnect to access
              payment information for this project. Please ensure all details
              are accurate.
            </Text>
          </View>
        )}

        {/* CTA */}
        <View className="mb-4">
          <GradientButton
            loading={createEscrowAccount.isPending}
            title={isUpdateMode ? "Update Account" : "Create Account"}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default CreateAccount;