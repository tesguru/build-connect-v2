import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

export  const formatCurrency = (amount: number) => {
  return `₦${amount.toLocaleString()}`;
};



export const useAppNavigation = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const navigateTo = (screen: keyof RootStackParamList, params?: any) => {
    navigation.navigate(screen, params);
  };

  const replaceTo = (screen: keyof RootStackParamList, params?: any) => {
    navigation.replace(screen, params);
  };

  const goBack = () => {
    navigation.goBack();
  };

  const resetTo = (screen: keyof RootStackParamList, params?: any) => {
    navigation.reset({
      index: 0,
      routes: [{ name: screen, params }],
    });
  };

  return {
    navigateTo,
    replaceTo,
    goBack,
    resetTo,
    navigation, 
  };
};