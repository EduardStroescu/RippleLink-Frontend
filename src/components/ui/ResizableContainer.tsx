import { useCallback,useEffect, useRef, useState } from "react";

interface ResizableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ResizableContainer: React.FC<ResizableContainerProps> = ({
  children,
  className,
}) => {
  const [height, setHeight] = useState<number>(210);
  const [dragging, setDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrag = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDrag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (dragging && containerRef.current) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();

        // Determine clientY based on event type
        const clientY =
          e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

        // Calculate new height based on the mouse or touch position
        const mouseYRelativeToContainer = clientY - containerRect.top;

        // Ensure that the new height is within bounds
        const newHeight = Math.max(mouseYRelativeToContainer, 210); // Minimum height

        setHeight(newHeight);
      }
    },
    [dragging]
  );

  const stopDrag = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("touchmove", onDrag);
      window.addEventListener("mouseup", stopDrag);
      window.addEventListener("touchend", stopDrag);
      return () => {
        window.removeEventListener("mousemove", onDrag);
        window.removeEventListener("touchmove", onDrag);
        window.removeEventListener("mouseup", stopDrag);
        window.removeEventListener("touchend", stopDrag);
      };
    }
  }, [dragging, onDrag, stopDrag]);

  return (
    <div
      ref={containerRef}
      style={{
        height: `${height}px`,
        position: "relative",
      }}
      className={className}
    >
      {children}
      <div
        className="group w-full h-[10px] absolute bottom-0 left-0 cursor-ns-resize flex justify-center items-center"
        aria-label="Drag to resize"
        title="Drag to resize"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <span className="w-[30px] h-[4px] bg-slate-400 group-hover:bg-slate-300 rounded" />
      </div>
    </div>
  );
};
