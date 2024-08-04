import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUserStore } from "../stores/useUserStore";

interface SocketProviderProps {
  children: React.ReactNode;
}

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocketContext = () => useContext(SocketContext);

export function SocketProvider({ children }: SocketProviderProps) {
  const user = useUserStore((state) => state.user);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return;
    const socketInstance = io(import.meta.env.VITE_BACKEND_URL, {
      query: {
        _id: user?._id,
        displayName: user?.displayName,
      },
      extraHeaders: {
        Authorization: user?.access_token,
      },
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("connected");
    });

    socketInstance.on("disconnect", () => {
      console.log("disconnected");
    });

    socketInstance.on("error", ({ message }) => {
      console.log(message);
    });

    return () => {
      socketInstance.off("error");
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
