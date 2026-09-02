import GradientButton from "@/components/Buttons/GradientButton";
import DropdownField from "@/components/Forms/DropDown";
import FormInput from "@/components/Forms/Formnput";
import AppLayout from "@/components/Layouts/AppLayout";
import { LookupService } from "@/core/services/lookup/LookupService";

import { useMortgageStore } from "@/store/MortgageStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { z } from "zod";

const employmentInfoSchema = z.object({
  employmentStatusId: z.string().min(1, "Employment status is required"),
  occupation: z.string().min(1, "Occupation is required"),
  employerName: z.string().min(1, "Employer name is required"),
  annualGrossIncome: z.coerce.number().min(1, "Annual income is required"),
  savingsAccountBalance: z.coerce.number().min(0, "Required"),
  checkingAccountBalance: z.coerce.number().min(0, "Required"),
  investments: z.coerce.number().min(0, "Required"),
  creditCardDebits: z.coerce.number().min(0, "Required"),
  otherLoans: z.coerce.number().min(0, "Required"),
});

type EmploymentInfoInput = z.infer<typeof employmentInfoSchema>;

export default function EmploymentInfoScreen() {
  const router = useRouter();
  const { formData, setFormData } = useMortgageStore();
  const [employmentStatusOptions, setEmploymentStatusOptions] = useState<
    { id: string; label: string; value: string }[]
  >([]);

  useEffect(() => {
    const fetchEmploymentStatus = async () => {
      try {
        const response = await LookupService.getEmploymentStatus();
        const items = response.data.data.items;
        setEmploymentStatusOptions(
          items.map((item: any) => ({
            id: item.id,
            label: item.label,
            value: item.id,
          })),
        );
      } catch (error) {}
    };
    fetchEmploymentStatus();
  }, []);

  const methods = useForm<EmploymentInfoInput>({
    resolver: zodResolver(employmentInfoSchema),
    mode: "onChange",
    defaultValues: {
      employmentStatusId: formData.employmentStatusId || "",
      occupation: formData.occupation || "",
      employerName: formData.employerName || "",
      annualGrossIncome: formData.annualGrossIncome || 0,
      savingsAccountBalance: formData.savingsAccountBalance || 0,
      checkingAccountBalance: formData.checkingAccountBalance || 0,
      investments: formData.investments || 0,
      creditCardDebits: formData.creditCardDebits || 0,
      otherLoans: formData.otherLoans || 0,
    },
  });

  const {
    control,
    trigger,
    getValues,
    formState: { errors },
  } = methods;

  const handleBack = () => router.back();

  const handleContinue = async () => {
    const valid = await trigger();
    if (valid) {
      setFormData(getValues());
      router.push("/mortgage/createmortgage/document_info");
    }
  };

  return (
    <AppLayout screenName="Employment Info">
      <FormProvider {...methods}>
        <View className="p-4 flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Text className="font-interbold text-2xl text-gray-900">
              Employment & Income
            </Text>
            <Text className="font-inter text-gray-500 text-sm mt-1 mb-6">
              Help us understand your financial situation
            </Text>

            {/* Employment Status Dropdown */}
            <DropdownField
              control={control}
              name="employmentStatusId"
              label="Employment Status"
              placeholder="Select status"
              data={employmentStatusOptions}
              error={errors.employmentStatusId?.message as string}
            />

            {/* Occupation */}
            <View className="mt-4">
              <Controller
                control={control}
                name="occupation"
                render={({ field }) => (
                  <FormInput
                    label="Occupation"
                    placeholder="e.g Software Engineer"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    hasError={!!errors.occupation}
                  />
                )}
              />
              {errors.occupation && (
                <Text className="text-red-500 text-xs mt-1 font-inter">
                  {errors.occupation.message}
                </Text>
              )}
            </View>

            {/* Employer Name */}
            <View className="mt-4">
              <Controller
                control={control}
                name="employerName"
                render={({ field }) => (
                  <FormInput
                    label="Employer Name"
                    placeholder="e.g Google Nigeria"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    hasError={!!errors.employerName}
                  />
                )}
              />
              {errors.employerName && (
                <Text className="text-red-500 text-xs mt-1 font-inter">
                  {errors.employerName.message}
                </Text>
              )}
            </View>

            {/* Annual Gross Income */}
            <View className="mt-4">
              <Controller
                control={control}
                name="annualGrossIncome"
                render={({ field }) => (
                  <FormInput
                    label="Annual Gross Income (₦)"
                    placeholder="e.g 5,000,000"
                    value={field.value ? String(field.value) : ""}
                    onChangeText={(text) => {
                      // Remove commas and convert to number
                      const numericValue = Number(text.replace(/,/g, "")) || 0;
                      field.onChange(numericValue);
                    }}
                    onBlur={field.onBlur}
                    keyboardType="numeric"
                    hasError={!!errors.annualGrossIncome}
                    formatNumber
                  />
                )}
              />
              {errors.annualGrossIncome && (
                <Text className="text-red-500 text-xs mt-1 font-inter">
                  {errors.annualGrossIncome.message}
                </Text>
              )}
            </View>

            {/* Savings + Checking */}
            <View className="flex-row gap-4 mt-4">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="savingsAccountBalance"
                  render={({ field }) => (
                    <FormInput
                      label="Savings Balance (₦)"
                      placeholder="0"
                      value={field.value ? String(field.value) : ""}
                      onChangeText={(text) => {
                        const numericValue =
                          Number(text.replace(/,/g, "")) || 0;
                        field.onChange(numericValue);
                      }}
                      onBlur={field.onBlur}
                      keyboardType="numeric"
                      hasError={!!errors.savingsAccountBalance}
                      formatNumber
                    />
                  )}
                />
                {errors.savingsAccountBalance && (
                  <Text className="text-red-500 text-xs mt-1 font-inter">
                    {errors.savingsAccountBalance.message}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="checkingAccountBalance"
                  render={({ field }) => (
                    <FormInput
                      label="Checking Balance (₦)"
                      placeholder="0"
                      value={field.value ? String(field.value) : ""}
                      onChangeText={(text) => {
                        const numericValue =
                          Number(text.replace(/,/g, "")) || 0;
                        field.onChange(numericValue);
                      }}
                      onBlur={field.onBlur}
                      keyboardType="numeric"
                      hasError={!!errors.checkingAccountBalance}
                      formatNumber
                    />
                  )}
                />
                {errors.checkingAccountBalance && (
                  <Text className="text-red-500 text-xs mt-1 font-inter">
                    {errors.checkingAccountBalance.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Investments */}
            <View className="mt-4">
              <Controller
                control={control}
                name="investments"
                render={({ field }) => (
                  <FormInput
                    label="Investments (₦)"
                    placeholder="0"
                    value={field.value ? String(field.value) : ""}
                    onChangeText={(text) => {
                      const numericValue = Number(text.replace(/,/g, "")) || 0;
                      field.onChange(numericValue);
                    }}
                    onBlur={field.onBlur}
                    keyboardType="numeric"
                    hasError={!!errors.investments}
                    formatNumber
                  />
                )}
              />
              {errors.investments && (
                <Text className="text-red-500 text-xs mt-1 font-inter">
                  {errors.investments.message}
                </Text>
              )}
            </View>

            {/* Credit Card Debts + Other Loans */}
            <View className="flex-row gap-4 mt-4">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="creditCardDebits"
                  render={({ field }) => (
                    <FormInput
                      label="Credit Card Debt (₦)"
                      placeholder="0"
                      value={field.value ? String(field.value) : ""}
                      onChangeText={(text) => {
                        const numericValue =
                          Number(text.replace(/,/g, "")) || 0;
                        field.onChange(numericValue);
                      }}
                      onBlur={field.onBlur}
                      keyboardType="numeric"
                      hasError={!!errors.creditCardDebits}
                      formatNumber
                    />
                  )}
                />
                {errors.creditCardDebits && (
                  <Text className="text-red-500 text-xs mt-1 font-inter">
                    {errors.creditCardDebits.message}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="otherLoans"
                  render={({ field }) => (
                    <FormInput
                      label="Other Loans (₦)"
                      placeholder="0"
                      value={field.value ? String(field.value) : ""}
                      onChangeText={(text) => {
                        const numericValue =
                          Number(text.replace(/,/g, "")) || 0;
                        field.onChange(numericValue);
                      }}
                      onBlur={field.onBlur}
                      keyboardType="numeric"
                      hasError={!!errors.otherLoans}
                      formatNumber
                    />
                  )}
                />
                {errors.otherLoans && (
                  <Text className="text-red-500 text-xs mt-1 font-inter">
                    {errors.otherLoans.message}
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>

          <View className="pb-4 pt-6">
            <GradientButton title="Continue" onPress={handleContinue} />
          </View>
        </View>
      </FormProvider>
    </AppLayout>
  );
}
