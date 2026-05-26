"use client";

import { create } from "zustand";

/**
 * UI store — purely local client state (modals, filters, multi-step
 * progress). Server data does NOT go in here; that's TanStack Query's
 * job.
 */
interface UiState {
  // Onboarding wizard — currently the form is single-page, but the slot
  // exists for when we split it into steps without a re-architecture.
  onboardingStep: 1 | 2 | 3;
  setOnboardingStep: (s: 1 | 2 | 3) => void;

  // Mobile nav drawer.
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  toggleNav: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  onboardingStep: 1,
  setOnboardingStep: (s) => set({ onboardingStep: s }),

  navOpen: false,
  setNavOpen: (open) => set({ navOpen: open }),
  toggleNav: () => set((s) => ({ navOpen: !s.navOpen })),
}));
