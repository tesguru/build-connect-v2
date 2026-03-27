import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from 'react-native'
import StatusBar from '../Miscallaneous/StatusBar'

type PropertiesComponentProps = {
  image: ImageSourcePropType
  title: string
  status: string
  address: string
  price: string | number
  onView: () => void
  onEdit: () => void
}

const PropertiesComponent = ({
  image,
  title,
  status,
  address,
  price,
  onView,
  onEdit,
}: PropertiesComponentProps) => {
  return (
    <View className="mx-4 bg-white rounded-3xl shadow-lg overflow-hidden">

      <View>
        <Image
          style={{ width: '100%', height: 150 }}
          source={image}
          resizeMode="cover"
        />
      </View>

      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="font-interbold text-xl flex-1">{title}</Text>
          <StatusBar title={status} />
        </View>

        <View className="mb-3">
          <Text className="text-gray-500 font-inter text-sm">{address}</Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="font-interbold text-xl">
            ₦{typeof price === 'number' ? price.toLocaleString() : price}
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity className="p-2" onPress={onView}>
              <Ionicons name="eye-outline" size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2" onPress={onEdit}>
              <Ionicons name="create-outline" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

    </View>
  )
}

export default PropertiesComponent