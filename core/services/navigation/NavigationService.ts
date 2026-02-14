import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/RootNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const NavigationService = {
  navigate: (name: keyof RootStackParamList, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name as never, params as never);
    }
  },
  reset: (state: { index: number; routes: Array<{ name: keyof RootStackParamList; params?: any }> }) => {
    if (navigationRef.isReady()) {
      navigationRef.reset(state as any);
    }
  },
  replace: (name: keyof RootStackParamList, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.replace(name as never, params as never);
    }
  },
};

