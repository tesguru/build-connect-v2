import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import {
  LAST_ACTIVE_STORAGE_KEY,
  SESSION_CONFIG,
} from "@/core/config/session";
import { useAuthStore } from "@/store/Authstore";
import { onSessionEnded } from "../sessionEvents";
import {
  endSession,
  enforceIdleTimeoutOnStartup,
  readLastActiveAt,
} from "../sessionManager";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(async () => undefined),
    getItem: jest.fn(async () => null),
    removeItem: jest.fn(async () => undefined),
  },
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

const getItem = AsyncStorage.getItem as unknown as jest.Mock;
const removeItem = AsyncStorage.removeItem as unknown as jest.Mock;
const showToast = Toast.show as unknown as jest.Mock;

function signIn() {
  useAuthStore.setState({
    authToken: "access-token",
    refreshToken: "refresh-token",
    user: null,
    isLogin: true,
  });
}

describe("endSession", () => {
  let listener: jest.Mock;
  let unsubscribe: (() => void) | undefined;

  beforeEach(() => {
    signIn();
    listener = jest.fn();
    unsubscribe = onSessionEnded(listener);
  });

  afterEach(() => unsubscribe?.());

  it("clears auth, storage and notifies listeners once", async () => {
    await endSession("manual");

    expect(useAuthStore.getState().isLogin).toBe(false);
    expect(removeItem).toHaveBeenCalledWith(LAST_ACTIVE_STORAGE_KEY);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("manual");
    expect(showToast).toHaveBeenCalledWith({
      type: "success",
      text1: "Logged Out",
      text2: "You have been logged out.",
    });
  });

  it("does nothing when the user is already signed out", async () => {
    useAuthStore.setState({ isLogin: false });

    await endSession("expired");

    expect(listener).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });
});

describe("enforceIdleTimeoutOnStartup", () => {
  let listener: jest.Mock;
  let unsubscribe: (() => void) | undefined;

  beforeEach(() => {
    signIn();
    listener = jest.fn();
    unsubscribe = onSessionEnded(listener);
  });

  afterEach(() => unsubscribe?.());

  it("keeps the session when the user was recently active", async () => {
    getItem.mockResolvedValue(String(Date.now() - 60_000));

    await enforceIdleTimeoutOnStartup();

    expect(useAuthStore.getState().isLogin).toBe(true);
    expect(listener).not.toHaveBeenCalled();
  });

  it("ends the session when the app sat idle past the timeout", async () => {
    getItem.mockResolvedValue(
      String(Date.now() - SESSION_CONFIG.IDLE_TIMEOUT_MS - 1_000),
    );

    await enforceIdleTimeoutOnStartup();

    expect(useAuthStore.getState().isLogin).toBe(false);
    expect(listener).toHaveBeenCalledWith("idle");
  });
});

describe("readLastActiveAt", () => {
  it("returns null for a corrupt timestamp", async () => {
    getItem.mockResolvedValue("not-a-number");

    await expect(readLastActiveAt()).resolves.toBeNull();
  });
});
