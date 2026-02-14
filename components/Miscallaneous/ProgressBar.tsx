import React from 'react';
import { View, Text } from 'react-native';

const ProgressBar = ({ progress = 69 }) => {
  return (
    <View className="w-full px-4 py-3">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-interbold text-gray-900">Progress</Text>
        <Text className="text-lg font-interbold text-gray-900">{progress}%</Text>
      </View>
      
      <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <View 
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
};

export default ProgressBar;