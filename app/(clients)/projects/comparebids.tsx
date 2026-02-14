import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { formatCurrency } from '@/core/utils';
import AppLayout from '@/components/Layouts/AppLayout';
import { Star } from 'lucide-react-native';
import GradientButton from '@/components/Buttons/GradientButton';

const CompareBidsScreen = () => {

  const bidsData = [
    {
      id: 1,
      name: 'BuildRight Inc',
      rating: 4.5,
      reviews: 81,
      amount: 85000000,
      timeline: '12 months',
      warranty: '1 year on workmanship',
    },
    {
      id: 2,
      name: 'Apex Construction',
      rating: 4.2,
      reviews: 110,
      amount: 102000000,
      timeline: '9 months',
      warranty: '2 years on workmanship',
    },
    {
      id: 3,
      name: 'Quality Builders',
      rating: 4.7,
      reviews: 95,
      amount: 78000000,
      timeline: '14 months',
      warranty: '1.5 years on workmanship',
    },
  ];

  const [selectedBids, setSelectedBids] = useState<number[]>([1, 2]); 

  const toggleBid = (bidId: number) => {
    if (selectedBids.includes(bidId)) {
      setSelectedBids(selectedBids.filter(id => id !== bidId));
    } else if (selectedBids.length < 2) {
  
      setSelectedBids([...selectedBids, bidId]);
    }
  };

  const comparingBids = bidsData.filter(bid => selectedBids.includes(bid.id));


  const ComparisonSection = ({ 
    title, 
    renderContent 
  }: { 
    title: string; 
    renderContent: (bid: typeof bidsData[0]) => React.ReactNode 
  }) => (
    <View className="mt-6">
      <Text className="pl-4 font-interbold text-xl">{title}</Text>
      <View className="border border-gray-200 mt-4">
        <View className="flex-row justify-between px-4 py-4">
          {comparingBids.map(bid => (
            <View key={bid.id} className="flex-1 px-2">
              {renderContent(bid)}
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <AppLayout screenName='Compare bids'>
      <View className="">
 
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="border-b border-gray-200 px-4 py-3"
        >
          {bidsData.map(bid => {
            const isSelected = selectedBids.includes(bid.id);
            return (
              <TouchableOpacity
                key={bid.id}
                onPress={() => toggleBid(bid.id)}
                className={`rounded-full px-4 py-2 mr-2 flex flex-row items-center ${
                  isSelected ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <Text className={`font-inter mr-2 ${
                  isSelected ? 'text-white' : 'text-gray-600'
                }`}>
                  {bid.name}
                </Text>
                {isSelected && (
                  <Text className="text-white text-lg">✓</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {comparingBids.length === 2 ? (
          <ScrollView className="pb-6">
        
            <ComparisonSection 
              title="Builder Details"
              renderContent={(bid) => (
                <>
                  <Text className="font-inter text-lg">{bid.name}</Text>
                  <View className="flex-row items-center gap-2 mt-2">
                    <Star size={20} fill='#FFD700' color='#FFD700' />
                    <Text className="text-sm font-inter text-gray-700">
                      {bid.rating} ({bid.reviews}+)
                    </Text>
                  </View>
                </>
              )}
            />

            <ComparisonSection 
              title="Bid Amount"
              renderContent={(bid) => (
                <Text className="font-interbold text-2xl text-green-600">
                  {formatCurrency(bid.amount)}
                </Text>
              )}
            />


            <ComparisonSection 
              title="Project Timeline"
              renderContent={(bid) => (
                <Text className="font-inter text-base text-gray-900">
                  {bid.timeline}
                </Text>
              )}
            />

       
            <ComparisonSection 
              title="Warranty"
              renderContent={(bid) => (
                <Text className="font-inter text-base text-gray-900">
                  {bid.warranty}
                </Text>
              )}
            />
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-gray-500 font-inter text-center text-base">
              Please select 2 bids to compare
            </Text>
          </View>
        )}

<View className="flex-row gap-10 mx-4 ">
    <View className="flex-1">
   <GradientButton title="Accept Bids" onPress={() => {}}></GradientButton>
    </View>

     <View className="flex-1">
   <GradientButton title="Accept Bids" onPress={function (): void {
              throw new Error('Function not implemented.');
            } }></GradientButton>
    </View>
 

</View>
      </View>
    </AppLayout>
  )
}

export default CompareBidsScreen