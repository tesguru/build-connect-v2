import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { CustomSurvey } from '@/constants/image';

const OOPS_LINE = 'Oops';

interface EmptyComponentProps {
  title?: string;
  description: string;
}

const EmptyComponent: React.FC<EmptyComponentProps> = ({ title, description }) => {
  return (
    <View className="bg-white mx-2 rounded-xl mt-1 p-4 shadow-md" style={{ shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
      <View>
        {title ? (
          <View className="flex-row justify-between items-center">
            <Text className="font-worksanssemibold text-2xl">{title}</Text>
            <TouchableOpacity>
              <Text className="font-work-sans text-blue-500">See all</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View className="flex-row justify-center items-center py-20">
          <Image
            source={CustomSurvey}
            resizeMode="contain"
            style={{ width: 80, height: 80 }}
          />
        </View>

        <View className="items-center">
          <Text className="font-worksanssemibold text-2xl">{OOPS_LINE}</Text>
          <Text className="font-work-sans text-base text-gray-500 text-center mt-2 px-4">
            {description}
          </Text>
        </View>

      </View>
    </View>
  );
};

export default EmptyComponent;
