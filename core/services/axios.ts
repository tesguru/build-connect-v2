// axios.ts
import Axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { AuthService } from "./auth/AuthService";
import Toast from "react-native-toast-message";
import { useAuthStore } from "@/store/Authstore";

const axiosInstance: AxiosInstance = Axios.create({
  baseURL: "https://api-buildconnect.ivantage.africa/v1",
  timeout: 60000,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Centralized function to refresh authentication tokens
 * @returns Promise resolving to the new auth token, or rejects on failure
 */
const refreshAuthToken = async (): Promise<string> => {
  // Get refresh token from SecureStore
  const refreshTokenString = await SecureStore.getItemAsync("refreshToken");
  
  if (!refreshTokenString) {
    throw new Error("Refresh token not found");
  }

  // Parse refresh token (handle both string and object formats)
  const parsedRefreshToken = JSON.parse(refreshTokenString);
  const refreshToken = typeof parsedRefreshToken === 'string' 
    ? parsedRefreshToken 
    : parsedRefreshToken?.token || parsedRefreshToken;

  // Attempt to refresh the token
  const response = await AuthService.refreshToken(refreshToken);
  const refreshData = response.data;

  // Log refresh token response for debugging
  console.log("🔄 Refresh Token Response:", {
    success: refreshData?.success,
    statusCode: refreshData?.statusCode,
    hasData: !!refreshData?.data,
    hasAuthToken: !!refreshData?.data?.authToken,
    hasRefreshToken: !!refreshData?.data?.refreshToken,
  });

  if (!refreshData?.success || !refreshData?.data?.authToken || !refreshData?.data?.refreshToken) {
    throw new Error("Token refresh failed: Invalid response structure");
  }

  const { authToken: newAuthToken, refreshToken: newRefreshToken } = refreshData.data;
  
  // Update tokens in SecureStore
  await SecureStore.setItemAsync('authToken', JSON.stringify(newAuthToken));
  await SecureStore.setItemAsync('refreshToken', JSON.stringify(newRefreshToken));

  // Update auth store
  const store = useAuthStore.getState();
  store.setAuthData(newAuthToken, newRefreshToken, store.user || undefined);

  return newAuthToken;
};

/**
 * Centralized function to handle logout when token refresh fails
 */
const handleLogout = async () => {
  const store = useAuthStore.getState();
  await store.clearAuthData();

  Toast.show({
    type: "error",
    text1: "Session Expired",
    text2: "Please login again",
  });
};

// Request interceptor — attach token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Skip adding auth token for refresh token endpoint (it uses refresh token in body)
    if (config.url?.includes('/auth/refresh-token')) {
      return config;
    }

    const tokenString = await SecureStore.getItemAsync("authToken");
    if (tokenString) {
      try {
        const parsedToken = JSON.parse(tokenString);
      
        const authToken = typeof parsedToken === 'string' ? parsedToken : parsedToken?.token || parsedToken;
        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }
      } catch (error) {
        // If parsing fails, try using the raw string as token
        if (tokenString) {
          config.headers.Authorization = `Bearer ${tokenString}`;
        }
      }
    } else {
      // Token not found - try to refresh if refresh token exists
      const refreshTokenString = await SecureStore.getItemAsync("refreshToken");
      if (refreshTokenString && !config.url?.includes('/auth/refresh-token')) {
        // Don't attempt refresh for refresh-token endpoint itself
        try {
          const newAuthToken = await refreshAuthToken();
          // Attach new token to request
          config.headers.Authorization = `Bearer ${newAuthToken}`;
        } catch (refreshError) {
          // Refresh failed - logout user
          const store = useAuthStore.getState();
          if (store.isLogin) {
            await handleLogout();
          }
        }
      }
    }
    console.log("➡️ Request:", {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.log("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor — handle token expiration and refresh
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints to avoid infinite loops
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/refresh-token') ||
          originalRequest.url?.includes('/auth/signup')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAuthToken = await refreshAuthToken();

        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAuthToken}`;
        }

        // Process queued requests
        processQueue(null, newAuthToken);

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(refreshError, null);
        await handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden - try to refresh token first
    if (error.response?.status === 403 && !originalRequest._retry) {
      // Skip refresh for auth endpoints to avoid infinite loops
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/refresh-token') ||
          originalRequest.url?.includes('/auth/signup')) {
        const store = useAuthStore.getState();
        if (store.isLogin) {
          await store.clearAuthData();
          Toast.show({
            type: "error",
            text1: "Access Denied",
            text2: "Please login again",
          });
        }
        return Promise.reject(error);
      }

      // Try to refresh token for 403 errors
      originalRequest._retry = true;
      
      try {
        const refreshTokenString = await SecureStore.getItemAsync("refreshToken");
        
        if (refreshTokenString) {
          const newAuthToken = await refreshAuthToken();

          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAuthToken}`;
          }

          // Retry the original request
          return axiosInstance(originalRequest);
        } else {
          // No refresh token available - logout
          const store = useAuthStore.getState();
          if (store.isLogin) {
            await handleLogout();
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        const store = useAuthStore.getState();
        if (store.isLogin) {
          await handleLogout();
        }
        return Promise.reject(refreshError);
      }
    }

    // Log other errors
    if (error.response) {
      console.log("❌ API Error:", {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.log("❌ Network/Timeout Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
