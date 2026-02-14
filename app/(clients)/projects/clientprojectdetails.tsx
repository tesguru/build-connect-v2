
import AppLayout from '@/components/Layouts/AppLayout'
import Bids from '@/components/PagesComponent/Dashboard/Client/ProjectsComponent/Bids'
import Milestone from '@/components/PagesComponent/Dashboard/Client/ProjectsComponent/Milestone'
import Overview from '@/components/PagesComponent/Dashboard/Client/ProjectsComponent/Overview'
import { useRoute } from '@react-navigation/native'
import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'


const ClientProjectDetails = () => {
  const [activeTab, setActiveTab] = useState('Overview')
 const route = useRoute();
  const { projectId } = route.params as { projectId: string };
    console.log("projectid" , projectId)
  const tabs = [
    { name: 'Overview', component:<Overview projectId = {projectId}/> },
    { name: 'Bids', component: <Bids projectId={projectId}/>},
    { name: 'Milestones', component: <Milestone projectId={projectId}/>},
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

export default ClientProjectDetails
