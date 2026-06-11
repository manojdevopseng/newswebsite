"use client";

import { create } from "zustand";
import type { SearchResult } from "@/types";

interface SearchStore {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  selectedIndex: number;

  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  setIsLoading: (loading: boolean) => void;
  setSelectedIndex: (index: number) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  query: "",
  results: [],
  isLoading: false,
  selectedIndex: -1,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, query: "", results: [], selectedIndex: -1 }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
  reset: () => set({ query: "", results: [], isLoading: false, selectedIndex: -1 }),
}));
