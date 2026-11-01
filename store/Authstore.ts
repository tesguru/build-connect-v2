import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { User } from "@/core/services/auth/authType";
import {
  LAST_ACTIVE_STORAGE_KEY,
} from "@/core/config/session";
import {
  clearTokens,
  readToken,
  writeToken,
} from "@/core/services/auth/tokenStorage";

interface AuthState {
  authToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLogin: boolean;
  setAuthData: (
    authToken: string,
    refreshToken: string,
    user?: User,
  ) => Promise<void>;
  clearAuthData: () => Promise<void>;
  loadAuthData: () => Promise<void>;
  updateUser: (user: User) => void;
}

function parseUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  authToken: null,
  refreshToken: null,
  user: null,
  isLogin: false,

  setAuthData: async (authToken, refreshToken, user) => {
    set({ authToken, refreshToken, user: user || null, isLogin: true });

    try {
      await Promise.all([
        writeToken("authToken", authToken),
        writeToken("refreshToken", refreshToken),
        AsyncStorage.setItem("isLogin", "true"),
        AsyncStorage.setItem(LAST_ACTIVE_STORAGE_KEY, String(Date.now())),
        user
          ? AsyncStorage.setItem("user", JSON.stringify(user))
          : Promise.resolve(),
      ]);
    } catch {
      // Storage failures must not break a successful login; the in-memory
      // session still works for this app run.
    }
  },

  clearAuthData: async () => {
    set({ authToken: null, refreshToken: null, user: null, isLogin: false });

    try {
      await Promise.all([
        clearTokens(),
        AsyncStorage.removeItem("user"),
        AsyncStorage.setItem("isLogin", "false"),
        AsyncStorage.removeItem(LAST_ACTIVE_STORAGE_KEY),
      ]);
    } catch {
      // State is already cleared; a failed cleanup should not block logout.
    }
  },

  loadAuthData: async () => {
    try {
      const [authToken, refreshToken, storedIsLogin, storedUser] =
        await Promise.all([
          readToken("authToken"),
          readToken("refreshToken"),
          AsyncStorage.getItem("isLogin"),
          AsyncStorage.getItem("user"),
        ]);

      set({
        authToken,
        refreshToken,
        user: parseUser(storedUser),
        isLogin: storedIsLogin === "true" && Boolean(authToken || refreshToken),
      });
    } catch {
      // Corrupt or unavailable storage must never block app start.
      set({ authToken: null, refreshToken: null, user: null, isLogin: false });
    }
  },

  updateUser: (user: User) => {
    set({ user });
    AsyncStorage.setItem("user", JSON.stringify(user)).catch(() => {});
  },
}));
