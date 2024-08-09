import { createContext, useContext, useCallback } from "react";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import Peer from "simple-peer";
import { useSocketContext } from "@/providers/SocketProvider";
import { useShallow } from "zustand/react/shallow";
import { User } from "@/types/user";
import { Chat } from "@/types/chat";
import { useUserStore } from "@/stores/useUserStore";

interface CallContextType {
  startCall: (chatId: Chat["_id"], participants: User[]) => Promise<void>;
  answerCall: (
    chatId: Chat["_id"],
    callDetails: Chat["ongoingCall"]
  ) => Promise<void>;
  endCall: (chatId: Chat["_id"]) => void;
}

interface CallProviderProps {
  children: React.ReactNode;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCallContext must be used within a CallProvider");
  }
  return context;
};

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const { socket } = useSocketContext();
  const user = useUserStore((state) => state.user);
  const { streams, connections, currentCall } = useCallStore(
    useShallow((state) => ({
      streams: state.streams,
      connections: state.connections,
      currentCall: state.currentCall,
    }))
  );

  const {
    addConnection,
    removeConnection,
    setCurrentCall,
    addStream,
    removeStream,
  } = useCallStoreActions();

  const startCall = useCallback(
    async (chatId: Chat["_id"], participants: User[]) => {
      const currUserStream = streams[user?._id as User["_id"]];

      participants.forEach((participant) => {
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: currUserStream,
        });

        peer.on("signal", (data) => {
          socket?.emit("initiateCall", { chatId, offer: JSON.stringify(data) });
        });

        peer.on("stream", (stream) => {
          addStream(participant._id, stream);
        });

        peer.on("close", () => {
          removeStream(participant._id);
          removeConnection(participant._id);
        });

        peer.on("error", (err) => console.error(err));

        addConnection(participant._id, peer);
      });
    },
    [socket, streams, user?._id]
  );

  const answerCall = useCallback(
    async (chatId: Chat["_id"], callDetails: Chat["ongoingCall"]) => {
      if (!user?._id || !callDetails) return;

      const currUserStream = streams?.[user?._id];
      if (!currUserStream) return;

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: currUserStream,
      });

      peer.on("signal", (data) => {
        socket?.emit("sendCallAnswer", {
          chatId: chatId,
          answer: data,
        });
      });

      peer.on("stream", (stream) => {
        addStream(user?._id, stream);
      });

      peer.on("close", () => {
        removeStream(user?._id);
        removeConnection(user?._id);
      });

      peer.on("error", (err) => console.error(err));

      callDetails.participants.forEach((participant) => {
        peer.signal(JSON.parse(participant.signal));
      });
      setCurrentCall(callDetails);
      addConnection(user._id, peer);
    },
    [
      streams,
      addConnection,
      removeConnection,
      setCurrentCall,
      socket,
      user?._id,
      addStream,
      removeStream,
    ]
  );

  const endCall = useCallback(
    async (chatId: Chat["_id"]) => {
      Object.values(connections).forEach((peer) => peer.destroy());
      setCurrentCall(null);
      socket?.emit("endCall", { chatId });
    },
    [socket, connections, setCurrentCall]
  );

  return (
    <CallContext.Provider value={{ startCall, answerCall, endCall }}>
      {children}
    </CallContext.Provider>
  );
};
