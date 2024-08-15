import { useSocketContext } from "@/providers/SocketProvider";
import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";
import { useEffect, useState } from "react";
import useNotificationSound from "./useNotificationSound";
import { useThrottle } from "./useThrottle";
import useWindowVisibility from "./useWindowVisibility";

export function useChatEvents(
  setChats: (
    updateFunction: (
      prevChats: Chat[] | [] | undefined
    ) => Chat[] | [] | undefined
  ) => void
) {
  const user = useUserStore((state) => state.user);
  const { socket } = useSocketContext();
  const playSound = useNotificationSound("/notification.mp3");
  const isWindowActive = useWindowVisibility();
  const [newMessageCount, setNewMessageCount] = useState(0);

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

  useEffect(() => {
    if (!socket) return;
    const chatCreatedHandler = ({ content }: { content: Chat }) => {
      setChats((prev) => (prev ? [...prev, content] : [content]));
      if (content.lastMessage.senderId._id !== user?._id && !isWindowActive) {
        throttledNotification();
      }
    };
    const chatUpdatedHandler = ({ content }: { content: Chat }) => {
      setChats((prev) => {
        if (!prev) return [content];
        const index = prev?.findIndex((item) => item._id === content._id);
        if (index === -1) return [...prev, content];
        prev[index] = content;
        return [...prev];
      });
      if (content.lastMessage.senderId._id !== user?._id && !isWindowActive) {
        throttledNotification();
      }
    };

    socket.on("chatCreated", chatCreatedHandler);
    socket.on("chatUpdated", chatUpdatedHandler);

    return () => {
      socket.off("chatCreated");
      socket.off("chatUpdated");
    };
  }, [socket, throttledNotification, isWindowActive, user?._id]);

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
