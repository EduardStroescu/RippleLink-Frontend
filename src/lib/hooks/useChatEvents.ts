import { useSocketContext } from "@/providers/SocketProvider";
import { useUserStore } from "@/stores/useUserStore";
import { useEffect, useState } from "react";
import { Chat } from "@/types";

import {
  useNotificationSound,
  useThrottle,
  useWindowVisibility,
  useSocketSubscription,
  useSetChatsCache,
} from "@/lib/hooks";

import { create } from "mutative";

export function useChatEvents() {
  const user = useUserStore((state) => state.user);
  const { socket } = useSocketContext();
  const playSound = useNotificationSound();
  const isWindowActive = useWindowVisibility();
  const [newMessageCount, setNewMessageCount] = useState(0);
  const setChatsCache = useSetChatsCache();

  useEffect(() => {
    if (!socket || !user?._id) return;
    socket.emit("joinRoom", { room: user._id });
    return () => {
      socket.emit("leaveRoom", { room: user._id });
    };
  }, [socket, user?._id]);

  const throttledNotification = useThrottle(() => {
    setNewMessageCount((prev) => prev + 1);
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
      throttledNotification();
    }
  });

  useSocketSubscription("chatUpdated", ({ content }: { content: Chat }) => {
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
      throttledNotification();
    }
  });

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
