import { useEffect } from "react";
import { useSetMessagesCache } from "./useSetMessagesCache";
import { create } from "mutative";
import { useUserStore } from "@/stores/useUserStore";
import { useParams } from "@tanstack/react-router";
import { Message } from "@/types";
import { useAppStore } from "@/stores/useAppStore";

export function useMessageReadStatus(messages: Message[] | []) {
  const socket = useAppStore((state) => state.socket);
  const user = useUserStore((state) => state.user);
  const params = useParams({ from: "/chat/$chatId" });

  const setMessagesCache = useSetMessagesCache(params.chatId);

  useEffect(() => {
    if (!socket || !user?._id) return;

    const interlocutorMessages = messages
      ? messages?.filter((message) => message?.senderId?._id !== user._id)
      : [];

    if (interlocutorMessages.length > 0 && !interlocutorMessages?.[0]?.read) {
      // Update messages to set read status
      setMessagesCache((prevData) => {
        if (!prevData) return prevData;

        return create(prevData, (draft) => {
          // Iterate through each page and update message read status
          draft.pages.forEach((page) => {
            page.messages.forEach((message) => {
              if (message.senderId._id !== user._id) {
                message.read = true;
              }
            });
          });
        });
      });

      socket.emit("readMessages", { room: params.chatId });
    }
  }, [socket, messages, user?._id, params.chatId, setMessagesCache]);
}
