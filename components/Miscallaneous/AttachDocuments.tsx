import { View, Text, Image } from 'react-native'
import React from 'react'
import { DownloadIcon, ReportBlueIcon } from '@/constants/icon'


const AttachDocuments = () => {
  return (
    <View className="flex-row justify-between bg-white  shadow-lg rounded-xl p-4">
        <View className="flex-row gap-4">
              <View className="pt-2"><Image style={{width:17, height:17}} resizeMode='contain' source={ReportBlueIcon}/></View>
        <View><Text className="font-inter">Architectural_Plans.pdf</Text>
        <Text className="font-inter">24mb</Text>
        </View>
        </View>
    <View>
        <Image style={{width:17, height:17}} resizeMode='contain' source={DownloadIcon}/>
    </View>
    </View>
  )
}

export default AttachDocuments