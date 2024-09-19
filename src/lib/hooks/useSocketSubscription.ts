import { useAppStore } from "@/stores/useAppStore";
import { useEffect, useRef } from "react";

export function useSocketSubscription<T>(
  event: string,
  callback: (data: T) => void
) {
  const socket = useAppStore((state) => state.socket);
  const callbackRef = useRef(callback);

  // Keep the callback reference updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!socket) return;

    const handleEvent = (data: T) => {
      callbackRef.current(data);
    };

    socket.on(event, handleEvent);

    return () => {
      socket.off(event, handleEvent);
    };
  }, [socket, event]);
}
