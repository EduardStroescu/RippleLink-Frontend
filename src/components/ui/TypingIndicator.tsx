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
    <div
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
        className={`${interlocutorIsTyping ? "" : "opacity-0"} 
          self-start bg-black/40 backdrop-blur-sm
          flex flex-row py-2 px-4 max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-xl`}
      >
        <div className="flex flex-col">
          <p>Typing...</p>
        </div>
      </div>
    </div>
  );
};
