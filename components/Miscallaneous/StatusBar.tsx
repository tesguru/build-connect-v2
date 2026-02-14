import { View, Text } from 'react-native'
import React from 'react'

const StatusBar = ({title}:any) => {
  return (
     <View className="bg-blue-100 py-1 px-4  rounded-xl">
              <Text className="font-inter text-blue-400">{title}</Text>
          </View>
  )
}

export default StatusBar