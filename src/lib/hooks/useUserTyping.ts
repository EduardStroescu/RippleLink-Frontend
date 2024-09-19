import { useEffect } from "react";
import { useThrottle } from "./useThrottle";
import { useAppStore } from "@/stores/useAppStore";

export function useUserTyping(params, message: string) {
  const socket = useAppStore((state) => state.socket);

  const handleTyping = useThrottle(() => {
    if (!socket) return;
    socket.emit("typing", { room: params.chatId, isTyping: true });
  }, 2000);

  useEffect(() => {
    if (!socket) return;

    if (!message) {
      socket.emit("typing", { room: params.chatId, isTyping: false });
    } else {
      handleTyping();
    }
  }, [socket, message, handleTyping, params.chatId]);
}
