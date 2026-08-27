import AppLayout from "@/components/Layouts/AppLayout";
import Bids from "@/components/PagesComponent/Dashboard/Client/ProjectsComponent/Bids";
import Overview from "@/components/PagesComponent/Dashboard/Client/ProjectsComponent/Overview";
import { useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type TabName = "Overview" | "Bids" | "Milestones" | "Meeting";

const VALID_TABS: TabName[] = ["Overview", "Bids", "Milestones", "Meeting"];

const isValidTab = (tab?: string): tab is TabName =>
  VALID_TABS.includes(tab as TabName);

const ClientProjectDetails = () => {
  const route = useRoute();
  const { projectId, initialTab, status } = route.params as {
    projectId: string;
    initialTab?: string;
    status: string;
  };

  const [activeTab, setActiveTab] = useState<TabName>(
    isValidTab(initialTab) ? initialTab : "Overview",
  );

  const TABS = [
    {
      name: "Overview",
      component: <Overview projectId={projectId} />,
    },
    {
      name: "Bids",
      component: <Bids projectId={projectId} status={status} />,
    },
  ];

  return (
    <AppLayout screenName={activeTab}>
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-row border-b border-gray-200">
            {TABS.map((tab) => (
              <Pressable
                key={tab.name}
                onPress={() => setActiveTab(tab.name)}
                className="px-8 py-4 relative"
              >
                <Text
                  className={`text-md font-inter ${
                    activeTab === tab.name
                      ? "text-blue-600 font-semibold"
                      : "text-gray-500"
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

        {TABS.map((tab) => (
          <View
            key={tab.name}
            style={{ display: activeTab === tab.name ? "flex" : "none" }}
          >
            {tab.component}
          </View>
        ))}
      </View>
    </AppLayout>
  );
};

export default ClientProjectDetails;
