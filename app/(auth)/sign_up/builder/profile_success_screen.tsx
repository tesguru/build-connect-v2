import React from "react";
import { View } from "react-native";
import KeyboardAvoidingLayout from "@/components/Layouts/KeyboardAvoidLayout";
import SuccessScreen from "@/components/Notifications/SucessScreen";



export default function ProfileSuccessScreen() {
  return (
    <KeyboardAvoidingLayout androidExtraPadding={40}>
      <View className="flex-1">
        <SuccessScreen
          title="You're all set!"
          message="Congratulations! Your account has been created successfully."
          navigateTo="Dashboard"
        />
      </View>
    </KeyboardAvoidingLayout>
  );
}
