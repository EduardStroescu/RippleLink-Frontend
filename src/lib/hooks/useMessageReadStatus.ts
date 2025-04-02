import { useParams } from "@tanstack/react-router";
import { create } from "mutative";
import { useEffect } from "react";

import { useSetTanstackCache } from "@/lib/hooks/useSetTanstackCache";
import { useAppStore } from "@/stores/useAppStore";
import { useUserStore } from "@/stores/useUserStore";
import { Message } from "@/types/message";

export function useMessageReadStatus(messages: Message[] | []) {
  const socket = useAppStore((state) => state.socket);
  const user = useUserStore((state) => state.user);
  const chatId = useParams({
    from: "/chat/$chatId",
    select: (params) => params.chatId,
  });

  const setMessagesCache = useSetTanstackCache<{
    pages: { messages: Message[]; nextCursor: string | null }[];
    pageParams;
  }>(["messages", chatId]);

  useEffect(() => {
    if (!socket || !user?._id || !user?.displayName || !chatId) return;

    const interlocutorMessages = messages
      ? messages?.filter((message) => message?.senderId?._id !== user._id)
      : [];

    if (
      interlocutorMessages.length > 0 &&
      !interlocutorMessages?.[0]?.readBy.some(
        (member) => member.userId._id === user._id
      )
    ) {
      // Update messages to set read status
      setMessagesCache((prevData) => {
        if (!prevData) return prevData;

        return create(prevData, (draft) => {
          // Iterate through each page and update message read status
          draft.pages.forEach((page) => {
            page.messages.forEach((message) => {
              if (message.senderId._id !== user._id) {
                message.readBy.push({
                  userId: { _id: user._id, displayName: user.displayName },
                  timestamp: new Date().toISOString(),
                });
              }
            });
          });
        });
      });
      console.log("readingMessages");
      socket.emit("readMessages", { chatId });
    }
  }, [
    chatId,
    messages,
    setMessagesCache,
    socket,
    user?._id,
    user?.displayName,
  ]);
}
