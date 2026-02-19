import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

type AccountSuccessScreenProps = {
  delay?: number; 
};

const AccountSuccessScreen: React.FC<AccountSuccessScreenProps> = ({
  delay = 4000, 
}) => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tab)");
    }, delay);

    return () => clearTimeout(timer);
  }, [router, delay]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
   
      <View className="mb-12">
        <Text style={{ fontSize: 100, textAlign: "center" }}>🥳</Text>
      </View>

  
      <Text className="text-2xl font-interbold text-center text-black leading-8 px-6">
        Congratulations, your account{"\n"}has been created. Let's get you{"\n"}started
      </Text>

      {/* Loading Spinner at Bottom */}
      <View className="absolute bottom-24">
        <ActivityIndicator size="small" color="#000000" />
      </View>
    </View>
  );
};

export default AccountSuccessScreen;