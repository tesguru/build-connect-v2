import AppLayout from '@/components/Layouts/AppLayout'

import Overview from '@/components/PagesComponent/Dashboard/Client/ProjectsComponent/Overview'
import { useRoute } from '@react-navigation/native'
import React, { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import BuilderContractdetailsScreen from './contractdetails'
import Milestone from './milestone'
import ReviewSumaryScreen from './ReviewSummary'

type TabName = 'Overview' | 'Bids' | 'Milestones' | 'Contract' | 'Review Summary'

const VALID_TABS: TabName[] = ['Overview', 'Bids', 'Milestones', 'Review Summary']

const isValidTab = (tab?: string): tab is TabName =>
  VALID_TABS.includes(tab as TabName)

const ProjectDetails = () => {
  const route = useRoute()
  const { projectId, initialTab, contractId, bidId } = route.params as {
    projectId: string
    contractId: string;
    bidId:string;
    initialTab?: string
  }

  const [activeTab, setActiveTab] = useState<TabName>(
    isValidTab(initialTab) ? initialTab : 'Overview'
  )

  const tabs: { name: TabName; component: React.ReactNode }[] = [
    { name: 'Overview',   component: <Overview projectId={projectId} /> },
    { name: 'Milestones', component: <Milestone projectId={projectId} /> },
    { name: 'Contract',    component: <BuilderContractdetailsScreen bidId={bidId} contractId={contractId} /> },
        { name: 'Review Summary',    component: <ReviewSumaryScreen bidId={bidId} contractId={contractId} /> },
  ]

  return (
    <AppLayout screenName={activeTab}>
      <View>
    
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

       
        {tabs.map((tab) => (
          <View
            key={tab.name}
            style={{ display: activeTab === tab.name ? 'flex' : 'none' }}
          >
            {tab.component}
          </View>
        ))}
      </View>
    </AppLayout>
  )
}

export default ProjectDetails;