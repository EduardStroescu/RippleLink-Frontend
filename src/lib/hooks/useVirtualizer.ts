import { useCallback, useEffect, useMemo, useRef } from "react";
import { useVirtualizer as useTSVirtualizer } from "@tanstack/react-virtual";
import { useIsAtBottom, useReverseScroll } from "@/lib/hooks";

export const useVirtualizer = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  messages,
}) => {
  const scrollParentRef = useRef<HTMLDivElement | null>(null);
  const count = useMemo(() => (messages ? messages.length + 1 : 0), [messages]);
  const virtualizer = useTSVirtualizer({
    count,
    getScrollElement: () => scrollParentRef?.current,
    estimateSize: () => 64,
    overscan: 10,
    getItemKey: (index) => messages?.[index]?._id || index,
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

  const getMessageContent = useCallback(
    (virtualIndex: number) => messages?.[virtualIndex - 1],
    [messages]
  );

  return {
    scrollParentRef,
    virtualizer,
    getMessageContent,
  };
};
