"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserPrefsStore {
  sortBy: "latest" | "trending" | "recommended";
  defaultCategory: string | null;
  readingList: string[];
  dismissedMobileAd: boolean;

  setSortBy: (sort: "latest" | "trending" | "recommended") => void;
  setDefaultCategory: (cat: string | null) => void;
  addToReadingList: (id: string) => void;
  removeFromReadingList: (id: string) => void;
  isInReadingList: (id: string) => boolean;
  dismissMobileAd: () => void;
}

export const useUserPrefsStore = create<UserPrefsStore>()(
  persist(
    (set, get) => ({
      sortBy: "latest",
      defaultCategory: null,
      readingList: [],
      dismissedMobileAd: false,

      setSortBy: (sortBy) => set({ sortBy }),
      setDefaultCategory: (defaultCategory) => set({ defaultCategory }),

      addToReadingList: (id) => {
        if (!get().readingList.includes(id)) {
          set({ readingList: [...get().readingList, id] });
        }
      },
      removeFromReadingList: (id) =>
        set({ readingList: get().readingList.filter((i) => i !== id) }),
      isInReadingList: (id) => get().readingList.includes(id),
      dismissMobileAd: () => set({ dismissedMobileAd: true }),
    }),
    {
      name: "techpulseglobe-user-prefs",
      partialize: (state) => ({
        sortBy: state.sortBy,
        defaultCategory: state.defaultCategory,
        readingList: state.readingList,
        dismissedMobileAd: state.dismissedMobileAd,
      }),
    }
  )
);
