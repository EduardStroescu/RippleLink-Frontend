import { useCallback, useRef } from "react";

type ThrottleFunction<T extends unknown[]> = (...args: T) => void;

function throttle<T extends unknown[]>(
  func: ThrottleFunction<T>,
  wait: number
): ThrottleFunction<T> {
  let isCalled = false;

  return function (...args: T) {
    if (!isCalled) {
      func(...args);
      isCalled = true;
      setTimeout(() => {
        isCalled = false;
      }, wait);
    }
  };
}

export const useThrottle = <T extends unknown[]>(
  func: ThrottleFunction<T>,
  wait: number
) => {
  const funcRef = useRef(func);
  const waitRef = useRef(wait);

  funcRef.current = func;
  waitRef.current = wait;

  const throttledFunc = useRef(
    throttle((...args: T) => funcRef.current(...args), waitRef.current)
  ).current;

  return useCallback(
    (...args: T) => {
      throttledFunc(...args);
    },
    [throttledFunc]
  );
};
