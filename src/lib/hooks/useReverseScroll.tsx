import { useEffect, useRef, useState } from "react";

import { lerp } from "@/lib/utils";

const WHEEL_DRAG_SPEED = 0.2; // Adjust the speed for middle mouse scroll
const SCROLL_LERP_ALPHA = 0.07; // Adjust the lerp alpha for smoother scrolling

export const useReverseScroll = (
  containerRef: React.MutableRefObject<HTMLDivElement | null>
) => {
  const [scrollType, setScrollType] = useState<"wheel" | "touch" | "manual">(
    "wheel"
  ); // Store the scroll type

  const isMiddleMouseDownRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const targetScrollRef = useRef(0);
  const iframesRef = useRef<NodeListOf<HTMLIFrameElement> | []>([]);
  const scrollDistanceRef = useRef(0);
  const lastMouseYRef = useRef(0); // Used to calculate the scroll distance between initial click and mouse movement

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    targetScrollRef.current = el.scrollTop; // Initialize target scroll position

    const invertedWheelScroll = (event: WheelEvent) => {
      event.preventDefault(); // Prevent default scroll behavior
      iframesRef.current = document.querySelectorAll("iframe");
      scrollType !== "wheel" && setScrollType("wheel");

      // Calculate target scroll position based on inverted wheel movement
      targetScrollRef.current = Math.min(
        el.scrollHeight - el.clientHeight, // Max scroll bottom
        Math.max(0, targetScrollRef.current - event.deltaY) // Min scroll top
      );
    };

    const handleTouchStart = () => {
      scrollType !== "touch" && setScrollType("touch");
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!el) return;

      if (event.key === "ArrowUp") {
        event.preventDefault();
        scrollType !== "wheel" && setScrollType("wheel");
        targetScrollRef.current = Math.min(
          el.scrollHeight - el.clientHeight, // Max scroll bottom
          Math.max(0, targetScrollRef.current + 50) // Min scroll top
        );
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        scrollType !== "wheel" && setScrollType("wheel");
        targetScrollRef.current = Math.min(
          el.scrollHeight - el.clientHeight, // Max scroll bottom
          Math.max(0, targetScrollRef.current - 50) // Min scroll top
        );
      }
    };

    const animateScroll = () => {
      if (!el || scrollType !== "wheel") return;
      el.scrollTop = lerp(
        el.scrollTop,
        targetScrollRef.current,
        SCROLL_LERP_ALPHA
      );

      if (isMiddleMouseDownRef.current === true) {
        targetScrollRef.current = Math.min(
          el.scrollHeight - el.clientHeight, // Max scroll bottom
          Math.max(
            0,
            targetScrollRef.current -
              scrollDistanceRef.current * WHEEL_DRAG_SPEED
          ) // Min scroll top
        );
      }

      if (targetScrollRef.current !== el.scrollTop) {
        // Disable pointer events on all iframes within the container
        iframesRef.current.forEach((iframe: HTMLIFrameElement) => {
          iframe.style.pointerEvents = "none";
        });
      } else {
        iframesRef.current.forEach((iframe: HTMLIFrameElement) => {
          iframe.style.pointerEvents = "auto";
        });
      }

      animationFrameRef.current = requestAnimationFrame(animateScroll);
    };

    const handleMouseDown = (event: MouseEvent) => {
      // Handle middle mouse button click
      if (event.button === 1) {
        event.preventDefault();
        scrollType !== "wheel" && setScrollType("wheel");
        document.body.style.cursor = "all-scroll";
        lastMouseYRef.current = event.clientY;
        isMiddleMouseDownRef.current = true;
        // Handle manual scrollbar dragging. Detect if user clicked on the scrollbar
      } else if (event.button === 0 && event.offsetX > el.clientWidth) {
        setScrollType("manual");
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 1) {
        isMiddleMouseDownRef.current = false;
        document.body.style.cursor = "auto";
        scrollDistanceRef.current = 0;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMiddleMouseDownRef.current) {
        const distance = event.clientY - lastMouseYRef.current;
        scrollDistanceRef.current = distance;
      }
    };

    el?.addEventListener("wheel", invertedWheelScroll, { passive: false });
    el?.addEventListener("mousedown", handleMouseDown, { passive: false });
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    el?.addEventListener("touchstart", handleTouchStart);
    el?.addEventListener("keydown", handleKeyDown);

    // Start animation when scrollType is "wheel"
    if (scrollType === "wheel" && animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(animateScroll);
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current); // Cancel any pending animation frame
        animationFrameRef.current = null;
      }
      el?.removeEventListener("wheel", invertedWheelScroll);
      el?.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      el?.removeEventListener("touchstart", handleTouchStart);
      el?.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, scrollType]);
};
