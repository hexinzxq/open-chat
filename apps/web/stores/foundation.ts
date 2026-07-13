import { create } from "zustand";

interface FoundationState {
  detailsOpen: boolean;
  toggleDetails: () => void;
}

export const useFoundationStore = create<FoundationState>((set) => ({
  detailsOpen: false,
  toggleDetails: () => set((state) => ({ detailsOpen: !state.detailsOpen })),
}));
