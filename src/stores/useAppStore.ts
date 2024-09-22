import { AppStore } from "@/types/storeInterfaces";
import { create } from "zustand";

export const useAppStore = create<AppStore>()((set) => ({
  socket: null,
  appBackground: "/background.jpg",
  appTint: "rgba(0,0,0,0.4)",
  appGlow: "rgba(6,182,212,0.5)",

  actions: {
    setSocket: (newSocket) => set(() => ({ socket: newSocket })),
    setAppBackground: (newBackground) =>
      set(() => ({ appBackground: newBackground })),
    setAppTint: (newTint) => set(() => ({ appTint: newTint })),
    setAppGlow: (newGlow) => set(() => ({ appGlow: newGlow })),
    resetAppStore: () =>
      set(() => ({
        appBackground: "/background.jpg",
        appTint: "rgba(0,0,0,0.4)",
        appGlow: "rgba(6,182,212,0.5)",
      })),
  },
}));

export const useAppStoreActions = () => useAppStore((state) => state.actions);
