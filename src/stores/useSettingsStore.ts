import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingsState {
  isNotificationsEnabled: boolean;
  dailyReminderTime: string; // "HH:MM" format
  setNotificationsEnabled: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isNotificationsEnabled: true,
      dailyReminderTime: "20:00", // Default: 8:00 PM

      setNotificationsEnabled: (enabled) => {
        set({ isNotificationsEnabled: enabled });
      },

      setDailyReminderTime: (time) => {
        set({ dailyReminderTime: time });
      },
    }),
    {
      name: "expenso-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
