import { useEffect } from "react";
import { io } from "socket.io-client";
import { useToast } from "@/components/ui/use-toast";
import { useAppStore, useAppStoreActions } from "@/stores/useAppStore";
import { useUserStore } from "@/stores/useUserStore";
import { useQueryClient } from "@tanstack/react-query";

export function useSocketConnection() {
  const user = useUserStore((state) => state.user);
  const socket = useAppStore((state) => state.socket);
  const { setSocket } = useAppStoreActions();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !user.access_token || socket !== null) return;
    const socketInstance = io(import.meta.env.VITE_BACKEND_URL, {
      query: {
        _id: user?._id,
        displayName: user.displayName,
      },
      extraHeaders: {
        Authorization: user.access_token,
      },
    });

    setSocket(socketInstance);

    socketInstance.on("disconnect", () => {
      socketInstance.off("connect");
      socketInstance.off("disconnect");
      socketInstance.off("error");
      setSocket(null);
    });
  }, [user, socket, setSocket]);

  useEffect(() => {
    if (!socket) return;

    const handleError = ({ message }) => {
      if (message === "Failed to end call") {
        queryClient.invalidateQueries({ queryKey: ["calls"] });
      } else if (message !== "Failed to connect user") {
        toast({ variant: "destructive", title: "Error", description: message });
      }
    };

    socket.on("error", handleError);

    return () => {
      socket.off("error", handleError);
    };
  }, [queryClient, socket, toast]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);
}
