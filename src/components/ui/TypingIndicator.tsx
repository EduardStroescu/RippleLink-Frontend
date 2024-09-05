import { VirtualItem } from "@tanstack/react-virtual";
import { forwardRef } from "react";

interface TypingIndicatorProps {
  interlocutorIsTyping: boolean;
  virtualItem: VirtualItem;
}

export const TypingIndicator = forwardRef<HTMLDivElement, TypingIndicatorProps>(
  ({ interlocutorIsTyping, virtualItem }, ref) => {
    return (
      <div
        ref={ref}
        data-index={virtualItem.index}
        className="py-2 w-fit pointer-events-none"
      >
        <div
          className={`${interlocutorIsTyping ? "" : "opacity-0"} 
          self-start bg-black/60
          flex flex-row py-2 px-4 max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-xl`}
        >
          <div className="flex flex-col">
            <p>Typing...</p>
          </div>
        </div>
      </div>
    );
  }
);
