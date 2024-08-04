import { AppStore } from "@/types/interfaces";
import { create } from "zustand";

export const useAppStore = create<AppStore>()((set) => ({
  // isSocketConnected: false,
  // actions: {
  //   setIsSocketConnected: (newValue) =>
  //     set((prevState) => ({
  //       isSocketConnected:
  //         typeof newValue === "function"
  //           ? newValue(prevState.isSocketConnected)
  //           : newValue,
  //     })),
  // },
}));

// export const useAppStoreActions = () => useAppStore((state) => state.actions);
