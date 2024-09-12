import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useSocketContext } from "@/providers/SocketProvider";
import { useUserTyping } from "./useUserTyping";
import { Message, User } from "@/types";
import { useSetMessagesCache } from "./useSetMessagesCache";
import { create } from "mutative";
import { v4 as uuidv4 } from "uuid";
import { useUserStore } from "@/stores/useUserStore";

export function useCreateMessage() {
  const { socket } = useSocketContext();
  const user = useUserStore((state) => state.user);

  const params = useParams({ from: "/chat/$chatId" });
  const [message, setMessage] = useState<Message["content"]>("");
  const [messageType, setMessageType] = useState<Message["type"]>("text");
  const [gif, setGif] = useState<string | null>(null);
  const [contentPreview, setContentPreview] = useState<{
    content: string | null;
    name: string | null;
  } | null>(null);

  const setMessagesCache = useSetMessagesCache(params.chatId);

  useUserTyping(params, message);

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (gif) {
      const payload = { room: params.chatId, message: gif, type: "text" };
      socket?.emit("createMessage", payload);
      setGif(null);
    } else if (contentPreview?.content && messageType !== "text") {
      const payload = {
        room: params.chatId,
        message: contentPreview.content,
        type: messageType,
        tempId: uuidv4(),
      };
      socket?.emit("createMessage", payload);
      setContentPreview(null);

      // Create a temporary message to display the preview
      const tempMessage = {
        _id: payload.tempId,
        chatId: payload.room,
        content: payload.message,
        type: payload.type,
        senderId: { _id: user?._id, displayName: user?.displayName } as User,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Message;
      setMessagesCache((prevData) => {
        if (!prevData) {
          return {
            pages: [{ messages: [tempMessage], nextCursor: null }],
            pageParams: [],
          };
        }

        return create(prevData, (draft) => {
          // Add new message to the end of the latest page's messages
          if (draft.pages.length > 0) {
            draft.pages[0].messages.push(tempMessage);
          } else {
            // No pages exist, initialize with the new message
            draft.pages.push({ messages: [tempMessage], nextCursor: null });
          }
        });
      });
    } else {
      if (message.length === 0) return;

      const payload = { room: params.chatId, message, type: "text" };
      socket?.emit("createMessage", payload);
      setMessage("");
    }
  };

  return {
    handleSubmitMessage,
    message,
    contentPreview,
    messageType,
    setMessage,
    setGif,
    setMessageType,
    setContentPreview,
  };
}
