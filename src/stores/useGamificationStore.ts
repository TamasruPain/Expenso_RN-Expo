import { Badge } from "@/types";
import { create } from "zustand";

interface GamificationState {
  streakCount: number;
  badges: Badge[];
  lastActiveDate: string | null;
  incrementStreak: () => void;
  resetStreak: () => void;
  awardBadge: (badge: Badge) => void;
  checkStreak: () => void;
  setBadges: (badges: Badge[]) => void;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  streakCount: 0,
  badges: [],
  lastActiveDate: null,

  setBadges: (badges) => set({ badges }),

  incrementStreak: () => {
    const today = new Date().toISOString().split("T")[0];
    set((state) => ({
      streakCount: state.streakCount + 1,
      lastActiveDate: today,
    }));
  },

  resetStreak: () => set({ streakCount: 0 }),

  awardBadge: (badge) => {
    set((state) => ({
      badges: [
        ...state.badges,
        { ...badge, earned_at: new Date().toISOString() },
      ],
    }));
  },

  checkStreak: () => {
    const state = get();
    if (!state.lastActiveDate) return;

    const today = new Date();
    const lastActive = new Date(state.lastActiveDate);

    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      state.resetStreak();
    }
  },
}));
