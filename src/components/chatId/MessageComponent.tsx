import { useParams } from "@tanstack/react-router";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { memo, useCallback, useState } from "react";

import { DateTag } from "@/components/chatId/DateTag";
import { MessageContent } from "@/components/chatId/MessageContent";
import { MessageEditor } from "@/components/chatId/MessageEditor";
import { MessageOptionsOverlay } from "@/components/chatId/MessageOptionsOverlay";
import { MessageOptionsOverlayContent } from "@/components/chatId/MessageOptionsOverlayContent";
import { MessageReadIndicator } from "@/components/chatId/MessageReadIndicator";
import { ArrowSvg } from "@/components/Icons";
import { canEditMessage, getLocalDate } from "@/lib/utils";
import { useAppStoreActions } from "@/stores/useAppStore";
import { useUserStore } from "@/stores/useUserStore";
import { Message, TextMessage } from "@/types/message";

interface MessageComponentProps {
  isNewDay: boolean;
  message: Message;
  idx: number;
  virtualItemStart: VirtualItem["start"];
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  canDeleteMessage: boolean;
  interlocutorsNumber: number;
}

export const MessageComponent = memo(function MessageComponent({
  isNewDay,
  message,
  idx,
  virtualItemStart,
  virtualizer,
  canDeleteMessage,
  interlocutorsNumber,
}: MessageComponentProps) {
  const user = useUserStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const { chatId } = useParams({ from: "/chat/$chatId" });
  const { socketEmit } = useAppStoreActions();

  const isOwnMessage = message.senderId._id === user?._id;
  const messageCreatedAt = getLocalDate(message.createdAt, "ro-RO").time;
  const ableToEditMessage = isOwnMessage && canEditMessage(message);
  const ableToDeleteMessage = isOwnMessage && canDeleteMessage;

  const handleDelete = useCallback(
    (messageId: string) => {
      if (!ableToDeleteMessage) return;
      socketEmit("deleteMessage", { chatId, messageId });
    },
    [chatId, socketEmit, ableToDeleteMessage]
  );

  const handleStartEditing = useCallback(() => {
    if (!ableToEditMessage) return;
    setIsEditing((prev) => !prev);
  }, [ableToEditMessage]);

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
            ? "justify-end slide-in-from-right-1/2 group/message"
            : message.type === "event"
              ? "justify-center"
              : "justify-start slide-in-from-left-1/2"
        } flex flex-row gap-2 items-center max-w-full py-1 animate-in fade-in duration-500 ease-in-out`}
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
            <MessageOptionsOverlay
              portalInto={virtualizer.scrollElement?.parentElement}
              content={
                <MessageOptionsOverlayContent
                  ableToEditMessage={ableToEditMessage}
                  ableToDeleteMessage={ableToDeleteMessage}
                  handleDelete={() => handleDelete(message._id)}
                  handleStartEditing={handleStartEditing}
                />
              }
            >
              <ArrowSvg className="w-[20px] h-[20px]" />
            </MessageOptionsOverlay>
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
