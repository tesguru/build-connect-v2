import AppLayout from '@/components/Layouts/AppLayout'
import Bids from '@/components/PagesComponent/Dashboard/Client/ProjectsComponent/Bids'
import UpcomingMeetingsScreen from '@/components/PagesComponent/Dashboard/Client/ProjectsComponent/Meeting'
import Milestone from '@/components/PagesComponent/Dashboard/Client/ProjectsComponent/Milestone'
import Overview from '@/components/PagesComponent/Dashboard/Client/ProjectsComponent/Overview'
import { useRoute } from '@react-navigation/native'
import React, { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

type TabName = 'Overview' | 'Bids' | 'Milestones' | 'Meeting'

const VALID_TABS: TabName[] = ['Overview', 'Bids', 'Milestones', 'Meeting']

const isValidTab = (tab?: string): tab is TabName =>
  VALID_TABS.includes(tab as TabName)

const ClientProjectDetails = () => {
  const route = useRoute()
  const { projectId, initialTab } = route.params as {
    projectId: string
    initialTab?: string
  }

  const [activeTab, setActiveTab] = useState<TabName>(
    isValidTab(initialTab) ? initialTab : 'Overview'
  )

  const tabs: { name: TabName; component: React.ReactNode }[] = [
    { name: 'Overview',   component: <Overview projectId={projectId} /> },
    { name: 'Bids',       component: <Bids projectId={projectId} /> },
    { name: 'Milestones', component: <Milestone projectId={projectId} /> },
    { name: 'Meeting',    component: <UpcomingMeetingsScreen projectId={projectId} /> },
  ]

  const activeComponent = tabs.find(tab => tab.name === activeTab)?.component

  return (
    <AppLayout screenName={activeTab}>
      <View>
        {/* ── Tab Bar ── */}
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

        {/* ── Active Tab Content — key forces remount + fresh API call on every tab switch ── */}
        <View key={activeTab}>{activeComponent}</View>
      </View>
    </AppLayout>
  )
}

export default ClientProjectDetails