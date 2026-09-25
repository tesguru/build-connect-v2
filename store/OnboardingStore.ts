import {
    getOnboardingStatus,
    setOnboardingComplete,
} from "@/core/utils/onboarding";
import { create } from "zustand";

export const useOnboardingStore = create((set) => ({
  hasCompleted: false,
  isLoaded: false,

  loadOnboardingStatus: async () => {
    const hasCompleted = await getOnboardingStatus();
    set({ hasCompleted, isLoaded: true });
  },

  completeOnboarding: async () => {
    await setOnboardingComplete();
    set({ hasCompleted: true });
  },
}));
