import { useCallback, useRef } from "react";

type ThrottleFunction = (...args: unknown[]) => void;

function throttle<T extends ThrottleFunction>(func: T, wait: number) {
  let isCalled = false;

  return function (...args: Parameters<T>) {
    if (!isCalled) {
      func(...args);
      isCalled = true;
      setTimeout(() => {
        isCalled = false;
      }, wait);
    }
  };
}

export const useThrottle = <T extends ThrottleFunction>(
  func: T,
  wait: number
) => {
  const throttledFunc = useRef(throttle(func, wait));

  return useCallback((...args: Parameters<T>) => {
    throttledFunc.current(...args);
  }, []);
};
