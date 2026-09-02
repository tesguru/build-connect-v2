import { useAuthStore } from "@/store/Authstore";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { AuthService } from "./auth/AuthService";

const axiosInstance = axios.create({
  baseURL: "https://api-buildconnect.ivantage.africa/v1",
  timeout: 60000,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (token: unknown) => void;
  reject: (err: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: unknown = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

async function refreshAuthToken() {
  const storedRefreshToken = await SecureStore.getItemAsync("refreshToken");
  if (!storedRefreshToken) {
    throw new Error("Refresh token not found");
  }

  // The stored value may be a raw string or a JSON-stringified
  // {token: string} object — both are handled.
  let refreshTokenValue: string = storedRefreshToken;
  try {
    const parsed = JSON.parse(storedRefreshToken);
    if (typeof parsed !== "string") {
      refreshTokenValue = parsed?.token || parsed;
    }
  } catch {
    // storedRefreshToken was already a plain string; use as-is
  }

  const response = await AuthService.refreshToken(refreshTokenValue);
  const result = response.data;

  // The refresh endpoint's response shape hasn't been directly confirmed —
  // it's assumed to match the { success, data: { authToken, refreshToken } }
  // envelope seen from /auth/signup. As a safety net, also accept a flat
  // shape ({ authToken, refreshToken } directly on the body) in case the
  // refresh endpoint doesn't nest under `data`.
  const authToken: string | undefined =
    result?.data?.authToken ?? result?.authToken;
  const newRefreshToken: string | undefined =
    result?.data?.refreshToken ?? result?.refreshToken;

  if (!authToken || !newRefreshToken) {
    throw new Error("Token refresh failed: Invalid response structure");
  }

  await SecureStore.setItemAsync("authToken", JSON.stringify(authToken));
  await SecureStore.setItemAsync(
    "refreshToken",
    JSON.stringify(newRefreshToken),
  );

  const { setAuthData, user } = useAuthStore.getState();
  setAuthData(authToken, newRefreshToken, user || undefined);

  return authToken;
}

async function handleLogout() {
  await useAuthStore.getState().clearAuthData();
  Toast.show({
    type: "error",
    text1: "Session Expired",
    text2: "Please login again",
  });
}

axiosInstance.interceptors.request.use(async (config) => {
  const isRefreshEndpoint = config.url?.includes("/auth/refresh-token");

  if (!isRefreshEndpoint) {
    let storedToken = await SecureStore.getItemAsync("authToken");
    let usedRefreshFallback = false;

    if (!storedToken) {
      storedToken = await SecureStore.getItemAsync("refreshToken");
      usedRefreshFallback = true;
    }

    if (usedRefreshFallback && storedToken) {
      // No auth token but a refresh token exists: proactively refresh
      // before sending this request, rather than letting it 401 first.
      try {
        const newToken = await refreshAuthToken();
        if (config.headers) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
      } catch {
        if (useAuthStore.getState().isLogin) {
          await handleLogout();
        }
      }
    } else if (storedToken) {
      let tokenValue: string = storedToken;
      try {
        const parsed = JSON.parse(storedToken);
        tokenValue =
          typeof parsed === "string" ? parsed : parsed?.token || parsed;
      } catch {
        tokenValue = storedToken;
      }
      if (config.headers) {
        config.headers.Authorization = `Bearer ${tokenValue}`;
      }
    }
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Debug: inspect what's actually in SecureStore whenever a request
    // errors out. Safe here because this outer function is async, unlike
    // isAuthEndpoint below which must stay sync.

    const isAuthEndpoint = (url: string | undefined) =>
      url?.includes("/auth/login") ||
      url?.includes("/auth/refresh-token") ||
      url?.includes("/auth/signup");

    if (
      status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest?.url)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAuthToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        processQueue(null, newToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (useAuthStore.getState().isLogin) {
          await handleLogout();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (
      status === 403 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest?.url)
    ) {
      originalRequest._retry = true;
      try {
        const storedRefreshToken =
          await SecureStore.getItemAsync("refreshToken");
        if (!storedRefreshToken) {
          if (useAuthStore.getState().isLogin) {
            await handleLogout();
          }
          return Promise.reject(error);
        }

        const newToken = await refreshAuthToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return axiosInstance(originalRequest);
      } catch {
        if (useAuthStore.getState().isLogin) {
          await handleLogout();
        }
        Toast.show({
          type: "error",
          text1: "Access Denied",
          text2: "Please login again",
        });
        return Promise.reject(error);
      }
    }

    if (error.response) {
    } else {
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
