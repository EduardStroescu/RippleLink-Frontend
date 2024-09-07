import { useEffect, useState } from "react";

export const useReverseScroll = (containerRef) => {
  const [isMiddleMouseDown, setIsMiddleMouseDown] = useState(false);
  const scrollSpeed = 5; // Adjust the speed for middle mouse scroll

  useEffect(() => {
    const el = containerRef.current;

    const invertedWheelScroll = (event) => {
      el.scrollTop -= event.deltaY; // Reverse scroll direction
      event.preventDefault(); // Prevent default scroll behavior
    };

    const handleMiddleMouseDown = (event) => {
      if (event.button === 1) {
        // Middle mouse button
        event.preventDefault();
        setIsMiddleMouseDown(true);
      }
    };

    const handleMouseUp = () => {
      setIsMiddleMouseDown(false);
    };

    const handleMouseMove = (event) => {
      if (isMiddleMouseDown) {
        el.scrollTop -= event.movementY * scrollSpeed; // Reverse middle mouse auto-scroll
      }
    };

    el?.addEventListener("wheel", invertedWheelScroll, false);
    el?.addEventListener("mousedown", handleMiddleMouseDown, false);
    document.addEventListener("mouseup", handleMouseUp, false);
    el?.addEventListener("mousemove", handleMouseMove, false);

    return () => {
      el?.removeEventListener("wheel", invertedWheelScroll);
      el?.removeEventListener("mousedown", handleMiddleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      el?.removeEventListener("mousemove", handleMouseMove);
    };
  }, [containerRef, isMiddleMouseDown, scrollSpeed]);
};
