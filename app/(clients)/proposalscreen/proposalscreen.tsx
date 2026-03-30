import PrimaryButton from '@/components/Buttons/Button';
import GradientButton from '@/components/Buttons/GradientButton';
import AppLayout from '@/components/Layouts/AppLayout';
import AcceptProposalModal from '@/components/Miscallaneous/AcceptProposalModal';
import DeclineProposalModal from '@/components/Miscallaneous/DeclineProposalModal';
import { useBids } from '@/core/hooks/UseBids';
import { useProjects } from '@/core/hooks/useProjects';
import { formatCurrency } from '@/core/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type BidStatus = 'accepted' | 'declined' | 'rejected' | 'pending' | string;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View className="bg-white rounded-2xl p-5 mb-4">
    <Text className="text-lg font-interbold text-gray-900 mb-4">{title}</Text>
    {children}
  </View>
);

const BreakdownRow = ({
  label,
  amount,
  isLast,
}: {
  label: string;
  amount: string;
  isLast?: boolean;
}) => (
  <View
    className={`flex-row justify-between py-3 ${
      !isLast ? 'border-b border-gray-100' : ''
    }`}
  >
    <Text className="text-[15px] text-gray-600 font-inter flex-1 mr-4">{label}</Text>
    <Text className="text-[15px] font-interbold text-gray-900">
      {formatCurrency(parseFloat(amount || '0'))}
    </Text>
  </View>
);

const TimelineItem = ({
  milestone,
  date,
  index,
  isLast,
}: {
  milestone: string;
  date: string;
  index: number;
  isLast: boolean;
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View className="flex-row">
      <View className="items-center mr-4">
        <View className="w-9 h-9 rounded-full bg-blue-50 border-2 border-blue-200 items-center justify-center">
          <Text className="text-blue-600 font-interbold text-xs">{index + 1}</Text>
        </View>
        {!isLast && <View className="w-0.5 flex-1 bg-gray-200 mt-1 mb-1" />}
      </View>
      <View className={`flex-1 ${!isLast ? 'pb-5' : ''}`}>
        <Text className="text-[15px] font-interbold text-gray-900">{milestone}</Text>
        <Text className="text-[13px] text-gray-500 font-inter mt-0.5">
          {formatDate(date)}
        </Text>
      </View>
    </View>
  );
};

const StatusBadge = ({ status }: { status: BidStatus }) => {
  const isAccepted = status === 'accepted';
  const isRejected = status === 'declined' || status === 'rejected';

  return (
    <View
      className={`rounded-full px-3 py-1 ${
        isAccepted ? 'bg-green-50' : isRejected ? 'bg-red-50' : 'bg-blue-50'
      }`}
    >
      <Text
        className={`text-xs font-interbold capitalize ${
          isAccepted
            ? 'text-green-600'
            : isRejected
            ? 'text-red-500'
            : 'text-blue-600'
        }`}
      >
        {status || 'Pending'}
      </Text>
    </View>
  );
};

const RejectedBanner = () => (
  <View className="mt-2 p-5 bg-red-50 rounded-2xl items-center">
    <Text className="font-interbold text-red-500 text-base mb-1">
      Proposal Rejected
    </Text>
    <Text className="font-inter text-gray-500 text-sm text-center leading-5">
      This proposal has been rejected. No further actions are available.
    </Text>
  </View>
);


