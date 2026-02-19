import { View, Text } from 'react-native';
import React, { useState } from 'react';
import { formatCurrency } from '@/core/utils';
import AppLayout from '@/components/Layouts/AppLayout';
import GradientButton from '@/components/Buttons/GradientButton';
import PrimaryButton from '@/components/Buttons/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBids } from '@/core/hooks/UseBids';
import AcceptProposalModal from '@/components/Miscallaneous/AcceptProposalModal';

import Toast from 'react-native-toast-message';
import DeclineProposalModal from '@/components/Miscallaneous/DeclineProposalModal';

const Proposalscreen = () => {
  const router = useRouter();
  const { bidId, companyName, projectTitle } = useLocalSearchParams<{ bidId: string; companyName: string, projectTitle: string }>();
  const { singleBidQuery, respondToBidMutation, respondBidSucess, createContractMutation, contractSuccess, contractData  } = useBids();

  const { data, isLoading } = singleBidQuery(bidId);
  const bidsData = data?.data?.data || {};
  const milestones = bidsData.milestones || [];


  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const totalAmount = milestones.reduce(
    (sum: number, item: any) => sum + parseFloat(item.paymentAmount || 0),
    0
  );


   const handleRevision = () => router.push({
  pathname: '/revisionscreen/revisionscreen',
  params: { 
    bidId: bidId, 
    companyName: companyName, 
    projectTitle: projectTitle 
  }
});

  // Accept
  const handleAcceptPress = () => setAcceptModalVisible(true);
  const handleAcceptCancel = () => setAcceptModalVisible(false);

  const handleConfirm = async () => {
  
      setIsConfirming(true);
      respondToBidMutation.mutate({ status: 'accepted', bidId: bidId});
      createContractMutation.mutate({bidId});

      


      if(respondBidSucess === false && contractSuccess === true){
   Toast.show({
        type: 'success',
        text1: 'Bid Accepted Successfully',
        text2: 'You can now move to sign the contract agreement',
      });

      setAcceptModalVisible(false);

      router.push({
        pathname: '/projects/contractscreen',
        params: {
          companyName,
          proposedTimeline: bidsData.proposedTimeline,
          bidsData: JSON.stringify(bidsData),
          contractData: JSON.stringify(contractData),
          projectTitle,
        },
      });
      }
  };
 

  const handleDeclinePress = () => setDeclineModalVisible(true);
  const handleDeclineCancel = () => setDeclineModalVisible(false);

  const handleDeclineConfirm = async () => {
    try {
      setIsDeclining(true);

      await respondToBidMutation.mutateAsync({ status: 'declined' });

      Toast.show({
        type: 'success',
        text1: 'Bid Declined',
        text2: 'The builder has been notified',
      });

      setDeclineModalVisible(false);
      router.back();
    } catch (error) {
      console.error('Failed to decline proposal:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Decline Bid',
        text2: 'Please try again',
      });
    } finally {
      setIsDeclining(false);
    }
  };


  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const BreakdownRow = ({ label, amount }: { label: string; amount: string }) => (
    <View className="flex-row justify-between py-3 border-b border-gray-200">
      <Text className="text-base text-gray-600">{label}</Text>
      <Text className="text-base font-bold text-gray-900">
        {formatCurrency(parseFloat(amount || '0'))}
      </Text>
    </View>
  );

  const TimelineItem = ({ milestone, date }: { milestone: string; date: string }) => (
    <View className="flex-row items-center mb-6">
      <View className="w-10 h-10 rounded-full border-2 border-gray-300 mr-4" />
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900">{milestone}</Text>
        <Text className="text-sm text-gray-500 mt-1">{formatDate(date)}</Text>
      </View>
    </View>
  );


  return (
    <>
      <AppLayout screenName="Project Proposal">
        {/* Proposal Header Card */}
        <View className="bg-white rounded-2xl p-5 m-4">
          <View className="flex-row justify-between items-start mb-3">
            <Text className="text-2xl font-bold text-gray-900">{companyName}</Text>
            <View className="bg-blue-100 rounded-full px-3 py-1">
              <Text className="text-blue-600 text-xs font-semibold">New</Text>
            </View>
          </View>

          <Text className="text-base text-gray-600 mb-2">
            Amount:{' '}
            <Text className="font-bold text-green-600">
              {formatCurrency(parseFloat(bidsData.bidAmount || '0'))}
            </Text>
          </Text>

          <Text className="text-base text-gray-600 mb-2">
            Proposed Timeline:{' '}
            <Text className="font-bold text-gray-900">{bidsData.proposedTimeline}</Text>
          </Text>

          <Text className="text-sm text-gray-500 leading-6 mt-2">{bidsData.proposal}</Text>
        </View>

        {/* Project Breakdown Card */}
        <View className="bg-white rounded-2xl p-5 m-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Project Breakdown</Text>

          {milestones.length > 0 ? (
            <>
              {milestones.map((item: any, index: number) => (
                <BreakdownRow key={index} label={item.milestoneName} amount={item.paymentAmount} />
              ))}
              <View className="flex-row justify-between pt-4 mt-2">
                <Text className="text-lg font-bold text-gray-900">Total</Text>
                <Text className="text-lg font-bold text-gray-900">{formatCurrency(totalAmount)}</Text>
              </View>
            </>
          ) : (
            <Text className="text-sm text-gray-400 text-center py-4">No breakdown available</Text>
          )}
        </View>

        {/* Project Timeline Card */}
        <View className="bg-white rounded-2xl p-5 m-4">
          <Text className="text-xl font-bold text-gray-900 mb-6">Project Timeline</Text>

          {milestones.length > 0 ? (
            milestones.map((item: any, index: number) => (
              <TimelineItem key={index} milestone={item.milestoneName} date={item.completionDate} />
            ))
          ) : (
            <Text className="text-sm text-gray-400 text-center py-4">No timeline available</Text>
          )}
        </View>

      
        <View className="mx-4 my-6 gap-3">
          <GradientButton onPress={handleAcceptPress} title="Accept Proposal" />
          <PrimaryButton
            onPress={handleRevision}
            title="Request Revision"
            textColor="black"
            backgroundColor="white"
            className="border border-gray-200"
          />
          <PrimaryButton
            onPress={handleDeclinePress}
            title="Decline Proposal"
            textColor="white"
            backgroundColor="#EF4444"
          />
        </View>
      </AppLayout>

  
      <AcceptProposalModal
        visible={acceptModalVisible}
        companyName={companyName ?? ''}
        bidAmount={bidsData.bidAmount ?? '0'}
        onCancel={handleAcceptCancel}
        onConfirm={handleConfirm}
        isLoading={isConfirming}
      />

    
      <DeclineProposalModal
        visible={declineModalVisible}
        companyName={companyName ?? ''}
        onCancel={handleDeclineCancel}
        onConfirm={handleDeclineConfirm}
        isLoading={isDeclining}
      />
    </>
  );
};

export default Proposalscreen;