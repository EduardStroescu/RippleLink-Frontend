import { useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/components/ui/use-toast";
import { useAppStoreActions } from "@/stores/useAppStore";
import { useUserStore } from "@/stores/useUserStore";
import { useQueryClient } from "@tanstack/react-query";

export function useSocketConnection() {
  const user = useUserStore((state) => state.user);

  const socketRef = useRef<Socket | null>(null);
  const { setSocket } = useAppStoreActions();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSocketCleanup = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.removeAllListeners();
    socketRef.current.disconnect();
    socketRef.current = null;
    setSocket(null);
  }, [setSocket]);

  const initSocket = useCallback(() => {
    if (!user || !user.access_token) return;
    console.log("Connected");

    socketRef.current = io(import.meta.env.VITE_BACKEND_URL, {
      query: {
        _id: user._id,
        displayName: user.displayName,
      },
      extraHeaders: {
        Authorization: user.access_token,
      },
    });
    setSocket(socketRef.current);

    const handleError = ({ message }: { message: string }) => {
      if (message === "Unable to end call") {
        queryClient.invalidateQueries({ queryKey: ["calls"] });
      } else if (message !== "Failed to connect") {
        toast({ variant: "destructive", title: "Error", description: message });
      }
    };

    socketRef.current.on("error", handleError);
    socketRef.current.on("disconnect", handleSocketCleanup);
  }, [handleSocketCleanup, queryClient, setSocket, toast, user]);

  useEffect(() => {
    if (socketRef.current) return;
    initSocket();

    return () => {
      handleSocketCleanup();
    };
  }, [handleSocketCleanup, initSocket]);
}
