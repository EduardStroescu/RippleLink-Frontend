import { useCallback, useEffect, useState } from "react";

type Args = {
  scrollParent: HTMLDivElement | null;
};

type Return = {
  isAtBottom: boolean;
};

export function useHandleIsAtBottom({ scrollParent }: Args): Return {
  const [isAtBottom, setIsAtBottom] = useState(false);

  const handleIsAtBottom = useCallback(() => {
    if (scrollParent) {
      const { scrollTop, clientHeight, scrollHeight } = scrollParent;
      const threshold = 100; // Buffer for when "close enough" to bottom
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - threshold);
    }
  }, [scrollParent]);

  useEffect(() => {
    if (!scrollParent) return;

    scrollParent.addEventListener("scroll", handleIsAtBottom);

    return () => {
      scrollParent.removeEventListener("scroll", handleIsAtBottom);
    };
  }, [handleIsAtBottom, scrollParent]);

  return {
    isAtBottom,
  };
}
