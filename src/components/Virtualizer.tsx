import {
  VirtualItem,
  Virtualizer as TanStackVirtualizer,
} from "@tanstack/react-virtual";
import { forwardRef } from "react";

interface VirtualizerProps {
  virtualizer: TanStackVirtualizer<HTMLDivElement, Element>;
  children: ({ virtualItem }: { virtualItem: VirtualItem }) => JSX.Element;
}

export const Virtualizer = forwardRef<HTMLDivElement, VirtualizerProps>(
  ({ virtualizer, children }, ref) => {
    const items = virtualizer.getVirtualItems();

    return (
      <div
        ref={ref}
        className="w-full flex-1 h-full text-white overflow-y-auto overflow-x-hidden flex flex-col contain-strict will-change-transform px-4 scroll-auto"
        style={{
          transform: "scaleY(-1)",
        }}
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
