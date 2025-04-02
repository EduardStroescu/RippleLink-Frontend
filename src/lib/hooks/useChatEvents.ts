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
  useSocketSubscription("chatCreated", ({ content }: { content: Chat }) => {
    setChatsCache((prev) => {
      if (!prev) return [content];
      return create(prev, (draft) => {
        const index = draft.findIndex((item) => item._id === content._id);

        if (index === -1) {
          draft.push(content);
        } else {
          draft[index] = { ...draft[index], ...content };
        }
      });
    });
    if (content.lastMessage.senderId._id !== user?._id && !isWindowActive) {
      setNewMessageCount((prev) => prev + 1);
      throttledNotification();
    }
  });

  useSocketSubscription(
    "chatUpdated",
    ({
      content,
    }: {
      content: Chat & { eventType: "create" | "update" | "delete" };
    }) => {
      setChatsCache((prev) => {
        if (!prev) return prev;
        return create(prev, (draft) => {
          const index = draft.findIndex((item) => item._id === content._id);

          if (index === -1) {
            if (content.eventType !== "create") return draft;
            draft.push(content);
          } else {
            draft[index] = { ...draft[index], ...content };
          }
        });
      });
      if (
        content.lastMessage.senderId._id !== user?._id &&
        content.eventType === "create" &&
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
