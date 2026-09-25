import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "hasCompletedOnboarding";

export async function getOnboardingStatus() {
  const value = await AsyncStorage.getItem(KEY);
  return value === "true";
}

export async function setOnboardingComplete() {
  await AsyncStorage.setItem(KEY, "true");
}

export async function resetOnboarding() {
  await AsyncStorage.removeItem(KEY);
}
