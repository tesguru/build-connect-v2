import { View, Text } from 'react-native'
import React from 'react'
import { formatCurrency } from '@/core/utils';
import AppLayout from '@/components/Layouts/AppLayout';
import GradientButton from '@/components/Buttons/GradientButton';
import PrimaryButton from '@/components/Buttons/Button';
import { useRouter } from 'expo-router'; // Replace useNavigation with useRouter

const Proposalscreen = () => {
  const router = useRouter(); // Initialize router

  const handlerevision = () => {
 
    router.push('/revision'); 
  
  };

  const handlecontractdetails = () => {
    // Navigate to ClientContractdetailsScreen
    router.push('/contract-details'); // Adjust path based on your file structure
    // If you want replace navigation: router.replace('/contract-details')
  };

  const breakdownItems = [
    { label: 'Foundation & Site Work', amount: 13000800 },
    { label: 'Framing & Structure', amount: 12200000 },
    { label: 'Roofing & Exterior', amount: 16450000 },
    { label: 'Electrical & Plumbing', amount: 15700000 },
    { label: 'Interior Finishes', amount: 22870000 },
  ];

  const timelineItems = [
    { milestone: 'Project Start', week: 'Week 1' },
    { milestone: 'Foundation Complete', week: 'Week 4' },
    { milestone: 'Framing Complete', week: 'Week 8' },
    { milestone: 'Final Completion', week: 'Week 12' },
  ];

  const BreakdownRow = ({ 
    label, 
    amount 
  }: { 
    label: string; 
    amount: number 
  }) => (
    <View className="flex-row justify-between py-3 border-b border-gray-200">
      <Text className="text-base text-gray-600">{label}</Text>
      <Text className="text-base font-bold text-gray-900">
        {formatCurrency(amount)}
      </Text>
    </View>
  );
  
  const totalAmount = breakdownItems.reduce((sum, item) => sum + item.amount, 0);

  const TimelineItem = ({ 
    milestone, 
    week 
  }: { 
    milestone: string; 
    week: string 
  }) => (
    <View className="flex-row items-center mb-6">
      <View className="w-10 h-10 rounded-full border-2 border-gray-300 mr-4" />
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900">{milestone}</Text>
        <Text className="text-sm text-gray-500 mt-1">{week}</Text>
      </View>
    </View>
  );

  return (
    <AppLayout screenName="Project Proposal">
      <View className="bg-white rounded-2xl p-5 m-4 ">
        <View className="flex-row justify-between items-start mb-3">
          <Text className="text-2xl font-bold text-gray-900">
            BuildRight Inc.
          </Text>
          <View className="bg-blue-100 rounded-full px-3 py-1">
            <Text className="text-blue-600 text-xs font-semibold">New</Text>
          </View>
        </View>

        <Text className="text-base text-gray-600 mb-2">
          Amount: <Text className="font-bold text-green-600">{formatCurrency(totalAmount)}</Text>
        </Text>

        <Text className="text-base text-gray-600 mb-4">
          Estimated Duration: 12 months
        </Text>

        <Text className="text-sm text-gray-500 leading-6">
          Includes premium materials and a dedicated project manager that will help you. 
          Focus on timeline efficiency, Includes premium materials and a dedicated project 
          manager that will help you. Includes premium materials and a dedicated project 
          manager that will help you.
        </Text>
      </View>
      
      <View className="bg-white rounded-2xl p-5 m-4 ">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Project Breakdown
        </Text>

        {breakdownItems.map((item, index) => (
          <BreakdownRow key={index} label={item.label} amount={item.amount} />
        ))}

        <View className="flex-row justify-between pt-4 mt-2">
          <Text className="text-lg font-bold text-gray-900">Total</Text>
          <Text className="text-lg font-bold text-gray-900">
            {formatCurrency(totalAmount)}
          </Text>
        </View>
      </View>
      
      <View className="bg-white rounded-2xl p-5 m-4">
        <Text className="text-xl font-bold text-gray-900 mb-6">
          Project Timeline
        </Text>

        {timelineItems.map((item, index) => (
          <TimelineItem key={index} milestone={item.milestone} week={item.week} />
        ))}
      </View>

      <View className="mx-4 my-6">
        <GradientButton onPress={handlecontractdetails} title="Accept Proposal" />
        <View className="pt-4">
          <PrimaryButton 
            onPress={handlerevision} 
            title="Revisions" 
            textColor="black" 
            backgroundColor="white" 
            className="border border-gray-200"
          />
        </View>
      </View>
    </AppLayout>
  )
}

export default Proposalscreen