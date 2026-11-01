import * as SecureStore from "expo-secure-store";
import { clearTokens, readToken, writeToken } from "../tokenStorage";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const getItem = SecureStore.getItemAsync as unknown as jest.Mock;
const setItem = SecureStore.setItemAsync as unknown as jest.Mock;
const deleteItem = SecureStore.deleteItemAsync as unknown as jest.Mock;

describe("readToken", () => {
  it("returns null when nothing is stored", async () => {
    getItem.mockResolvedValue(null);

    await expect(readToken("authToken")).resolves.toBeNull();
  });

  it("reads the legacy raw-string format", async () => {
    getItem.mockResolvedValue("legacy-token");

    await expect(readToken("authToken")).resolves.toBe("legacy-token");
  });

  it("reads a JSON-encoded string", async () => {
    getItem.mockResolvedValue(JSON.stringify("json-token"));

    await expect(readToken("authToken")).resolves.toBe("json-token");
  });

  it("reads an object with a token field", async () => {
    getItem.mockResolvedValue(JSON.stringify({ token: "object-token" }));

    await expect(readToken("refreshToken")).resolves.toBe("object-token");
  });

  it("returns null for unusable JSON", async () => {
    getItem.mockResolvedValue(JSON.stringify({ nope: true }));

    await expect(readToken("authToken")).resolves.toBeNull();
  });

  it("returns null instead of throwing when storage fails", async () => {
    getItem.mockRejectedValue(new Error("keychain unavailable"));

    await expect(readToken("authToken")).resolves.toBeNull();
  });
});

describe("writeToken", () => {
  it("stores tokens as JSON so embedded quotes survive", async () => {
    await writeToken("authToken", 'a"b');

    expect(setItem).toHaveBeenCalledWith("authToken", JSON.stringify('a"b'));
  });
});

describe("clearTokens", () => {
  it("deletes both token keys", async () => {
    await clearTokens();

    expect(deleteItem).toHaveBeenCalledTimes(2);
    expect(deleteItem).toHaveBeenCalledWith("authToken");
    expect(deleteItem).toHaveBeenCalledWith("refreshToken");
  });
});
