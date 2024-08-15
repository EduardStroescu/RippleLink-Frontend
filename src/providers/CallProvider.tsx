import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import Peer, { SignalData } from "simple-peer";
import { useSocketContext } from "@/providers/SocketProvider";
import { useShallow } from "zustand/react/shallow";
import { User } from "@/types/user";
import { Chat } from "@/types/chat";
import { useUserStore } from "@/stores/useUserStore";
import { useToast } from "@/components/ui/use-toast";
import { Call } from "@/types/call";

interface CallContextType {
  startCall: (chat: Chat, videoEnabled?: boolean) => Promise<void>;
  answerCall: (callDetails: Call, videoEnabled?: boolean) => Promise<void>;
  endCall: (call: Call) => void;
  attachStreamToCall: (
    includeVideo?: boolean
  ) => Promise<MediaStream | undefined>;
  handleScreenShare: () => Promise<void>;
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

//
// Never touch what is below!!!
//

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const { socket } = useSocketContext();
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
    addRecentlyEndedCall,
    addStream,
    removeConnection,
    resetConnections,
    setAnsweredCall,
    setIsUserSharingVideo,
    setIsUserMicrophoneMuted,
  } = useCallStoreActions();

  const attachStreamToCall = useCallback(
    async (includeVideo: boolean = false): Promise<MediaStream | undefined> => {
      try {
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
        if (includeVideo) setIsUserSharingVideo("video");

        return stream;
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error accessing media devices.",
        });
      }
    },
    [toast, setIsUserSharingVideo]
  );

  const sendCallOffers = useCallback(
    (participant: Call["participants"][number], currentCall: Call) => {
      if (!user?._id || !participant || !currentCall) return;

      const peer = new Peer({
        initiator: true,
        trickle: true,
        stream: streams[user?._id],
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        },
      });

      peer.on("signal", (data) => {
        if (data.type === "offer") {
          socket?.emit("initiateCall", {
            chatId: currentCall.chatId._id,
            offer: JSON.stringify(data),
            participantId: participant.userId._id,
            saveToDb: true,
          });
        } else {
          if (data.type === "candidate") {
            socket?.emit("saveIceCandidates", {
              iceCandidates: JSON.stringify(data),
              chatId: currentCall.chatId._id,
              candidatesType: "offer",
              to: participant.userId._id,
            });
          }
          socket?.emit("initiateCall", {
            chatId: currentCall.chatId._id,
            offer: JSON.stringify(data),
            participantId: participant.userId._id,
          });
        }
      });

      peer.on("stream", (stream) => {
        addStream(participant.userId._id, stream);
      });

      socket?.on(
        "callAnswered",
        (data: { answer: string; participantId: string }) => {
          if (participant.userId._id === data.participantId) {
            const parsedSignal = JSON.parse(data.answer);
            peer.signal(parsedSignal);
          }
        }
      );

      peer.on("close", () => {
        removeConnection(participant.userId._id);
        socket?.off("callAnswered");
        peer.destroy();
      });

      peer.on("error", (err) => {
        removeConnection(participant.userId._id);
        socket?.off("callAnswered");
        peer.destroy();
      });

      addConnection(participant.userId._id, peer);
    },
    [addConnection, addStream, removeConnection, socket, streams, user?._id]
  );

  const sendCallAnswers = useCallback(
    (participant: Call["participants"][number], currentCall: Call) => {
      if (!user?._id || !participant || !currentCall || !participant.offers)
        return;

      const peer = new Peer({
        initiator: false,
        trickle: true,
        stream: streams[user?._id],
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        },
      });

      peer.on("signal", (data) => {
        if (data.type === "answer") {
          socket?.emit("sendCallAnswer", {
            chatId: currentCall.chatId._id,
            answer: JSON.stringify(data),
            participantId: participant.userId._id,
            saveToDb: true,
          });
        } else {
          if (data.type === "candidate") {
            socket?.emit("saveIceCandidates", {
              iceCandidates: JSON.stringify(data),
              chatId: currentCall.chatId._id,
              candidatesType: "answer",
              to: participant.userId._id,
            });
          }
          socket?.emit("sendCallAnswer", {
            chatId: currentCall.chatId._id,
            answer: JSON.stringify(data),
            participantId: participant.userId._id,
          });
        }
      });

      peer.on("stream", (stream) => {
        addStream(participant.userId._id, stream);
      });

      socket?.on(
        "callCreated",
        (data: { offer: string; participantId: string }) => {
          if (participant.userId._id === data.participantId) {
            const parsedSignal = JSON.parse(data.offer);
            peer.signal(parsedSignal);
          }
        }
      );

      peer.on("close", () => {
        removeConnection(participant.userId._id);
        socket?.off("callCreated");
        peer.destroy();
      });

      peer.on("error", (err) => {
        removeConnection(participant.userId._id);
        socket?.off("callCreated");
        peer.destroy();
      });

      const participantOffer = participant.offers.find(
        (offer) => offer.to === user?._id
      );
      if (participantOffer?.sdp) {
        const parsedSignal: SignalData = JSON.parse(participantOffer.sdp);
        peer.signal(parsedSignal);
      }
      if (participantOffer?.iceCandidates) {
        participantOffer.iceCandidates.forEach((iceCandidate) => {
          const parsedCandidate: SignalData = JSON.parse(iceCandidate);
          peer.signal(parsedCandidate);
        });
      }

      addConnection(participant.userId._id, peer);
    },
    [addConnection, addStream, removeConnection, socket, streams, user?._id]
  );

  // Send answers to all users in current call who you are not connected to
  useEffect(() => {
    if (!currentCall || !user?._id || !answeredCall) return;

    const usersInCurrentCallWithoutAConnectionAndNotAnsweredTo =
      currentCall.participants.filter(
        (participant) =>
          participant.userId._id !== user?._id &&
          !connections[participant.userId._id] &&
          participant?.offers?.some((offer) => offer.to === user?._id)
      );

    usersInCurrentCallWithoutAConnectionAndNotAnsweredTo.forEach(
      (participant) => {
        sendCallAnswers(participant, currentCall);
      }
    );
  }, [answeredCall, connections, currentCall, sendCallAnswers, user?._id]);

  // Send requests to all users in current call who you are not connected to
  useEffect(() => {
    if (!currentCall || !user?._id || !answeredCall) return;

    // Extract user IDs from the current call participants
    const currentCallParticipantIds = currentCall.participants.map(
      (participant) => participant.userId._id
    );

    // Filter users in the chat who are not the current user, have no connection, and are not in the current call participants
    const usersInCurrentCallWithoutAConnection = currentCall.chatId.users
      .filter(
        (participant) =>
          participant._id !== user?._id && // Exclude current user
          !connections[participant._id] && // Exclude users with existing connections
          !currentCallParticipantIds.includes(participant._id) // Include only those who are in the current call
      )
      .map((user) => ({
        userId: user, // Map to an object with the user ID
      }));

    usersInCurrentCallWithoutAConnection.forEach((participant) => {
      sendCallOffers(participant, currentCall);
    });
  }, [answeredCall, connections, currentCall, sendCallOffers, user?._id]);

  const startCall = useCallback(
    async (chat: Chat, videoEnabled?: boolean) => {
      if (!chat || !user?._id) return;

      const currUserStream = await attachStreamToCall(videoEnabled);
      if (!currUserStream) return;
      addStream(user?._id, currUserStream);

      socket?.emit("joinCall", {
        chatId: chat._id,
      });
      socket?.on("callJoined", (data: { call: Call }) => {
        if (data.call) {
          setCurrentCall(data.call);
          setAnsweredCall(true);
          socket?.off("callJoined");
        }
      });
    },
    [
      addStream,
      attachStreamToCall,
      setAnsweredCall,
      setCurrentCall,
      socket,
      user?._id,
    ]
  );

  const answerCall = useCallback(
    async (callDetails: Call, videoEnabled?: boolean) => {
      if (!callDetails || !user?._id) return;

      const currUserStream = await attachStreamToCall(videoEnabled);
      if (!currUserStream) return;
      addStream(user._id, currUserStream);

      socket?.emit("joinCall", {
        chatId: callDetails.chatId._id,
      });

      socket?.on("callJoined", (data: { call: Call }) => {
        if (data.call) {
          setCurrentCall(callDetails);
          setAnsweredCall(true);
          socket?.off("callJoined");
        }
      });
    },
    [
      addStream,
      attachStreamToCall,
      setAnsweredCall,
      setCurrentCall,
      user?._id,
      socket,
    ]
  );

  const endCall = useCallback(
    (call: Call) => {
      if (
        call.participants.some(
          (participant) => participant.userId._id === user?._id
        )
      ) {
        addRecentlyEndedCall(call);
        socket?.emit("endCall", { callId: call._id });
      }
      streams[user?._id as User["_id"]]
        ?.getTracks()
        .forEach((track) => track.stop());
      Object.values(connections).forEach((peer) => {
        peer.destroy();
      });
      setAnsweredCall(false);
      resetConnections();
      setCurrentCall(null);
      setIsUserSharingVideo(false);
      setIsUserMicrophoneMuted(false);
    },
    [
      socket,
      connections,
      resetConnections,
      setAnsweredCall,
      setCurrentCall,
      setIsUserSharingVideo,
      setIsUserMicrophoneMuted,
      user?._id,
      streams,
      addRecentlyEndedCall,
    ]
  );

  const handleScreenShare = useCallback(async () => {
    try {
      if (!user?._id) return;

      const userStream = streams[user._id];

      if (userStream.getVideoTracks().length === 0) {
        // Start screen sharing
        const newStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: 60, max: 60 },
            height: { ideal: 1080, max: 2160 },
            width: { ideal: 1920, max: 3840 },
          },
          audio: false,
        });
        const newAudioStream = await attachStreamToCall();
        if (!newStream) return;
        userStream.getTracks().forEach((track) => {
          track.stop();
          userStream.removeTrack(track);
        });

        if (newAudioStream) {
          newStream.addTrack(newAudioStream.getAudioTracks()[0]);
        }

        // Remove existing streams and tracks
        Object.values(connections).forEach((peer) => {
          const oldStream = peer.streams[0];
          if (oldStream) {
            // Remove old video tracks from the peer
            oldStream.getTracks().forEach((track) => {
              peer.removeTrack(track, oldStream);
              track.stop();
            });
            peer.removeStream(oldStream);
          }
        });

        // Add the new screen share stream to all peer connections
        Object.values(connections).forEach((peer) => {
          peer.addStream(newStream);
        });

        // Update local stream and state
        addStream(user._id, newStream);
        setIsUserSharingVideo("screen");
      } else {
        // Stop current video stream and create a new one
        const newStream = await attachStreamToCall();
        if (!newStream) return;

        // Remove existing streams and tracks
        Object.values(connections).forEach((peer) => {
          const oldStream = peer.streams[0];
          if (oldStream) {
            // Remove old video tracks from the peer
            oldStream.getTracks().forEach((track) => {
              peer.removeTrack(track, oldStream);
            });
            peer.removeStream(oldStream);
          }
          // Add new stream
          peer.addStream(newStream);
        });

        // Stop video tracks from the current stream
        userStream.getTracks().forEach((track) => {
          track.stop();
          userStream.removeTrack(track);
        });

        // Update local stream and state
        addStream(user._id, newStream);
        setIsUserSharingVideo(false);
      }
    } catch (error) {
      toast({ variant: "destructive", title: error.message });
    }
  }, [
    addStream,
    attachStreamToCall,
    connections,
    streams,
    toast,
    user?._id,
    setIsUserSharingVideo,
  ]);

  useEffect(() => {
    if (!socket || !currentCall) return;

    const handleBeforeUnload = () => endCall(currentCall);

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // socket?.off("callCreated");
      // socket?.off("callAnswered");
    };
  }, [socket, endCall, currentCall]);

  const value = useMemo(
    () => ({
      startCall,
      answerCall,
      endCall,
      attachStreamToCall,
      handleScreenShare,
    }),
    [answerCall, attachStreamToCall, endCall, handleScreenShare, startCall]
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
