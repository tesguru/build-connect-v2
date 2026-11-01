export const SESSION_CONFIG = {
  /** Users are signed out after this much inactivity. */
  IDLE_TIMEOUT_MS: 15 * 60 * 1000,
  IDLE_TIMEOUT_MINUTES: 15,
  /** How often activity is written to storage, so a cold start can enforce the timeout. */
  ACTIVITY_PERSIST_INTERVAL_MS: 60 * 1000,
  /** How often the foreground idle timer checks for expiry. */
  IDLE_CHECK_INTERVAL_MS: 30 * 1000,
} as const;

export const LAST_ACTIVE_STORAGE_KEY = "session:lastActiveAt";

