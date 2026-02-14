import React from 'react';
import { View, Text } from 'react-native';

interface TransactionCardProps {
  recipient: string;
  amount: string;
  time: string;
}

export const TransactionCard = ({ recipient, amount, time }: TransactionCardProps) => {
  return (
    <View className="flex-row items-center justify-between bg-white p-4 rounded-2xl mb-3 ">
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
          <Text className="text-blue-500 text-lg">↑</Text>
        </View>
        <View>
          <Text className="text-sm font-intersemibold text-gray-900">to {recipient}</Text>
          <Text className="text-xs text-gray-500">{time}</Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-sm font-interbold text-gray-900">-₦{amount}</Text>
        <View className="bg-red-50 px-2 py-1 rounded mt-1">
          <Text className="text-xs text-red-500 font-intersemibold font-medium">Debit</Text>
        </View>
      </View>
    </View>
  );
};