import { useParams } from "@tanstack/react-router";
import { create } from "mutative";
import { useEffect } from "react";

import { useSetTanstackCache } from "@/lib/hooks/useSetTanstackCache";
import { useWindowVisibility } from "@/lib/hooks/useWindowVisibility";
import { useAppStore } from "@/stores/useAppStore";
import { useUserStore } from "@/stores/useUserStore";
import { Message } from "@/types/message";

export function useMessageReadStatus(messages: Message[]) {
  const user = useUserStore((state) => state.user);
  const isWindowActive = useWindowVisibility();
  const chatId = useParams({
    from: "/chat/$chatId",
    select: (params) => params.chatId,
  });

  const setMessagesCache = useSetTanstackCache<{
    pages: { messages: Message[]; nextCursor: string | null }[];
    pageParams: (string | null)[];
  }>(["messages", chatId]);

  // Send read receipts for all the messages in the current chat. Only if the window is focused/active
  useEffect(() => {
    if (!user?._id || !user?.displayName || !chatId || !isWindowActive) return;

    const interlocutorMessages = messages.filter(
      (message) => message.senderId._id !== user._id
    );

    if (
      interlocutorMessages.length > 0 &&
      !interlocutorMessages[0].readBy.some(
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
                  userId: {
                    _id: user._id,
                    displayName: user.displayName,
                    avatarUrl: undefined,
                  },
                  timestamp: new Date().toISOString(),
                });
              }
            });
          });
        });
      });

      useAppStore.getState().actions.socketEmit("readMessages", { chatId });
    }
  }, [
    chatId,
    messages,
    setMessagesCache,
    user?._id,
    user?.displayName,
    isWindowActive,
  ]);
}
