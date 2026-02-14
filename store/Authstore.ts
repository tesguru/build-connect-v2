import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { User } from '@/core/services/auth/authType';

interface AuthState {
  authToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLogin: boolean;
  setAuthData: (authToken: string, refreshToken: string, user?: User) => Promise<void>;
  clearAuthData: () => Promise<void>;
  loadAuthData: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  authToken: null,
  refreshToken: null,
  user: null,
  isLogin: false,

  setAuthData: async (authToken, refreshToken, user) => {
    set({ authToken, refreshToken, user: user || null, isLogin: true });
    await SecureStore.setItemAsync('authToken', JSON.stringify(authToken));
    await SecureStore.setItemAsync('refreshToken', JSON.stringify(refreshToken));
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    }
    await AsyncStorage.setItem('isLogin', 'true');
  },

  clearAuthData: async () => {
    set({ authToken: null, refreshToken: null, user: null, isLogin: false });
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.setItem('isLogin', 'false');
  },

  loadAuthData: async () => {
    const storedAuth = await SecureStore.getItemAsync('authToken');
    const storedRefresh = await SecureStore.getItemAsync('refreshToken');
    const storedIsLogin = await AsyncStorage.getItem('isLogin');
    const storedUser = await AsyncStorage.getItem('user');

    set({
      authToken: storedAuth ? JSON.parse(storedAuth) : null,
      refreshToken: storedRefresh ? JSON.parse(storedRefresh) : null,
      user: storedUser ? JSON.parse(storedUser) : null,
      isLogin: storedIsLogin === 'true',
    });
  },

  updateUser: (user: User) => {
    set({ user });
    AsyncStorage.setItem('user', JSON.stringify(user));
  },
}));

