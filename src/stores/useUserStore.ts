import { create } from "zustand";
import { UserState } from "../types/interfaces";

export const useUserStore = create<UserState>()((set) => ({
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