const Proposalscreen = () => {
  const router = useRouter();

  const { bidId, companyName, projectTitle, projectId } =
    useLocalSearchParams<{
      bidId: string;
      companyName: string;
      projectTitle: string;
      projectId: string;
    }>();

  const { singleBidQuery, respondToBidMutation, createContractMutation } =
    useBids();

  // ── Fetch live project status from API ──────────────────────────────────────
  const { getSingleProjectQuery } = useProjects();
  const { data: projectApiData } = getSingleProjectQuery(projectId);
  const projectStatus: string =
    projectApiData?.data?.data?.status ??
    projectApiData?.data?.status ??
    '';

  const { data, isLoading, error, refetch } = singleBidQuery(bidId);

  const bidsData   = data?.data?.data || {};
  const milestones = bidsData.milestones || [];

  const bidStatus     = (bidsData.status?.toLowerCase() ?? '') as BidStatus;
  const isBidAccepted = bidStatus === 'accepted';
  const isBidRejected = bidStatus === 'declined' || bidStatus === 'rejected';
  const isProjectOngoing = ['in_progress', 'completed', 'cancelled'].includes(
    projectStatus?.toLowerCase()
  );
  const showNoButtons  = isProjectOngoing && !isBidAccepted;
  const showActions    = !isBidAccepted && !isBidRejected && !showNoButtons;

  const totalAmount = milestones.reduce(
    (sum: number, item: any) => sum + parseFloat(item.paymentAmount || 0),
    0
  );

  const [acceptModalVisible,  setAcceptModalVisible]  = useState(false);
  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [isConfirming,        setIsConfirming]        = useState(false);
  const [isDeclining,         setIsDeclining]         = useState(false);
  const [isLoadingContract,   setIsLoadingContract]   = useState(false);

  const handleRevision = () =>
    router.push({
      pathname: '/(clients)/reviewsummary/reviewsummary',
      params: { bidId, companyName, projectTitle, projectId  },
    });

  const handleViewContract = async () => {
    try {
      setIsLoadingContract(true);
      router.push({
        pathname: '/projects/contractscreen',
        params: {
          companyName,
          bidId,
          proposedTimeline: bidsData.proposedTimeline,
          bidsData:         JSON.stringify(bidsData),
          projectTitle,
          projectId
        },
      });
    } catch (error: any) {
      Toast.show({
        type:  'error',
        text1: 'Failed to load contract',
        text2: error?.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsLoadingContract(false);
    }
  };

  const handleAcceptPress  = () => setAcceptModalVisible(true);
  const handleAcceptCancel = () => setAcceptModalVisible(false);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);

      const respondRes = await respondToBidMutation.mutateAsync({
        status: 'accepted',
        bidId,
      });

      const respondOk =
        respondRes?.data?.success === true ||
        respondRes?.data?.statusCode === 200 ||
        respondRes?.data?.statusCode === 201;

      if (!respondOk) {
        Toast.show({
          type:  'error',
          text1: 'Failed to accept bid',
          text2: 'Please try again',
        });
        return;
      }
      Toast.show({
        type:  'success',
        text1: 'Bid Accepted Successfully',
        text2: 'You can now move to sign the contract agreement',
      });

      setAcceptModalVisible(false);

      router.push({
        pathname: '/projects/contractscreen',
        params: {
          companyName,
          proposedTimeline: bidsData.proposedTimeline,
          bidsData:         JSON.stringify(bidsData),
          bidId,
          projectTitle,
        },
      });
    } catch (error: any) {
      Toast.show({
        type:  'error',
        text1: 'Something went wrong',
        text2:
          error?.response?.data?.message ||
          error?.message ||
          'Please try again',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDeclinePress   = () => setDeclineModalVisible(true);
  const handleDeclineCancel  = () => setDeclineModalVisible(false);

  const handleDeclineConfirm = async () => {
    try {
      setIsDeclining(true);
      await respondToBidMutation.mutateAsync({ status: 'rejected', bidId });
      Toast.show({
        type:  'success',
        text1: 'Bid Declined',
        text2: 'The builder has been notified',
      });
      setDeclineModalVisible(false);
      router.back();
    } catch {
      Toast.show({
        type:  'error',
        text1: 'Failed to Decline Bid',
        text2: 'Please try again',
      });
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <>
      <AppLayout screenName="Project Proposal">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 40,
          }}
        >
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
              <Text className="mt-4 text-gray-500 font-inter">
                Loading proposal...
              </Text>
            </View>

          ) : error ? (
            <View className="flex-1 items-center justify-center py-20 px-4">
              <Text className="text-red-500 text-center font-inter mb-4">
                Failed to load proposal. Please try again.
              </Text>
              <PrimaryButton
                onPress={refetch}
                title="Retry"
                textColor="white"
                backgroundColor="#2563eb"
              />
            </View>

          ) : (
            <>
              <View className="bg-white rounded-2xl p-5 mb-4">
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="text-xl font-interbold text-gray-900 flex-1 mr-3">
                    {companyName}
                  </Text>
                  <StatusBadge status={bidStatus} />
                </View>

                <View className="flex-row items-center mb-2">
                  <Text className="text-[14px] text-gray-500 font-inter">
                    Bid Amount:{' '}
                  </Text>
                  <Text className="text-[14px] font-interbold text-green-600">
                    {formatCurrency(parseFloat(bidsData.bidAmount || '0'))}
                  </Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <Text className="text-[14px] text-gray-500 font-inter">
                    Proposed Timeline:{' '}
                  </Text>
                  <Text className="text-[14px] font-interbold text-gray-900">
                    {bidsData.proposedTimeline}
                  </Text>
                </View>

                {bidsData.proposal && (
                  <View className="bg-gray-50 rounded-xl p-3 mt-1">
                    <Text className="text-[13px] text-gray-600 font-inter leading-5">
                      {bidsData.proposal}
                    </Text>
                  </View>
                )}
              </View>

              <SectionCard title="Project Breakdown">
                {milestones.length > 0 ? (
                  <>
                    {milestones.map((item: any, index: number) => (
                      <BreakdownRow
                        key={index}
                        label={item.milestoneName}
                        amount={item.paymentAmount}
                        isLast={index === milestones.length - 1}
                      />
                    ))}
                    <View className="flex-row justify-between pt-4 mt-1 border-t-2 border-gray-900">
                      <Text className="text-base font-interbold text-gray-900">
                        Total
                      </Text>
                      <Text className="text-base font-interbold text-gray-900">
                        {formatCurrency(totalAmount)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text className="text-sm text-gray-400 text-center py-4 font-inter">
                    No breakdown available
                  </Text>
                )}
              </SectionCard>

              <SectionCard title="Project Timeline">
                {milestones.length > 0 ? (
                  milestones.map((item: any, index: number) => (
                    <TimelineItem
                      key={index}
                      milestone={item.milestoneName}
                      date={item.completionDate}
                      index={index}
                      isLast={index === milestones.length - 1}
                    />
                  ))
                ) : (
                  <Text className="text-sm text-gray-400 text-center py-4 font-inter">
                    No timeline available
                  </Text>
                )}
              </SectionCard>

              {isBidAccepted && (
                <View className="mt-2">
                  <GradientButton
                    onPress={handleViewContract}
                    title="Check Contract Details"
                  />
                </View>
              )}

              {isBidRejected && <RejectedBanner />}

              {showActions && (
                <View className="gap-3 mt-2">
                  <GradientButton
                    onPress={handleAcceptPress}
                    title="Accept Proposal"
                    loading={isConfirming}
                  />
                  <PrimaryButton
                    onPress={handleDeclinePress}
                    title="Decline Proposal"
                    textColor="#374151"
                    backgroundColor="white"
                    loading={isDeclining}
                  />
                  <TouchableOpacity
                    onPress={handleRevision}
                    className="items-center py-3"
                  >
                    <Text className="font-inter text-gray-400 text-sm">
                      Not satisfied?{' '}
                      <Text className="text-green-600 font-interbold">
                        Request a revision
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

           
        </ScrollView>
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