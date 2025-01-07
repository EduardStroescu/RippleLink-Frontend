import {
  VirtualItem,
  Virtualizer as TanStackVirtualizer,
} from "@tanstack/react-virtual";
import { forwardRef, UIEvent, useRef } from "react";

interface VirtualizerProps {
  virtualizer: TanStackVirtualizer<HTMLDivElement, Element>;
  children: ({ virtualItem }: { virtualItem: VirtualItem }) => JSX.Element;
}

export const Virtualizer = forwardRef<HTMLDivElement, VirtualizerProps>(
  ({ virtualizer, children }, ref) => {
    const items = virtualizer.getVirtualItems();
    const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleDisablePointerEventsOnScroll = (e: UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;

      // Disable pointer events on all iframes within the container
      container.querySelectorAll("iframe").forEach((iframe) => {
        iframe.style.pointerEvents = "none";
      });

      // Clear the timeout to debounce
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set a timeout to re-enable pointer events
      scrollTimeout.current = setTimeout(() => {
        container.querySelectorAll("iframe").forEach((iframe) => {
          iframe.style.pointerEvents = "auto";
        });
      }, 100);
    };

    return (
      <div
        ref={ref}
        className="w-full flex-1 h-full text-white overflow-y-auto overflow-x-hidden flex flex-col contain-strict will-change-transform px-4 scroll-auto"
        style={{
          transform: "scaleY(-1)",
        }}
        onScroll={handleDisablePointerEventsOnScroll}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          {items.length > 0 &&
            items.map((virtualItem) =>
              children({
                virtualItem,
              })
            )}
        </div>
      </div>
    );
  }
);
