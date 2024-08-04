import { useEffect } from "react";
import { useThrottle } from "./useThrottle";
import { useSocketContext } from "@/providers/SocketProvider";

export function useUserTyping(params: any, message: string) {
  const { socket } = useSocketContext();

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
  }, [socket, message, handleTyping]);
}
