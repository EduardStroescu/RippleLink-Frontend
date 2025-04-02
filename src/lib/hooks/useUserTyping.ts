import { useEffect } from "react";
import { Socket } from "socket.io-client";

import { useThrottle } from "@/lib/hooks/useThrottle";
import { useAppStore } from "@/stores/useAppStore";
import { Chat } from "@/types/chat";

export function useUserTyping(chatId: Chat["_id"], message: string) {
  const socket = useAppStore((state) => state.socket);

  const handleTyping = useThrottle((socket: Socket) => {
    socket.emit("typing", { chatId, isTyping: true });
  }, 2000);

  useEffect(() => {
    if (!socket) return;

    if (!message) {
      socket.emit("typing", { chatId, isTyping: false });
    } else {
      handleTyping(socket);
    }
  }, [socket, message, handleTyping, chatId]);
}
