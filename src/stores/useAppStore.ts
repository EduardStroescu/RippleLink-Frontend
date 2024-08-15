import { AppStore } from "@/types/storeInterfaces";
import { create } from "zustand";

export const useAppStore = create<AppStore>()((set) => ({
  appBackground:
    "https://r4.wallpaperflare.com/wallpaper/175/524/956/digital-digital-art-artwork-fantasy-art-drawing-hd-wallpaper-d8562dc820d0acd8506c415eb8e2a49a.jpg",
  appTint: "rgba(0,0,0,0.4)",
  appGlow: "rgba(6,182,212,0.5)",

  actions: {
    setAppBackground: (newBackground) =>
      set(() => ({ appBackground: newBackground })),
    setAppTint: (newTint) => set(() => ({ appTint: newTint })),
    setAppGlow: (newGlow) => set(() => ({ appGlow: newGlow })),
  },
}));

export const useAppStoreActions = () => useAppStore((state) => state.actions);
