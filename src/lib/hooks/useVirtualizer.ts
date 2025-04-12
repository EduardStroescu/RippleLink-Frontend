import { useVirtualizer as useTSVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useRef } from "react";

import { useIsAtBottom } from "@/lib/hooks/useIsAtBottom";
import { useReverseScroll } from "@/lib/hooks/useReverseScroll";

interface UseVirtualizerParams<T> {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  data: T[];
}

export const useVirtualizer = <T extends { _id?: string }>({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  data,
}: UseVirtualizerParams<T>) => {
  const scrollParentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useTSVirtualizer({
    count: data.length + 1,
    getScrollElement: () => scrollParentRef?.current,
    estimateSize: () => 64,
    overscan: 15,
    getItemKey: (index) =>
      index === 0 ? "typingIndicator" : data[index - 1]?._id || index,
  });

  useReverseScroll(scrollParentRef);
  const { isAtBottom, setIsAtBottom } = useIsAtBottom({
    scrollParent: scrollParentRef.current,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasNextPage && isAtBottom && !isFetchingNextPage) {
        fetchNextPage();
        setIsAtBottom(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    fetchNextPage,
    hasNextPage,
    isAtBottom,
    isFetchingNextPage,
    setIsAtBottom,
  ]);

  const getRowContent = useCallback(
    (virtualIndex: number) => data[virtualIndex - 1],
    [data]
  );

  return {
    scrollParentRef,
    virtualizer,
    getRowContent,
  };
};
