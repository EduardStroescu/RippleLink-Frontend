import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUserStore } from "../stores/useUserStore";
import { useToast } from "@/components/ui/use-toast";

interface SocketProviderProps {
  children: React.ReactNode;
}

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

// eslint-disable-next-line react-refresh/only-export-components
export const useSocketContext = () => useContext(SocketContext);

export function SocketProvider({ children }: SocketProviderProps) {
  const user = useUserStore((state) => state.user);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || socket !== null) return;
    const socketInstance = io(import.meta.env.VITE_BACKEND_URL, {
      query: {
        _id: user?._id,
        displayName: user?.displayName,
      },
      extraHeaders: {
        Authorization: user?.access_token as string,
      },
    });

    setSocket(socketInstance);

    socketInstance.on("disconnect", () => {
      socketInstance.off("connect");
      socketInstance.off("disconnect");
      socketInstance.off("error");
      setSocket(null);
    });

    socketInstance.on("error", ({ message }) => {
      if (message !== "Failed to connect user") {
        toast({ variant: "destructive", title: "Error", description: message });
        setSocket(null);
      }
    });
  }, [user, socket, toast]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
