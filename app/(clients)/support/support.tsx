import GradientButton from "@/components/Buttons/GradientButton";
import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Clipboard,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const SupportScreen = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const router = useRouter();
  const faqItems: FAQItem[] = [
    {
      id: "1",
      question: "How do i invite builders?",
      answer:
        "You can invite builders by going to your project and clicking the 'Invite Builder' button. Enter the builder's email address and send the invitation.",
    },
    {
      id: "2",
      question: "How do payments work?",
      answer:
        "Payments are processed securely through our escrow system. Funds are held until project milestones are completed and verified.",
    },
    {
      id: "3",
      question: "Can i modify project milestones after creation?",
      answer:
        "Yes, you can modify project milestones by going to your project details and clicking 'Edit Milestones'. Note that changes require builder approval.",
    },
    {
      id: "4",
      question: "What if I have a dispute with a builder?",
      answer:
        "If you have a dispute, you can submit a support ticket or contact our support team directly. We'll help mediate and resolve the issue.",
    },
  ];

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleCopyEmail = () => {
    Clipboard.setString("support@buildconnect.com");
    Alert.alert("Copied", "Email address copied to clipboard");
  };

  const handleSubmitTicket = () => {
    router.push("/support/submitticket");
  };

  const handleMyTickets = () => {
    router.push("/support/myticket");
  };

  return (
    <AppLayout screenName="Help/Support" fullHeightContent>
      <View className="flex-1 bg-white">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="px-4 pt-6">
            <Text className="font-interbold text-lg mb-4 text-gray-900">
              FAQ/Help Center
            </Text>
            {faqItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleFAQ(item.id)}
                className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="font-inter text-base text-gray-900 flex-1 pr-4">
                    {item.question}
                  </Text>
                  <Image
                    source={require("@/assets/icons/arrow-left.png")}
                    className="w-5 h-5"
                    style={{
                      tintColor: "#9CA3AF",
                      transform: [
                        { rotate: expandedFAQ === item.id ? "90deg" : "0deg" },
                      ],
                    }}
                  />
                </View>
                {expandedFAQ === item.id && (
                  <Text className="font-inter text-sm text-gray-600 mt-3">
                    {item.answer}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Support Ticket Section */}
          <View className="px-4 mt-6">
            <Text className="font-interbold text-lg mb-4 text-gray-900">
              Support Ticket
            </Text>
            <View className="gap-3">
              <GradientButton
                title="Submit a Ticket"
                onPress={handleSubmitTicket}
              />
              <TouchableOpacity
                onPress={handleMyTickets}
                className="bg-white border-2 border-blue-600 rounded-full py-4 items-center"
              >
                <Text className="text-blue-600 font-interbold text-base">
                  My Ticket
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Need Immediate Help Section */}
          <View className="px-4 mt-8">
            <Text className="font-interbold text-lg mb-4 text-gray-900">
              Need Immediate Help?
            </Text>
            <View className="bg-gray-50 rounded-xl p-4 flex-row items-center justify-between border border-gray-200">
              <View className="flex-row items-center flex-1">
                <Image
                  source={require("@/assets/icons/message-question.png")}
                  className="w-5 h-5 mr-3"
                  style={{ tintColor: "#6B7280" }}
                />
                <Text className="font-inter text-base text-gray-700">
                  Email: support@buildconnect.com
                </Text>
              </View>
              <TouchableOpacity onPress={handleCopyEmail}>
                <Text className="text-blue-600 font-interbold text-sm">
                  Copy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </AppLayout>
  );
};

export default SupportScreen;
