import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface BidsCardProps {
  projectName: string;
  bidId: string | number;
  projectId: string | number;
  amount: string | number;
  bidStatus?: string;
  paymentStatus?: string;
  image?: any;
  contractId?: string;
  onStartWork?: () => void;
}

export const BidsCard = ({
  projectName,
  bidId,
  amount,
  bidStatus = 'pending',
  image,
  contractId,
  onStartWork,
}: BidsCardProps) => {
  const router = useRouter();

  const gotoContractDetails = () => {
    router.push({
      pathname: '/contractdetails/contractdetails',
      params: { contractId, bidId }
    });
  };

  const viewBidDetails = () => {
   
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'text-gray-400';
    switch (status.toLowerCase()) {
      case 'accepted': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'rejected': return 'text-red-400';
      case 'under_review': return 'text-blue-400';
      case 'shortlisted': return 'text-purple-400';
      case 'withdrawn': return 'text-gray-400';
      case 'revision_requested': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return 'Pending';
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <View className="flex-row mx-1">
      <View className="flex-row w-full">

        {/* Image */}
        <View className="w-1/3 items-center">
          {image ? (
            <Image
              source={image}
              className="rounded-xl"
              style={{ width: 100, height: 100 }}
              resizeMode="cover"
            />
          ) : (
            <View
              className="rounded-xl bg-gray-200 items-center justify-center"
              style={{ width: 100, height: 100 }}
            >
              <Text className="text-gray-400 text-xs">No Image</Text>
            </View>
          )}
        </View>

        {/* Right side — all content in one column */}
        <View className="flex-1 flex-col justify-between">

          {/* Top Info Row */}
          <View className="">
            <View>
              <Text className="font-interbold text-lg">{projectName}</Text>
              <Text className="font-inter text-lg pt-1">#{amount}</Text>
            </View>
            <View className="py-2">
              <Text className={`font-inter text-xs ${getStatusColor(bidStatus)}`}>
                {formatStatus(bidStatus)}
              </Text>
             
            </View>
          </View>

          {/* Buttons Row — both in the same column at the bottom */}
        <View className="flex-row gap-2 mt-4">
  {contractId && (
    <TouchableOpacity
      className="flex-1 bg-blue-600 rounded-lg py-2 items-center"
      onPress={gotoContractDetails}
    >
      <Text className="text-white font-intersemibold text-xs">
        View Contract
      </Text>
    </TouchableOpacity>
  )}

  <TouchableOpacity
    className="flex-1 bg-white border border-gray-300 rounded-lg py-2 items-center"
    onPress={viewBidDetails}
  >
    <Text className="text-gray-800 font-intersemibold text-xs">
      View Bid Details
    </Text>
  </TouchableOpacity>
</View>

        </View>

      </View>
    </View>
  );
};