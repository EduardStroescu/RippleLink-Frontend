import { memo, useRef, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { useUserStore } from "@/stores/useUserStore";

import { CheckIcon, EditIcon } from "./Icons";
import { DeleteButton } from "./ui/DeleteButton";
import { adaptTimezone, canEditMessage } from "@/lib/utils";
import { useResizeVirtualItem } from "@/lib/hooks/useResizeVirtualItem";
import { MessageEditor } from "./MessageEditor";
import { MessageContent } from "./MessageContent";
import { Message } from "@/types/message";
import { useAppStore } from "@/stores/useAppStore";

interface MessageComponentProps {
  message: Message | undefined;
  handleDelete: (messageId?: string) => void;
  idx: number;
  virtualItem: VirtualItem;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  canDeleteMessage: boolean;
}

export const MessageComponent = memo(
  ({
    message,
    handleDelete,
    idx,
    virtualItem,
    virtualizer,
    canDeleteMessage,
  }: MessageComponentProps) => {
    const { chatId } = useParams({ from: "/chat/$chatId" });
    const socket = useAppStore((state) => state.socket);

    const user = useUserStore((state) => state.user);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedMessage, setUpdatedMessage] = useState(message?.content);

    const formRef = useRef<HTMLFormElement>(null);

    const { resizerRef } = useResizeVirtualItem(idx, virtualizer, isEditing);

    const isOwnMessage = message?.senderId?._id === user?._id;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (socket && message) {
        setIsEditing(false);
        socket.emit("updateMessage", {
          room: chatId,
          messageId: message._id,
          message: updatedMessage,
        });
      }
    };

    const handleKeyDown = () => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    };

    return (
      <div
        ref={resizerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          transform: `translateY(${virtualItem.start}px) scaleY(-1)`,
        }}
        className={`${
          isOwnMessage ? "justify-end" : "justify-start"
        } group flex flex-row gap-2 items-center max-w-full py-1`}
      >
        <div
          className={`${
            isOwnMessage ? "bg-green-600/60" : "bg-black/60"
          } relative flex flex-row py-2 px-3 max-w-full md:max-w-md lg:max-w-xl rounded-xl overflow-hidden`}
        >
          <div className="flex flex-col w-full overflow-hidden">
            {!isEditing ? (
              <MessageContent message={message} />
            ) : (
              <MessageEditor
                ref={formRef}
                handleSubmit={handleSubmit}
                setUpdatedMessage={setUpdatedMessage}
                updatedMessage={updatedMessage}
                handleKeyDown={handleKeyDown}
              />
            )}
            <div className="flex gap-1 items-center self-end">
              {!isOwnMessage && (
                <p className="text-xs">{message?.senderId.displayName}</p>
              )}
              {canEditMessage(
                isOwnMessage,
                message?.createdAt,
                message?.type
              ) && <EditButton onClick={() => setIsEditing((prev) => !prev)} />}
              <p className="text-xs">
                {adaptTimezone(message?.createdAt, "ro-RO")?.slice(0, 6)}
              </p>
              {message?.read && isOwnMessage && (
                <CheckIcon width="10px" height="10px" />
              )}
            </div>
          </div>
          {isOwnMessage && canDeleteMessage && !isEditing && (
            <div className="w-[40px] h-[35px] absolute justify-end py-1.5 px-2 -right-1 -top-1 hidden group-hover:flex bg-message-gradient pointer-events-none">
              <DeleteButton
                className="group h-fit pointer-events-auto"
                onClick={() => handleDelete(message?._id)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

const EditButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick} className="opacity-0 group-hover:opacity-100">
      <EditIcon width="13px" height="13px" />
    </button>
  );
};
