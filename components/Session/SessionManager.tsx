import { SESSION_CONFIG } from "@/core/config/session";
import {
  endSession,
  writeLastActiveAt,
} from "@/core/services/session/sessionManager";
import { useAuthStore } from "@/store/Authstore";
import { usePathname } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus, View } from "react-native";

/**
 * Tracks user activity around the whole app and ends the session after
 * SESSION_CONFIG.IDLE_TIMEOUT_MS of inactivity, including time spent in
 * the background. The root layout owns the post-logout navigation.
 */
export default function SessionManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLogin = useAuthStore((state) => state.isLogin);
  const pathname = usePathname();

  const lastActivityRef = useRef(Date.now());
  const lastPersistRef = useRef(0);
  const backgroundAtRef = useRef<number | null>(null);

  const markActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;

    if (
      now - lastPersistRef.current >=
      SESSION_CONFIG.ACTIVITY_PERSIST_INTERVAL_MS
    ) {
      lastPersistRef.current = now;
      void writeLastActiveAt(now);
    }
  }, []);

  useEffect(() => {
    if (!isLogin) {
      backgroundAtRef.current = null;
      return;
    }

    lastActivityRef.current = Date.now();
    lastPersistRef.current = Date.now();
    void writeLastActiveAt(lastActivityRef.current);

    const interval = setInterval(() => {
      if (
        Date.now() - lastActivityRef.current >=
        SESSION_CONFIG.IDLE_TIMEOUT_MS
      ) {
        void endSession("idle");
      }
    }, SESSION_CONFIG.IDLE_CHECK_INTERVAL_MS);

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          const idleSince = Math.max(
            lastActivityRef.current,
            backgroundAtRef.current ?? 0,
          );
          backgroundAtRef.current = null;

          if (Date.now() - idleSince >= SESSION_CONFIG.IDLE_TIMEOUT_MS) {
            void endSession("idle");
          } else {
            markActivity();
          }
        } else if (nextState === "background") {
          backgroundAtRef.current = Date.now();
          void writeLastActiveAt(lastActivityRef.current);
        }
      },
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [isLogin, markActivity]);

  // Navigating counts as activity even without a tap (deep links, back gestures).
  useEffect(() => {
    if (isLogin) markActivity();
  }, [pathname, isLogin, markActivity]);

  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponderCapture={() => {
        markActivity();
        return false; // observe the touch without claiming it from the child
      }}
    >
      {children}
    </View>
  );
}
