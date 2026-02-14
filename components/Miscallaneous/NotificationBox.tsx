import { UserNotify } from '@/constants/image';
import React from 'react';
import { View, Text, Image } from 'react-native';


const NotificationBox = () => {
  return (
    <View className="border bg-white border-gray-300 mx-3 rounded-xl mt-8 p-4">
      <View className="flex-row gap-4 items-start">
        <Image
          style={{ width: 70, height: 70 }}
          source={UserNotify}
          resizeMode="contain"
        />
        <View className="flex-1 p-4 justify-center">
          <Text className="font-inter flex-wrap">
            3 new proposals received for Kitchen Renovation
          </Text>
        </View>
      </View>
      <Text className="font-inter text-right pr-2 text-gray-500 mt-1">
        2 hours
      </Text>
    </View>
  );
};

export default NotificationBox;
