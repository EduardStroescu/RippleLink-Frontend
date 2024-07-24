import { forwardRef } from "react";

interface TypingIndicatorProps {
  userIsTyping: boolean;
}

export const TypingIndicator = forwardRef<HTMLDivElement, TypingIndicatorProps>(
  ({ userIsTyping }, ref) => {
    return (
      <div
        ref={ref}
        className={`${userIsTyping ? "" : "opacity-0"} 
          self-start bg-black/60 
          flex flex-row py-2 px-4 max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-xl`}
      >
        <div className="flex flex-col">
          <p>Typing...</p>
        </div>
      </div>
    );
  }
);
