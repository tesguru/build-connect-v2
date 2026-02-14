import { useAuthStore } from "@/store/Authstore";
import { useNavigation } from "@react-navigation/native";
import { AuthService } from "../services/auth/AuthService";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";

export const useProperty = () => {
  const [addPropertySucess, setPropertySuccess] = useState(false);

  const { setAuthData } = useAuthStore();
  
 
  const submitProperty = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (res: any) => {
      const loginData = res?.data;
      if (
        (loginData.statusCode === 200 || loginData.statusCode === 201) &&
        loginData.success === true
      ) {
        const { authToken, refreshToken } = loginData.data;
        setAuthData(authToken, refreshToken);
        Alert.alert("Login Sucessful");
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Submit Failed",
        text2: error instanceof Error ? error.message : "Invalid credentials",
      });
          setPropertySuccess(true);
    },

  });


  return {
    submitProperty,
addPropertySucess,
  };
};
