import Toast from "react-native-toast-message";

export interface NormalizedApiError {
  title: string;
  message: string;
  status?: number;
  code?: string;
  isNetworkError: boolean;
  isTimeout: boolean;
  isSessionError: boolean;
  data: any;
  originalError: unknown;
}

interface HandleApiErrorOptions {
  /** Overrides the toast title (e.g. "Login Failed"). */
  title?: string;
  /** Shown when the server sends no usable message (e.g. login's 401). */
  fallbackMessage?: string;
  /** Skip the toast but still return the normalized error. */
  silent?: boolean;
}

const HANDLED_FLAG = "__bcErrorHandled";
const SESSION_ENDED_FLAG = "__bcSessionEnded";
const TOAST_COOLDOWN_MS = 1500;

let lastToast: { key: string; at: number } | null = null;

function toText(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value)) {
    const parts = value.map(toText).filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }
  if (value && typeof value === "object") {
    const parts = Object.values(value as Record<string, unknown>)
      .map(toText)
      .filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }
  return null;
}

function extractServerMessage(data: any): string | null {
  if (!data) return null;
  if (typeof data === "string") return toText(data);

  return (
    toText(data.message) ??
    toText(data.error) ??
    toText(data.detail) ??
    toText(data.errors) ??
    toText(data.title) ??
    toText(data.data?.message) ??
    toText(data.data?.error) ??
    toText(data.data?.errors) ??
    null
  );
}

function isTimeoutError(error: any): boolean {
  return (
    error?.code === "ECONNABORTED" ||
    error?.code === "ETIMEDOUT" ||
    /timeout/i.test(String(error?.message ?? ""))
  );
}

function isNetworkError(error: any): boolean {
  if (error?.response) return false;
  if (!error?.request && error?.request !== "") return false;
  return true;
}

function fallbackForStatus(status?: number): string {
  switch (status) {
    case 400:
      return "Something seems off. Please check your input.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You don't have access to perform this action.";
    case 404:
      return "We couldn't find what you were looking for.";
    case 409:
      return "This action conflicts with the current state. Please refresh and try again.";
    case 422:
      return "Some fields need attention. Please review and try again.";
    case 429:
      return "You're doing that too often. Please wait a bit and try again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Something went wrong on our side. Please try again later.";
    default:
      return status
        ? `An unexpected error occurred (code ${status}).`
        : "Something went wrong. Please try again.";
  }
}

export function normalizeApiError(
  error: any,
  context = "Request",
  titleOverride?: string,
  fallbackMessage?: string,
): NormalizedApiError {
  const status: number | undefined = error?.response?.status;
  const data = error?.response?.data;
  const timedOut = isTimeoutError(error);
  const network = isNetworkError(error);
  const serverMessage = extractServerMessage(data);

  let message: string;
  let title =
    toText(titleOverride) ??
    toText(data?.title) ??
    (timedOut ? "Request Timed Out" : network ? "Connection Problem" : "Oops!");

  if (serverMessage) {
    message = serverMessage;
  } else if (timedOut) {
    message = "The request took too long. Please try again.";
  } else if (network) {
    message = "Can't connect right now. Please check your internet connection.";
  } else if (toText(fallbackMessage)) {
    message = toText(fallbackMessage) as string;
  } else if (status) {
    message = fallbackForStatus(status);
  } else if (typeof error === "string") {
    message = error;
  } else if (error?.message && typeof error.message === "string") {
    message = error.message;
  } else {
    message = `${context} didn't go through. Please try again.`;
  }

  // Never surface raw transport messages that tell the user nothing.
  if (/^network error$/i.test(message) || /^request failed with status code/i.test(message)) {
    message = fallbackForStatus(status);
    if (!status) {
      message = "Can't connect right now. Please check your internet connection.";
    }
  }

  return {
    title,
    message,
    status,
    code: error?.code,
    isNetworkError: network,
    isTimeout: timedOut,
    isSessionError: status === 401 || status === 403,
    data,
    originalError: error,
  };
}

export function getApiErrorMessage(error: any, fallback = "Something went wrong. Please try again."): string {
  const normalized = normalizeApiError(error, fallback, undefined, fallback);
  const message = normalized.message?.trim();
  return message || fallback;
}

/** Flags an error after the refresh flow already ended the session. */
export function markSessionEnded(error: unknown): void {
  if (error && typeof error === "object") {
    (error as Record<string, unknown>)[SESSION_ENDED_FLAG] = true;
  }
}

/**
 * Shows an error toast with deduplication. Use this for API failures that
 * arrive as a successful response with `success: false`.
 */
export function showApiErrorToast(title: string, message: string): void {
  const key = `${title}|${message}`;
  const now = Date.now();
  if (lastToast && lastToast.key === key && now - lastToast.at < TOAST_COOLDOWN_MS) {
    return;
  }
  lastToast = { key, at: now };
  Toast.show({ type: "error", text1: title, text2: message });
}

/**
 * The single error reporter used by screens, hooks and the global
 * React Query cache. Normalizes the error, shows one toast per error,
 * and stays quiet for errors that already triggered a logout.
 */
export function handleApiError(
  error: any,
  context = "Request",
  options: HandleApiErrorOptions = {},
): NormalizedApiError {
  if (error && typeof error === "object" && (error as any)[HANDLED_FLAG]) {
    return (error as any)[HANDLED_FLAG] as NormalizedApiError;
  }

  const normalized = normalizeApiError(
    error,
    context,
    options.title,
    options.fallbackMessage,
  );

  if (error && typeof error === "object") {
    (error as any)[HANDLED_FLAG] = normalized;
  }

  if (options.silent) return normalized;
  if (error && typeof error === "object" && (error as any)[SESSION_ENDED_FLAG]) {
    return normalized;
  }

  showApiErrorToast(normalized.title, normalized.message);

  return normalized;
}
