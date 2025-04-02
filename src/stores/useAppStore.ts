import { create } from "zustand";

import { AppStore } from "@/types/storeInterfaces";

export const useAppStore = create<AppStore>()((set, get) => ({
  socket: null,
  appBackground: "/background.jpg",
  appTint: "rgba(0,0,0,0.4)",
  appGlow: "rgba(6,182,212,0.5)",

  actions: {
    setSocket: (newSocket) => set(() => ({ socket: newSocket })),
    getSocket: async (retries = 10, delay = 200) => {
      const socket = get().socket;
      if (socket) return socket;

      if (!socket) {
        for (let i = 0; i < retries; i++) {
          const socket = get().socket;
          if (socket) return socket;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      return null;
    },
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
