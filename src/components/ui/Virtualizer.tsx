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
  function Virtualizer({ virtualizer, children }, ref) {
    const items = virtualizer.getVirtualItems();

    return (
      <section className="w-full h-full text-white contain-strict">
        <div
          // tabIndex to allow focus on the virtualizer for keyboard navigation
          tabIndex={0}
          ref={ref}
          className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col contain-strict will-change-transform px-4 scroll-auto"
          style={{
            transform: "scaleY(-1)",
          }}
        >
          <ul
            style={{
              height: virtualizer.getTotalSize(),
              width: "100%",
              position: "relative",
            }}
          >
            {!!items.length &&
              items.map((virtualItem) =>
                children({
                  virtualItem,
                })
              )}
          </ul>
        </div>
      </section>
    );
  }
);
