import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { memo, useState } from "react";

import { DateTag } from "@/components/chatId/DateTag";
import { MessageContent } from "@/components/chatId/MessageContent";
import { MessageEditor } from "@/components/chatId/MessageEditor";
import { MessageReadIndicator } from "@/components/chatId/MessageReadIndicator";
import { EditIcon } from "@/components/Icons";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { canEditMessage, getLocalDate } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { Message, TextMessage } from "@/types/message";

interface MessageComponentProps {
  isNewDay: boolean;
  message: Message;
  handleDelete: (messageId: string) => void;
  idx: number;
  virtualItemStart: VirtualItem["start"];
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  canDeleteMessage: boolean;
  interlocutorsNumber: number;
}

export const MessageComponent = memo(function MessageComponent({
  isNewDay,
  message,
  handleDelete,
  idx,
  virtualItemStart,
  virtualizer,
  canDeleteMessage,
  interlocutorsNumber,
}: MessageComponentProps) {
  const user = useUserStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);

  const isOwnMessage = message.senderId._id === user?._id;
  const messageCreatedAt = getLocalDate(message.createdAt, "ro-RO").time;
  const ableToEditMessage = canEditMessage(isOwnMessage, message);
  const ableToDeleteMessage = isOwnMessage && canDeleteMessage;

  return (
    <li
      ref={virtualizer.measureElement}
      data-index={idx}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transform: `translateY(${virtualItemStart}px) scaleY(-1)`,
      }}
      className="flex flex-col gap-6"
    >
      <DateTag shouldDisplay={isNewDay} message={message} />
      <div
        // Added slide and opacity animations to mask some of the jank from the virtualizer
        className={`${
          isOwnMessage
            ? "justify-end slide-in-from-right-1/2"
            : message.type === "event"
              ? "justify-center"
              : "justify-start slide-in-from-left-1/2"
        } group flex flex-row gap-2 items-center max-w-full py-1 animate-in fade-in duration-500 ease-in-out`}
      >
        {message.type !== "event" ? (
          <div
            className={`${
              isOwnMessage ? "bg-green-600/60" : "bg-black/60"
            } relative flex flex-row py-2 px-2 max-w-full md:max-w-md lg:max-w-xl rounded-xl overflow-hidden`}
          >
            <div className="flex flex-col w-full overflow-hidden">
              {!isEditing ? (
                <MessageContent message={message} />
              ) : (
                <MessageEditor
                  message={message as TextMessage}
                  setIsEditing={setIsEditing}
                />
              )}
              <div className="flex gap-1 items-center self-end">
                {ableToEditMessage && (
                  <button
                    onClick={() => setIsEditing((prev) => !prev)}
                    className="hidden group-hover:block"
                    title={isEditing ? "Save Message" : "Edit Message"}
                    aria-label={isEditing ? "Save Message" : "Edit Message"}
                  >
                    <EditIcon width="13px" height="13px" />
                  </button>
                )}
                {!isOwnMessage && (
                  <p className="text-xs text-slate-200">
                    {message.senderId.displayName}
                  </p>
                )}
                <p className="text-xs text-slate-200">{messageCreatedAt}</p>
                {isOwnMessage && (
                  <MessageReadIndicator
                    message={message}
                    portalInto={virtualizer.scrollElement?.parentElement}
                    interlocutorsNumber={interlocutorsNumber}
                  />
                )}
              </div>
            </div>
            {ableToDeleteMessage && (
              <div className="w-[40px] h-[35px] absolute z-[10] justify-end py-1.5 px-2 -right-1 -top-1 hidden group-hover:flex bg-message-gradient pointer-events-none">
                <DeleteButton
                  title="Delete Message"
                  aria-label="Delete Message"
                  className="group h-fit pointer-events-auto"
                  onClick={() => handleDelete(message._id)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-black/60 relative flex flex-row py-2 px-2 max-w-full md:max-w-md lg:max-w-xl rounded-md overflow-hidden">
            <div className="flex flex-col w-full overflow-hidden">
              <MessageContent message={message} />
              <p className="text-xs self-center text-slate-200">
                {messageCreatedAt}
              </p>
            </div>
          </div>
        )}
      </div>
    </li>
  );
});
