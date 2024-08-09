import { createContext, useContext, useCallback, useEffect } from "react";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import Peer from "simple-peer";
import { useSocketContext } from "@/providers/SocketProvider";
import { useShallow } from "zustand/react/shallow";
import { User } from "@/types/user";
import { Chat } from "@/types/chat";
import { useUserStore } from "@/stores/useUserStore";
import { useToast } from "@/components/UI/use-toast";

interface CallContextType {
  startCall: (chatId: Chat["_id"], participants: User[]) => Promise<void>;
  answerCall: (callDetails: Chat["ongoingCall"]) => Promise<void>;
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
  const { toast } = useToast();
  const user = useUserStore((state) => state.user);
  const { answeredCall, streams, connections, currentCall } = useCallStore(
    useShallow((state) => ({
      answeredCall: state.answeredCall,
      streams: state.streams,
      connections: state.connections,
      currentCall: state.currentCall,
    }))
  );
  const {
    addConnection,
    setCurrentCall,
    addStream,
    removeConnection,
    resetConnections,
    setAnsweredCall,
  } = useCallStoreActions();

  // Send requests to all users in current call who you are not connected to
  useEffect(() => {
    if (!currentCall || !user?._id || !answeredCall) return;
    const usersInCurrentCallWithouthAConnection =
      currentCall.participants.filter(
        (participant) =>
          participant.userId._id !== user?._id &&
          !connections[participant.userId._id] &&
          JSON.parse(participant.signal).type !== "offer"
      );

    usersInCurrentCallWithouthAConnection.forEach((participant) => {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: streams[user?._id],
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        },
      });

      peer.on("signal", (data) => {
        if (data.type === "offer") {
          socket?.emit("initiateCall", {
            chatId: currentCall.chatId,
            offer: JSON.stringify(data),
            saveToDb: true,
          });
          console.log("OFFER FOR:", participant.userId._id);
        } else {
          socket?.emit("initiateCall", {
            chatId: currentCall.chatId,
            offer: JSON.stringify(data),
          });
        }
      });

      peer.on("stream", (stream) => {
        addStream(participant.userId._id, stream);
      });

      peer.on("track", (track, stream) => {
        addStream(participant.userId._id, stream);
      });

      socket?.on("callAnswered", (data: { answer: string }) => {
        const parsedSignal = JSON.parse(data.answer);
        peer.signal(parsedSignal);
      });

      peer.on("close", () => {
        peer.destroy();
        socket?.off("callAnswered");
        removeConnection(participant.userId._id);
      });

      peer.on("error", (err) => {
        peer.destroy();
        socket?.off("callAnswered");
        removeConnection(participant.userId._id);
      });

      addConnection(participant.userId._id, peer);
    });
  }, [currentCall, connections, user?._id, answeredCall, streams, socket]);

  // Send answers to all users in current call who you are not connected to
  useEffect(() => {
    if (!currentCall || !user?._id || !answeredCall) return;
    const usersInCurrentCallWithoutAConnectionAndNotAnsweredYet =
      currentCall.participants.filter(
        (participant) =>
          participant.userId._id !== user?._id &&
          !connections[participant.userId._id] &&
          JSON.parse(participant.signal).type === "offer"
      );

    usersInCurrentCallWithoutAConnectionAndNotAnsweredYet.forEach(
      (participant) => {
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: streams[user?._id],
          offerOptions: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          },
        });

        peer.on("signal", (data) => {
          if (data.type === "answer") {
            socket?.emit("sendCallAnswer", {
              chatId: currentCall.chatId,
              answer: JSON.stringify(data),
              saveToDb: true,
            });
          } else {
            socket?.emit("sendCallAnswer", {
              chatId: currentCall.chatId,
              answer: JSON.stringify(data),
            });
          }
        });

        peer.on("stream", (stream) => {
          addStream(participant.userId._id, stream);
        });
        peer.on("track", (track, stream) => {
          addStream(participant.userId._id, stream);
        });

        socket?.on("callCreated", (data: { offer: string }) => {
          const parsedSignal = JSON.parse(data.offer);
          peer.signal(parsedSignal);
        });

        peer.on("close", () => {
          peer.destroy();
          socket?.off("callCreated");
          removeConnection(participant.userId._id);
        });

        peer.on("error", (err) => {
          peer.destroy();
          socket?.off("callCreated");
          removeConnection(participant.userId._id);
        });

        const participantSignal = JSON.parse(participant.signal);
        peer.signal(participantSignal);

        addConnection(participant.userId._id, peer);
      }
    );
  }, [currentCall, answeredCall, connections, user?._id]);

  const attachStreamToCall = useCallback(
    async (includeVideo: boolean = false): Promise<MediaStream | undefined> => {
      try {
        if (!user?._id) return;
        const includeVideoContraints = {
          width: { min: 640, ideal: 1920, max: 3840 },
          height: { min: 480, ideal: 1080, max: 2160 },
        };
        const stream = await navigator.mediaDevices.getUserMedia({
          video: includeVideo ? includeVideoContraints : false,
          audio: {
            autoGainControl: { exact: false, ideal: false },
            channelCount: { exact: 2, ideal: 2 },
            echoCancellation: { exact: false, ideal: false },
            noiseSuppression: { exact: false, ideal: false },
            sampleRate: { exact: 48000, ideal: 48000 },
            sampleSize: { exact: 16, ideal: 16 },
          },
        });
        addStream(user._id, stream);

        return stream;
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error accessing media devices.",
        });
      }
    },
    [addStream, user?._id, toast]
  );

  const startCall = useCallback(
    async (chatId: Chat["_id"], participants: User[]) => {
      if (!participants) return;
      const currUserStream = await attachStreamToCall();
      if (!currUserStream) return;

      const adaptedParticipants = participants.map((participant) => ({
        userId: { _id: participant._id } as User,
        signal: JSON.stringify({ type: "fakeSignal" }),
      }));
      setCurrentCall({ chatId, participants: adaptedParticipants });
      setAnsweredCall(true);
    },
    [setAnsweredCall, attachStreamToCall, setCurrentCall]
  );

  const answerCall = useCallback(
    async (callDetails: Chat["ongoingCall"]) => {
      if (!callDetails) return;
      const currUserStream = await attachStreamToCall();
      if (!currUserStream) return;

      setCurrentCall(callDetails);
      setAnsweredCall(true);
    },
    [setCurrentCall, attachStreamToCall, setAnsweredCall]
  );

  // TODO REMOVE STREAM TRACKS
  const endCall = useCallback(() => {
    if (currentCall?.chatId) {
      socket?.emit("endCall", { chatId: currentCall.chatId });
    }
    Object.values(connections).forEach((peer) => {
      peer.destroy();
    });
    setAnsweredCall(false);
    resetConnections();
    setCurrentCall(null);
  }, [
    socket,
    connections,
    currentCall?.chatId,
    resetConnections,
    setAnsweredCall,
    setCurrentCall,
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleBeforeUnload = () => endCall();

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, endCall]);

  return (
    <CallContext.Provider value={{ startCall, answerCall, endCall }}>
      {children}
    </CallContext.Provider>
  );
};
