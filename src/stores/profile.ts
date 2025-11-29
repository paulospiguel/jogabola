import type { OnboardingData } from "@/schemas/profile";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ProfileState {
  data: Partial<OnboardingData>;
  completed: boolean;
  currentStep: number;

  // Actions
  setData: (data: Partial<OnboardingData>) => void;
  updateData: (data: Partial<OnboardingData>) => void;
  setCurrentStep: (step: number) => void;
  setCompleted: (completed: boolean) => void;
  reset: () => void;
  hasData: () => boolean;
}

const initialState = {
  data: {
    role: undefined,
    name: "",
    email: "",
    nickname: "",
    nationality: "",
    country: "",
    city: "",
    location: "",
    experience: undefined,
    goals: [],
    availability: undefined,
    preferences: {
      notifications: true,
      newsletter: true,
      earlyAccess: true,
    },
    waitlistApps: [],
    customFields: {},
  },
  completed: false,
  currentStep: 0,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setData: (data: Partial<OnboardingData>) => {
        set({ data });
      },

      updateData: (newData: Partial<OnboardingData>) => {
        set(state => ({
          data: {
            ...state.data,
            ...newData,
          },
        }));
      },

      setCurrentStep: (step: number) => {
        set({ currentStep: step });
      },

      setCompleted: (completed: boolean) => {
        set({ completed });
      },

      reset: () => {
        set(initialState);
      },

      hasData: () => {
        const { data } = get();
        return !!(
          data.role ||
          data.name ||
          data.email ||
          (data.goals && data.goals.length > 0)
        );
      },
    }),
    {
      name: "jogabola-profile-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
