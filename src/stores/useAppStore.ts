import { AppStore } from "@/types/storeInterfaces";
import { create } from "zustand";

export const useAppStore = create<AppStore>()((set) => ({
  isDrawerOpen: false,

  actions: {
    setIsDrawerOpen: (newValue) =>
      set((prevState) => ({
        isDrawerOpen:
          typeof newValue === "function"
            ? newValue(prevState.isDrawerOpen)
            : newValue,
      })),
  },
}));

export const useAppStoreActions = () => useAppStore((state) => state.actions);
