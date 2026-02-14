import { QuestionImage } from '@/constants/image'
import React from 'react'
import { View, Text, Image } from 'react-native'

interface EmptyScreenComponentProps {
  message?: string;
}

const EmptyScreenComponent: React.FC<EmptyScreenComponentProps> = ({
  message = 'No projects yet',
}) => {
  return (
    <View className="flex items-center justify-center py-20">
      <View className="py-4">
        <Image style={{ width: 40, height: 40 }} source={QuestionImage} resizeMode="contain" />
      </View>
      <Text className="text-gray-500 font-inter text-base">
        {message}
      </Text>
    </View>
  )
}

export default EmptyScreenComponent