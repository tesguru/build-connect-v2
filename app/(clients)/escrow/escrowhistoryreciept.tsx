import React, { useState } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import { AvatarImage } from '@/constants/image';
import { TransactionCard } from '@/components/Cards/TransactionCard';
import AppLayout from '@/components/Layouts/AppLayout';


const EscrowHistoryReciept = () => {
  const [activeTab, setActiveTab] = useState('past');

  const todayTransactions = [
    { recipient: 'KEMMIT BUILD LTD', amount: '942,420.00', time: 'Released' },
    { recipient: 'DAPO BUILD LTD', amount: '408,180.00', time: 'Released' }
  ];

  const yesterdayTransactions = [
    { recipient: 'KEMMIT BUILD LTD', amount: '942,420.00', time: 'Released' },
    { recipient: 'DAPO BUILD LTD', amount: '408,180.00', time: 'Released' },
    { recipient: 'AKEEM VENTURE', amount: '798,359.00', time: 'Released' }
  ];

  return (
    <AppLayout screenName='History & Reciept'>
          <View className=" ">
 <TouchableOpacity 
        onPress={() => console.log('Account pressed')}
        className="bg-white p-4 flex-row items-center gap-3 shadow-sm"
        activeOpacity={0.7}
      >
        <View className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">
          <Image 
            source={AvatarImage} 
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900">ONABANJO ADEBOLA...</Text>
          <Text className="text-xs text-gray-400">12041467890</Text>
        </View>
        <Text className="text-gray-400 text-lg">▼</Text>
      </TouchableOpacity>

  
      <View className="bg-white px-4 flex-row border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => setActiveTab('past')}
          className="flex-1 py-3 items-center"
          activeOpacity={0.7}
        >
          <Text className={`text-lg font-intersemibold ${activeTab === 'past' ? 'text-blue-600' : 'text-gray-500'}`}>
            Past
          </Text>
          {activeTab === 'past' && <View className="absolute bottom-0 h-0.5 w-full bg-blue-600" />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setActiveTab('upcoming')}
          className="flex-1 py-3 items-center"
          activeOpacity={0.7}
        >
          <Text className={`text-lg font-intersemibold ${activeTab === 'upcoming' ? 'text-blue-600' : 'text-gray-500'}`}>
            Upcoming
          </Text>
          {activeTab === 'upcoming' && <View className="absolute font-intersemibold bottom-0 h-0.5 w-full bg-blue-600" />}
        </TouchableOpacity>
      </View>


      <ScrollView className="flex-1 p-4">
        <Text className="text-lg font-interbold text-gray-900 mb-3">Today</Text>
        {todayTransactions.map((tx, idx) => (
          <TransactionCard key={`today-${idx}`} {...tx} />
        ))}

        <Text className="text-lg font-interbold text-gray-900 mb-3 mt-6">Yesterday</Text>
        {yesterdayTransactions.map((tx, idx) => (
          <TransactionCard key={`yesterday-${idx}`} {...tx} />
        ))}
      </ScrollView>
    </View>
    </AppLayout>

  );
};

export default EscrowHistoryReciept;