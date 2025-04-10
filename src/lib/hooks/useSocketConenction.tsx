import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

import { useAppStoreActions } from "@/stores/useAppStore";
import { useUserStore } from "@/stores/useUserStore";

export function useSocketConnection() {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

  const socketRef = useRef<Socket | null>(null);
  const { setSocket } = useAppStoreActions();

  const handleSocketCleanup = useCallback(() => {
    if (!socketRef?.current) return;

    socketRef.current.removeAllListeners();
    socketRef.current.disconnect();
    socketRef.current = null;
    setSocket(null);
  }, [setSocket]);

  const initSocket = useCallback(() => {
    if (!user?.access_token) return;

    socketRef.current = io(import.meta.env.VITE_BACKEND_URL, {
      query: {
        _id: user._id,
        displayName: user.displayName,
      },
      extraHeaders: {
        Authorization: user.access_token,
      },
    });

    const handleError = async ({ message }: { message: string }) => {
      if (message === "Failed to connect") {
        queryClient.invalidateQueries({
          predicate: (query) =>
            ["chats", "messages"].includes(query.queryKey[0] as string),
          refetchType: "all",
          type: "all",
        });
        return;
      }
    };

    socketRef.current.on("error", handleError);
    setSocket(socketRef.current);
  }, [
    setSocket,
    user?._id,
    user?.access_token,
    user?.displayName,
    queryClient,
  ]);

  useEffect(() => {
    if (socketRef.current) return;
    initSocket();

    return () => {
      handleSocketCleanup();
    };
  }, [handleSocketCleanup, initSocket]);
}
