import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import {
  LAST_ACTIVE_STORAGE_KEY,
  SESSION_CONFIG,
} from "@/core/config/session";
import { useAuthStore } from "@/store/Authstore";
import { emitSessionEnded, SessionEndReason } from "./sessionEvents";

const LAST_ACTIVE_KEY = LAST_ACTIVE_STORAGE_KEY;

const REASON_COPY: Record<
  SessionEndReason,
  { type: "error" | "success"; text1: string; text2: string }
> = {
  idle: {
    type: "error",
    text1: "Signed Out",
    text2: `You were signed out after ${SESSION_CONFIG.IDLE_TIMEOUT_MINUTES} minutes of inactivity.`,
  },
  expired: {
    type: "error",
    text1: "Session Expired",
    text2: "Please log in again to continue.",
  },
  manual: {
    type: "success",
    text1: "Logged Out",
    text2: "You have been logged out.",
  },
};

let lastNotified: { reason: SessionEndReason; at: number } | null = null;

/**
 * Single exit point for every logout: manual, expired refresh token, or idle.
 * Clears persisted credentials, notifies UI listeners, and reports once.
 */
export async function endSession(reason: SessionEndReason): Promise<void> {
  const state = useAuthStore.getState();
  if (!state.isLogin) return;

  try {
    await state.clearAuthData();
  } catch {
    // clearAuthData already resets in-memory state; keep going.
  }

  try {
    await AsyncStorage.removeItem(LAST_ACTIVE_KEY);
  } catch {
    // Non-fatal.
  }

  emitSessionEnded(reason);

  const now = Date.now();
  if (
    lastNotified &&
    lastNotified.reason === reason &&
    now - lastNotified.at < 3000
  ) {
    return;
  }
  lastNotified = { reason, at: now };

  Toast.show(REASON_COPY[reason]);
}

export async function writeLastActiveAt(at: number = Date.now()): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_ACTIVE_KEY, String(at));
  } catch {
    // Non-fatal: the in-memory timer still enforces the timeout.
  }
}

export async function readLastActiveAt(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
    const value = raw ? Number(raw) : NaN;
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/** Used on cold start: if the app sat unused long enough, force a logout. */
export async function enforceIdleTimeoutOnStartup(): Promise<void> {
  if (!useAuthStore.getState().isLogin) return;

  const lastActiveAt = await readLastActiveAt();
  if (
    lastActiveAt !== null &&
    Date.now() - lastActiveAt >= SESSION_CONFIG.IDLE_TIMEOUT_MS
  ) {
    await endSession("idle");
  }
}
