import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

export  const formatCurrency = (amount: number) => {
  return `₦${amount.toLocaleString()}`;
};



