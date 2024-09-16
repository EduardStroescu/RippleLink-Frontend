import { useCallback } from "react";

export const useLocalStorage = <T,>(key: string) => {
  const setItem = useCallback(
    (value: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(error);
      }
    },
    [key]
  );

  const getItem = useCallback((): T | undefined => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : undefined;
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const removeItem = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  return { setItem, getItem, removeItem };
};
