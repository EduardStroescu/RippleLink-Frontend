import { create } from "zustand";

import { UserStore } from "@/types/storeInterfaces";

export const useUserStore = create<UserStore>()((set) => {
  let initialUser = null;

  try {
    initialUser = JSON.parse(window.localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Error parsing user from local storage:", error);
  }

  return {
    user: initialUser,

    actions: {
      setUser: (newValue) =>
        set((prevState) => {
          try {
            const newUser =
              typeof newValue === "function"
                ? newValue(prevState.user)
                : newValue;

            window.localStorage.setItem("user", JSON.stringify(newUser)); // Store changes in local storage
            return { user: newUser };
          } catch (error) {
            console.error("Error setting user in local storage:", error);
          }
          return { user: null };
        }),

      removeUser: () => {
        try {
          window.localStorage.removeItem("user"); // Remove user from local storage
        } catch (error) {
          console.error("Error removing user from local storage:", error);
        }
        set({ user: null });
      },
    },
  };
});

export const useUserStoreActions = () => useUserStore((state) => state.actions);
