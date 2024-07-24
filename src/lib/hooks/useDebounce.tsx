import { useCallback, useRef } from "react";

type DebounceFunc = (...args: unknown[]) => void;

export const useDebounce = <T extends DebounceFunc>(func: T, delay: number) => {
  const inDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstCall = useRef(true);

  const debounce = useCallback(
    (...args: Parameters<T>) => {
      if (isFirstCall.current) {
        func(...args);
        isFirstCall.current = false;
      }

      if (inDebounce.current) {
        clearTimeout(inDebounce.current);
      }
      inDebounce.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay]
  );

  return debounce;
};
