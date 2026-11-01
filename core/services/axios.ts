import { useAuthStore } from "@/store/Authstore";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { readToken } from "./auth/tokenStorage";
import { markSessionEnded } from "../utils/handleapierror";
import { endSession } from "./session/sessionManager";

const BASE_URL = "https://buildconnect-api.ivantage.africa/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean; skipAuth?: boolean };

const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/signup",
  "/auth/refresh-token",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-otp",
  "/auth/resend-verification",
];

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

let refreshPromise: Promise<string> | null = null;

async function requestNewAccessToken(): Promise<string> {
  const refreshToken = await readToken("refreshToken");
  if (!refreshToken) {
    throw new Error("Refresh token not found");
  }

  // Deliberately a bare client: refreshing must never re-enter the
  // interceptors below (that is what caused refresh loops).
  const response = await axios.post(
    `${BASE_URL}/auth/refresh-token`,
    { refreshToken },
    { timeout: 30000 },
  );

  const body = response.data;
  const authToken: string | undefined =
    body?.data?.authToken ??
    body?.data?.accessToken ??
    body?.authToken ??
    body?.accessToken;
  const nextRefreshToken: string =
    body?.data?.refreshToken ??
    body?.data?.refresh_token ??
    body?.refreshToken ??
    body?.refresh_token ??
    refreshToken;

  if (!authToken) {
    throw new Error("Token refresh failed: invalid response");
  }

  const { setAuthData, user } = useAuthStore.getState();
  await setAuthData(authToken, nextRefreshToken, user ?? undefined);

  return authToken;
}

/** Coalesces concurrent 401s into a single refresh request. */
function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

axiosInstance.interceptors.request.use(async (config: RetryableConfig) => {
  if (config.skipAuth || isAuthEndpoint(config.url)) {
    return config;
  }

  // In-memory token first; SecureStore is only the cold-start source.
  const token =
    useAuthStore.getState().authToken ?? (await readToken("authToken"));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  }

  const refreshToken = await readToken("refreshToken");
  if (!refreshToken) {
    return config;
  }

  try {
    const freshToken = await refreshAccessToken();
    config.headers.Authorization = `Bearer ${freshToken}`;
    return config;
  } catch (refreshError) {
    if (useAuthStore.getState().isLogin) {
      await endSession("expired");
      markSessionEnded(refreshError);
    }
    return Promise.reject(refreshError);
  }
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    if (!original || status !== 401 || isAuthEndpoint(original.url)) {
      return Promise.reject(error);
    }

    // Already refreshed once and still unauthorized: the session is dead.
    if (original._retry) {
      markSessionEnded(error);
      await endSession("expired");
      return Promise.reject(error);
    }

    const refreshToken = await readToken("refreshToken");
    if (!refreshToken) {
      markSessionEnded(error);
      await endSession("expired");
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const freshToken = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${freshToken}`;
      return axiosInstance(original);
    } catch (refreshError) {
      markSessionEnded(error);
      markSessionEnded(refreshError);
      await endSession("expired");
      return Promise.reject(error);
    }
  },
);

export default axiosInstance;
