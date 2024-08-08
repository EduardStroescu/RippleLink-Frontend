import { AppStore } from "@/types/storeInterfaces";
import { create } from "zustand";

export const useAppStore = create<AppStore>()((set) => ({
  isDrawerOpen: false,
  isChatDetailsDrawerOpen: false,
  incomingCalls: [],
  answeredCall: false,

  actions: {
    setIsDrawerOpen: (newValue) =>
      set((prevState) => ({
        isDrawerOpen:
          typeof newValue === "function"
            ? newValue(prevState.isDrawerOpen)
            : newValue,
      })),
    setIsChatDetailsDrawerOpen: (newValue) =>
      set((prevState) => ({
        isDrawerOpen:
          typeof newValue === "function"
            ? newValue(prevState.isChatDetailsDrawerOpen)
            : newValue,
      })),
    setIncomingCalls: (newValue) =>
      set((prevState) => ({
        incomingCalls:
          typeof newValue === "function"
            ? newValue(prevState.incomingCalls)
            : newValue,
      })),
    setAnsweredCall: (newValue) =>
      set((prevState) => ({
        answeredCall:
          typeof newValue === "function"
            ? newValue(prevState.answeredCall)
            : newValue,
      })),
  },
}));

export const useAppStoreActions = () => useAppStore((state) => state.actions);
