import AppLayout from "@/components/Layouts/AppLayout";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import ExpressionOfInterest from "./expressionofinterest";
import InvitedInvitations from "./invitedbids";
import MyBids from "./mybids";

type TabName = "Bids" | "InvitedBids" | "EOI";

const BidsTab = () => {
  const [activeTab, setActiveTab] = useState<TabName>("Bids");

  const tabs: {
    name: TabName;
    displayName: string;
    component: React.ReactNode;
  }[] = [
    { name: "Bids", displayName: "Bids", component: <MyBids /> },
    {
      name: "InvitedBids",
      displayName: "Invited Bids",
      component: <InvitedInvitations />,
    },
    {
      name: "EOI",
      displayName: "Expression of Interest",
      component: <ExpressionOfInterest />,
    },
  ];

  const activeDisplayName =
    tabs.find((tab) => tab.name === activeTab)?.displayName ?? activeTab;

  return (
    <AppLayout screenName={activeDisplayName}>
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
                      ? "text-blue-600 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {tab.displayName}
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
            style={{ display: activeTab === tab.name ? "flex" : "none" }}
          >
            {tab.component}
          </View>
        ))}
      </View>
    </AppLayout>
  );
};

export default BidsTab;
