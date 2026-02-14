
import AppLayout from '@/components/Layouts/AppLayout'
import Bids from '@/components/PagesComponent/Dashboard/Builders/ProjectsComponent/Bids'
import Overview from '@/components/PagesComponent/Dashboard/Builders/ProjectsComponent/Overview'
import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'


const Projects = () => {
  const [activeTab, setActiveTab] = useState('Overview')

  const tabs = [
    { name: 'Overview', component:<Overview/> },
    { name: 'Bids', component: <Bids/>},
    { name: 'Milestones', component: <Text>Malam</Text> },
    { name: 'Media', component: <Text>Yaya</Text> },
  ]

  const activeComponent = tabs.find(tab => tab.name === activeTab)?.component

  return (
    <AppLayout screenName={activeTab}>
      <View className="">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-row border-b border-gray-200">
            {tabs.map((tab) => (
              <Pressable
                key={tab.name}
                onPress={() => setActiveTab(tab.name)}
                className="px-8 py-4 relative"
              >
                <Text
                  className={`text-md font-inter ${
                    activeTab === tab.name
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  {tab.name}
                </Text>
                {activeTab === tab.name && (
                  <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>
        <View>{activeComponent}</View>
      </View>
    </AppLayout>
  )
}

export default Projects
