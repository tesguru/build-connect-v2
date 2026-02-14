import { useEffect, useState } from "react";
import { Text } from "react-native";
import { useAuthStore } from "@/store/Authstore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/RootNavigator";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const { isLogin } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useEffect(() => {
    async function load() {

      await new Promise((res) => setTimeout(res, 200)); 
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <Text>Loading...</Text>;
  if (!isLogin) return <Text>Access Denied. Please log in.</Text>;

  return <>{children}</>; 
}
