import { Virtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

export const useResizeVirtualItem = (
  idx: number,
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  isEditing: boolean
) => {
  const resizerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const resizeHandler = () => {
      const elemHeight = resizerRef.current?.getBoundingClientRect()?.height;
      if (!elemHeight) return;

      virtualizer.resizeItem(idx, elemHeight);
    };

    resizeHandler();
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [idx, virtualizer, isEditing]);

  return {
    resizerRef,
  };
};
