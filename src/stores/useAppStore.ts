import { create } from "zustand";

import { toast } from "@/components/ui/use-toast";
import { AppStore } from "@/types/storeInterfaces";

export const useAppStore = create<AppStore>()((set, get) => ({
  socket: null,
  appBackground: "/background.jpg",
  appTint: "rgba(0,0,0,0.4)",
  appGlow: "rgba(6,182,212,0.5)",

  actions: {
    setSocket: (newSocket) => set(() => ({ socket: newSocket })),
    getSocket: async (retries = 10, delay = 100) => {
      const socket = get().socket;
      if (socket && socket.connected) return socket;

      if (!socket || !socket.connected) {
        for (let i = 0; i < retries; i++) {
          const socket = get().socket;
          if (socket && socket.connected) return socket;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      return null;
    },
    socketEmit: (
      event,
      payload,
      callback,
      { timeout = 1000, delay = 100 } = {}
    ) => {
      (async () => {
        for (let i = 0; i < 10; i++) {
          const socket = await get().actions.getSocket();
          if (!socket) continue;

          const success = await new Promise<boolean>((resolve) => {
            socket.timeout(timeout).emit(event, payload, (err, res) => {
              if (!err && res.status === "error") {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: res.error.message,
                });
              }
              if (!err && callback) {
                callback(res);
              }
              resolve(!err); // resolve true if no error
            });
          });

          if (success) break;
          await new Promise((r) => setTimeout(r, delay));
        }
      })();
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
