import { View, Text } from 'react-native'
import React from 'react'
import ProgressBar from '../../../../Miscallaneous/ProgressBar'
import ProjectTimeline from '../../../../Cards/ProjectTimeline'

const Overview = () => {
  return (
    <View>
     <View className="pt-4 ">
        <Text className="font-interbold px-4 text-2xl">Project Description</Text>
        <Text className="font-inter px-4 pt-4">Lorem ipsum dolor sit amet consectetur. Laoreet elit quisque pellentesque eget diam. Mattis consectetur nulla ullamcorper proin, Mattis consectetur nulla ullamcorper proin  egestas curabitur dolor scelerisque dignissim. Mattis consectetur nulla ullamcorper proin </Text>
        <ProgressBar/>
        <View className="px-4  py-4 flex-row justify-between">
            <Text className="font-interbold text-lg">Budget Utilized</Text>
            <Text className="font-interbold text-lg">60%</Text>
        </View>
        <View className="px-4  py-4 flex-row justify-between">
            <Text className="font-interbold text-lg">Days Remained</Text>
              <Text className="font-interbold text-lg">49 days</Text>
        </View>
     </View>

     <ProjectTimeline/>

     <View className="p-4 m-4  rounded-xl">
        <Text className="font-interbold text-gray-400  text-xl">Fund in Escrow</Text>
        <Text className="text-xl font-interbold py-3">#17,380,690</Text>
           <Text className="font-inter">Manage by abbey Mortgage Bank</Text>
     </View>
    </View>
  )
}

export default Overview