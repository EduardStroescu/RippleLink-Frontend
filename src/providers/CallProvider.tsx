import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  handleVideoShare: () => Promise<void>;
}

interface CallProviderProps {
  children: React.ReactNode;
}

const CallContext = createContext<CallContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCallContext must be used within a CallProvider");
  }
  return context;
};

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const { socket } = useSocketContext();
  const user = useUserStore((state) => state.user);
  const audioTracksRef = useRef({});
  const {
    answeredCall,
    streams,
    connections,
    currentCall,
    isUserMicrophoneMuted,
  } = useCallStore(
    useShallow((state) => ({
      answeredCall: state.answeredCall,
      streams: state.streams,
      connections: state.connections,
      currentCall: state.currentCall,
      isUserMicrophoneMuted: state.isUserMicrophoneMuted,
    }))
  );
  const {
    addConnection,
    setCurrentCall,
    addRecentlyEndedCall,
    addStream,
    removeStream,
    removeConnection,
    resetConnections,
    setAnsweredCall,
    setIsUserSharingVideo,
    setIsUserMicrophoneMuted,
    setJoiningCall,
  } = useCallStoreActions();
  const userId = useMemo(() => user?._id, [user?._id]);
  const userStream = useMemo(
    () => streams[userId as User["_id"]],
    [streams, userId]
  );
  const peerConnections = useMemo(() => connections, [connections]);

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
            autoGainControl: false,
            channelCount: 2,
            echoCancellation: false,
            noiseSuppression: false,
            sampleRate: 48000,
            sampleSize: 16,
          },
        });
        if (isUserMicrophoneMuted) stream.getAudioTracks()[0].enabled = false;
        if (includeVideo) setIsUserSharingVideo("video");

        return stream;
      } catch (error) {
        if (error instanceof DOMException && error.message.includes("video")) {
          toast({
            variant: "destructive",
            title: "Error accessing camera.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error accessing media devices.",
          });
        }
      }
    },
    [toast, setIsUserSharingVideo, isUserMicrophoneMuted]
  );

  const sendCallOffers = useCallback(
    (participant: Call["participants"][number], currentCall: Call) => {
      if (!userId || !participant || !currentCall) return;

      const peer = new Peer({
        initiator: true,
        trickle: true,
        stream: userStream,
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
        removeStream(participant.userId._id);
        removeConnection(participant.userId._id);
        socket?.off("callAnswered");
        peer.destroy();
      });

      peer.on("error", () => {
        removeStream(participant.userId._id);
        removeConnection(participant.userId._id);
        socket?.off("callAnswered");
        peer.destroy();
      });

      addConnection(participant.userId._id, peer);
    },
    [
      addConnection,
      addStream,
      removeConnection,
      socket,
      userStream,
      userId,
      removeStream,
    ]
  );

  const sendCallAnswers = useCallback(
    (participant: Call["participants"][number], currentCall: Call) => {
      if (!userId || !participant || !currentCall || !participant.offers)
        return;

      const peer = new Peer({
        initiator: false,
        trickle: true,
        stream: userStream,
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        },
      });

      peer.on("signal", (data) => {
        if (!participant.userId._id || !currentCall) return;
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
        removeStream(participant.userId._id);
        removeConnection(participant.userId._id);
        socket?.off("callCreated");
        peer.destroy();
      });

      peer.on("error", () => {
        removeStream(participant.userId._id);
        removeConnection(participant.userId._id);
        socket?.off("callCreated");
        peer.destroy();
      });

      const participantOffer = participant.offers.find(
        (offer) => offer.to === userId
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
    [
      addConnection,
      addStream,
      removeConnection,
      socket,
      userStream,
      userId,
      removeStream,
    ]
  );

  const getOffersNotAnsweredTo = useCallback(() => {
    return currentCall?.participants.filter(
      (participant) =>
        participant.userId._id !== userId &&
        !peerConnections[participant.userId._id] &&
        participant?.offers?.some((offer) => offer.to === userId)
    );
  }, [currentCall?.participants, userId]);

  // Send answers to all users in current call who you are not connected to
  useEffect(() => {
    if (!currentCall || !answeredCall) return;

    const offersNotAnsweredTo = getOffersNotAnsweredTo();

    offersNotAnsweredTo?.forEach((participant) => {
      sendCallAnswers(participant, currentCall);
    });
  }, [answeredCall, currentCall, getOffersNotAnsweredTo, sendCallAnswers]);

  // Send requests to all users in current call who you are not connected to
  useEffect(() => {
    if (!currentCall || !userId || !answeredCall) return;
    // Extract user IDs from the current call participants
    const currentCallParticipantIds = currentCall.participants.map(
      (participant) => participant.userId._id
    );

    // Filter users in the chat who are not the current user, have no connection, and are not in the current call participants
    const usersInCurrentCallWithoutAConnection = currentCall.chatId.users
      .filter(
        (participant) =>
          participant._id !== userId && // Exclude current user
          !peerConnections[participant._id] && // Exclude users with existing connections
          !currentCallParticipantIds.includes(participant._id) // Include only those who are not in the current call
      )
      .map((user) => ({
        userId: user, // Map to an object with the user ID
      }));

    usersInCurrentCallWithoutAConnection.forEach((participant) => {
      sendCallOffers(participant, currentCall);
    });
  }, [answeredCall, peerConnections, currentCall, sendCallOffers, userId]);

  const startCall = useCallback(
    async (chat: Chat, videoEnabled?: boolean) => {
      if (!chat || !userId) return;

      const currUserStream = await attachStreamToCall(videoEnabled);
      if (!currUserStream) return;
      addStream(userId, currUserStream);

      socket?.emit("joinCall", {
        chatId: chat._id,
        isInitiator: true,
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
      userId,
    ]
  );

  const answerCall = useCallback(
    async (callDetails: Call, videoEnabled?: boolean) => {
      if (!callDetails || !userId) return;

      const currUserStream = await attachStreamToCall(videoEnabled);
      if (!currUserStream) return;
      addStream(userId, currUserStream);
      setJoiningCall(callDetails.chatId._id);

      socket?.emit("joinCall", {
        chatId: callDetails.chatId._id,
      });

      socket?.on("callJoined", (data: { call: Call }) => {
        if (data.call) {
          setCurrentCall(data.call);
          setAnsweredCall(true);
          setJoiningCall(null);
          socket?.off("callJoined");
        }
      });
    },
    [
      userId,
      attachStreamToCall,
      addStream,
      socket,
      setJoiningCall,
      setCurrentCall,
      setAnsweredCall,
    ]
  );

  const endCall = useCallback(
    (call: Call) => {
      if (
        call.participants.some(
          (participant) => participant.userId._id === userId
        )
      ) {
        socket?.emit("endCall", { callId: call._id });
        addRecentlyEndedCall(call);
      }
      userStream?.getTracks().forEach((track) => track.stop());
      Object.values(peerConnections).forEach((peer) => {
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
      peerConnections,
      resetConnections,
      setAnsweredCall,
      setCurrentCall,
      setIsUserSharingVideo,
      setIsUserMicrophoneMuted,
      userId,
      userStream,
      addRecentlyEndedCall,
    ]
  );

  const handleScreenShare = useCallback(async () => {
    try {
      if (!userId) return;
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
        Object.values(peerConnections).forEach((peer) => {
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
        Object.values(peerConnections).forEach((peer) => {
          peer.addStream(newStream);
        });

        // Update local stream and state
        addStream(userId, newStream);
        setIsUserSharingVideo("screen");
      } else {
        // Stop current video stream and create a new one
        const newStream = await attachStreamToCall();
        if (!newStream) return;

        // Remove existing streams and tracks
        Object.values(peerConnections).forEach((peer) => {
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
        addStream(userId, newStream);
        setIsUserSharingVideo(false);
      }
    } catch (error) {
      if (error instanceof DOMException) {
        toast({ variant: "destructive", title: error.message });
      }
    }
  }, [
    addStream,
    attachStreamToCall,
    peerConnections,
    userStream,
    toast,
    userId,
    setIsUserSharingVideo,
  ]);

  const handleVideoShare = useCallback(async () => {
    try {
      if (!userId) return;

      if (userStream.getVideoTracks().length === 0) {
        // Start video sharing
        const newStream = await attachStreamToCall(true);
        if (!newStream) return;
        userStream.getTracks().forEach((track) => {
          track.stop();
          userStream.removeTrack(track);
        });

        // Remove existing streams and tracks
        Object.values(peerConnections).forEach((peer) => {
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
        Object.values(peerConnections).forEach((peer) => {
          peer.addStream(newStream);
        });

        // Update local stream and state
        addStream(userId, newStream);
        setIsUserSharingVideo("video");
      } else {
        // Stop current video stream and create a new one
        const newStream = await attachStreamToCall();
        if (!newStream) return;

        // Remove existing streams and tracks
        Object.values(peerConnections).forEach((peer) => {
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
        addStream(userId, newStream);
        setIsUserSharingVideo(false);
      }
    } catch (error) {
      if (error instanceof DOMException) {
        toast({ variant: "destructive", title: error.message });
      }
    }
  }, [
    addStream,
    attachStreamToCall,
    peerConnections,
    setIsUserSharingVideo,
    userStream,
    toast,
    userId,
  ]);

  useEffect(() => {
    if (!currentCall) return;

    const currentParticipants = currentCall.participants.filter(
      (participant) => participant.userId._id !== userId
    );

    currentParticipants.forEach((participant) => {
      const userId = participant.userId._id;
      const stream = streams[userId];

      if (stream) {
        const audioTrack = stream.getAudioTracks()?.[0];
        if (
          !audioTrack ||
          audioTracksRef.current[userId]?.srcObject?.getAudioTracks()?.[0] ===
            audioTrack
        )
          return;

        const audioElement = new Audio();
        const audioOnlyStream = new MediaStream([audioTrack]);

        audioElement.srcObject = audioOnlyStream;
        audioElement.autoplay = true;
        audioElement.volume = 1;

        audioTracksRef.current[userId] = audioElement;
        audioElement.play().catch((error) => {
          console.error("Error playing the audio stream:", error);
        });
      } else if (!stream && audioTracksRef.current[userId]) {
        const audioElement = audioTracksRef.current[userId];
        if (audioElement) {
          audioElement.pause();
          audioElement.srcObject = null;
          delete audioTracksRef.current[userId];
        }
      }
    });
  }, [currentCall, streams, userId]);

  useEffect(() => {
    // Cleanup each audio elements
    const cleanupAudioTracks = () => {
      Object.keys(audioTracksRef.current).forEach((userId) => {
        const audioElement = audioTracksRef.current[userId];
        if (audioElement) {
          audioElement.pause();
          audioElement.srcObject = null;
          delete audioTracksRef.current[userId];
        }
      });
    };

    return cleanupAudioTracks;
  }, []);

  useEffect(() => {
    if (!socket || !currentCall) return;

    const handleBeforeUnload = () => endCall(currentCall);

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, endCall, currentCall]);

  const value = useMemo(
    () => ({
      startCall,
      answerCall,
      endCall,
      attachStreamToCall,
      handleScreenShare,
      handleVideoShare,
    }),
    [
      answerCall,
      attachStreamToCall,
      endCall,
      handleScreenShare,
      startCall,
      handleVideoShare,
    ]
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
