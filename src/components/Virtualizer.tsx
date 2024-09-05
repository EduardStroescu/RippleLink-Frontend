import {
  VirtualItem,
  Virtualizer as TanStackVirtualizer,
} from "@tanstack/react-virtual";
import { forwardRef } from "react";
import { Ref } from "react";

interface VirtualizerProps {
  virtualizer: TanStackVirtualizer<HTMLDivElement, Element>;
  children: ({
    virtualItem,
    ref,
  }: {
    virtualItem: VirtualItem;
    ref: Ref<HTMLDivElement>;
  }) => JSX.Element;
}

export const Virtualizer = forwardRef<HTMLDivElement, VirtualizerProps>(
  ({ virtualizer, children }, ref) => {
    const items = virtualizer.getVirtualItems();

    return (
      <div
        ref={ref}
        className="w-full flex-1 h-full text-white overflow-y-auto overflow-x-hidden flex flex-col contain-strict will-change-transform px-4 scroll-auto"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${items[0]?.start ?? 0}px)`,
            }}
          >
            {items.length > 0 &&
              items.map((virtualItem) =>
                children({
                  virtualItem,
                  ref: virtualizer.measureElement,
                })
              )}
          </div>
        </div>
      </div>
    );
  }
);
