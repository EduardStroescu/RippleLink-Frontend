import { useCallback, useRef } from "react";

type DebounceFunction<T extends unknown[]> = (...args: T) => void;

function debounce<T extends unknown[]>(
  func: DebounceFunction<T>,
  delay: number
): DebounceFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: T) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export const useDebounce = <T extends unknown[]>(
  func: DebounceFunction<T>,
  delay: number
) => {
  const funcRef = useRef(func);
  const delayRef = useRef(delay);

  // Update the refs if the function or delay changes
  funcRef.current = func;
  delayRef.current = delay;

  // Create a debounced function
  const debouncedFunc = useRef(
    debounce((...args: T) => funcRef.current(...args), delayRef.current)
  ).current;

  return useCallback(
    (...args: T) => {
      debouncedFunc(...args);
    },
    [debouncedFunc]
  );
};
