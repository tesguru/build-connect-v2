import * as SecureStore from "expo-secure-store";

export type TokenKey = "authToken" | "refreshToken";

/**
 * Tokens were historically written either as a raw string or as a
 * JSON-stringified string/object, so reads accept all three shapes.
 */
function parseStoredToken(raw: string | null): string | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed || null;
    if (parsed && typeof parsed === "object") {
      const value = (parsed as { token?: unknown }).token;
      return typeof value === "string" && value ? value : null;
    }
    return null;
  } catch {
    return raw;
  }
}

export async function readToken(key: TokenKey): Promise<string | null> {
  try {
    return parseStoredToken(await SecureStore.getItemAsync(key));
  } catch {
    return null;
  }
}

export async function writeToken(key: TokenKey, token: string): Promise<void> {
  await SecureStore.setItemAsync(key, JSON.stringify(token));
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync("authToken"),
    SecureStore.deleteItemAsync("refreshToken"),
  ]);
}
