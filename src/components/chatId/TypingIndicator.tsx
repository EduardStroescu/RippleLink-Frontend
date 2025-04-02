import { VirtualItem } from "@tanstack/react-virtual";

interface TypingIndicatorProps {
  interlocutorIsTyping: boolean;
  virtualItem: VirtualItem;
}

export const TypingIndicator = ({
  interlocutorIsTyping,
  virtualItem,
}: TypingIndicatorProps) => {
  return (
    <li
      data-index={virtualItem.index}
      className="py-2 w-fit pointer-events-none"
      style={{
        position: "absolute",
        height: `${virtualItem.size}px`,
        top: 0,
        left: 0,
        transform: `translateY(${virtualItem.start}px) scaleY(-1)`,
      }}
    >
      <div
        className={`${interlocutorIsTyping ? "opacity-1" : "opacity-0"} 
          self-start bg-black/40 backdrop-blur-sm
          flex flex-row py-2 px-4 max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-xl`}
      >
        <div className="flex flex-col">
          <p className="animate-pulse flex gap-0.5">
            Typing
            <span className="animate-bounce h-[1rem] text-xl inline-block">
              .
            </span>
            <span className="animate-bounce h-[1rem] text-xl delay-100 inline-block">
              .
            </span>
            <span className="animate-bounce h-[1rem] text-xl delay-200 inline-block">
              .
            </span>
          </p>
        </div>
      </div>
    </li>
  );
};
