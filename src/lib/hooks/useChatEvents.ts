import { create } from "mutative";
import { useEffect, useState } from "react";

import { useNotificationSound } from "@/lib/hooks/useNotificationSound";
import { useSetTanstackCache } from "@/lib/hooks/useSetTanstackCache";
import { useSocketSubscription } from "@/lib/hooks/useSocketSubscription";
import { useThrottle } from "@/lib/hooks/useThrottle";
import { useWindowVisibility } from "@/lib/hooks/useWindowVisibility";
import { useAppStore } from "@/stores/useAppStore";
import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";

export function useChatEvents() {
  const user = useUserStore((state) => state.user);
  const socket = useAppStore((state) => state.socket);
  const playSound = useNotificationSound();
  const isWindowActive = useWindowVisibility();
  const [newMessageCount, setNewMessageCount] = useState(0);
  const setChatsCache = useSetTanstackCache<Chat[]>(["chats", user?._id]);

  useEffect(() => {
    if (!socket || !user?._id) return;
    socket.emit("joinRoom", { room: user._id });
    return () => {
      socket.emit("leaveRoom", { room: user._id });
    };
  }, [socket, user?._id]);

  const throttledNotification = useThrottle(() => {
    playSound();
  }, 1000);

  // Handle chatCreated and chatUpdated events
  useSocketSubscription(
    "chatCreatedOrUpdated",
    ({ chat, eventType }: { chat: Chat; eventType: "create" | "update" }) => {
      setChatsCache((prev) => {
        if (!prev) return eventType === "create" ? [chat] : prev;

        return create(prev, (draft) => {
          const index = draft.findIndex((item) => item._id === chat._id);

          if (index === -1) {
            if (eventType !== "create") return draft;
            draft.push(chat);
          } else {
            draft[index] = { ...draft[index], ...chat };
          }
        });
      });

      if (
        chat.lastMessage.senderId._id !== user?._id &&
        eventType === "create" &&
        !isWindowActive
      ) {
        setNewMessageCount((prev) => prev + 1);
        throttledNotification();
      }
    }
  );

  // Update document title based on window visibility and new message count
  useEffect(() => {
    if (isWindowActive) {
      document.title = "RippleLink";
      setNewMessageCount(0);
    } else {
      if (newMessageCount === 0) return;
      document.title = `(${newMessageCount}) New Messages`;
    }
  }, [isWindowActive, newMessageCount]);
}
