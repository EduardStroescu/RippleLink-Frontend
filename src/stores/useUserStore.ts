import { create } from "zustand";
import { UserStore } from "../types/storeInterfaces";

export const useUserStore = create<UserStore>()((set) => ({
  user: null,

  actions: {
    setUser: (newValue) =>
      set((prevState) => ({
        user:
          typeof newValue === "function" ? newValue(prevState.user) : newValue,
      })),
  },
}));

export const useUserStoreActions = () => useUserStore((state) => state.actions);
