import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import Peer, { SignalData } from "simple-peer";
import { useSocketContext } from "@/providers/SocketProvider";
import { useShallow } from "zustand/react/shallow";
import { useUserStore } from "@/stores/useUserStore";
import { useToast } from "@/components/ui/use-toast";
import { User, Chat, Call } from "@/types";
import { audioConstraints, videoConstraints } from "@/lib/const";

interface CallContextType {
  startCall: (chat: Chat, videoEnabled?: boolean) => Promise<void>;
  answerCall: (callDetails: Call, videoEnabled?: boolean) => Promise<void>;
  endCall: (call: Call) => void;
  handleScreenShare: () => Promise<void>;
  handleVideoShare: () => Promise<void>;
  handleSwitchCameraOrientation: () => Promise<void>;
  handleSwitchDevice: (device: MediaDeviceInfo) => void;
  handleAdjustVolume: (volume: number) => void;
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
  const [cameraOrientation, setCameraOrientation] = useState(false);
  const {
    streams,
    connections,
    currentCall,
    isUserMicrophoneMuted,
    selectedDevices,
  } = useCallStore(
    useShallow((state) => ({
      streams: state.streams,
      connections: state.connections,
      currentCall: state.currentCall,
      isUserMicrophoneMuted: state.isUserMicrophoneMuted,
      selectedDevices: state.selectedDevices,
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
    setIsUserSharingVideo,
    setIsUserMicrophoneMuted,
    setJoiningCall,
    setSelectedDevices,
  } = useCallStoreActions();
  const userId = user?._id;
  const userStream = useMemo(
    () => streams[userId as User["_id"]]?.stream,
    [streams, userId]
  );
  const peerConnections = useMemo(() => connections, [connections]);

  const attachStreamToCall = useCallback(
    async ({
      videoEnabled = false,
      audioEnabled = false,
      videoInputId = selectedDevices?.videoInput?.deviceId,
      audioInputId = selectedDevices?.audioInput?.deviceId,
      orientation = cameraOrientation,
    }: {
      videoEnabled?: boolean;
      audioEnabled?: boolean;
      videoInputId?: MediaDeviceInfo["deviceId"];
      audioInputId?: MediaDeviceInfo["deviceId"];
      orientation?: boolean;
    } = {}): Promise<MediaStream | undefined> => {
      try {
        const includeVideoContraints = videoConstraints;
        const includeAudioConstraints = audioConstraints;
        if (videoEnabled && videoInputId) {
          includeVideoContraints.deviceId = { exact: videoInputId };
        }
        if (audioEnabled && audioInputId) {
          includeAudioConstraints.deviceId = { exact: audioInputId };
        }
        includeVideoContraints.facingMode = !orientation
          ? "user"
          : "environment";

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled ? includeVideoContraints : false,
          audio: audioEnabled ? includeAudioConstraints : false,
        });
        if (audioEnabled && isUserMicrophoneMuted)
          stream.getAudioTracks()[0].enabled = false;
        if (videoEnabled) setIsUserSharingVideo("video");

        return stream;
      } catch (error) {
        if (error instanceof DOMException && error.message.includes("video")) {
          toast({
            variant: "destructive",
            title: "Error accessing camera.",
            description: (error as { message: string }).message,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error accessing media devices.",
          });
        }
      }
    },
    [
      cameraOrientation,
      isUserMicrophoneMuted,
      selectedDevices?.audioInput?.deviceId,
      selectedDevices?.videoInput?.deviceId,
      setIsUserSharingVideo,
      toast,
    ]
  );

  const sendCallOffers = useCallback(
    (participant: Call["participants"][number], currentCall: Call) => {
      if (!userId || !participant || !currentCall || !userStream) return;

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

      peer.on("track", (_, stream) => {
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
      if (
        !userId ||
        !participant ||
        !currentCall ||
        !participant.offers ||
        !userStream
      )
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

      peer.on("track", (_, stream) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCall?.participants, userId]);

  // Send answers to all users in current call who you are not connected to
  useEffect(() => {
    if (!currentCall) return;

    const offersNotAnsweredTo = getOffersNotAnsweredTo();

    offersNotAnsweredTo?.forEach((participant) => {
      sendCallAnswers(participant, currentCall);
    });
  }, [currentCall, getOffersNotAnsweredTo, sendCallAnswers]);

  // Send requests to all users in current call who you are not connected to
  useEffect(() => {
    if (!currentCall || !userId) return;
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
  }, [peerConnections, currentCall, sendCallOffers, userId]);

  const startCall = useCallback(
    async (chat: Chat, videoEnabled?: boolean) => {
      if (!chat || !userId) return;

      const currUserStream = await attachStreamToCall({
        videoEnabled,
        audioEnabled: true,
      });
      if (!currUserStream) return;
      addStream(userId, currUserStream);

      socket?.emit("joinCall", {
        chatId: chat._id,
        isInitiator: true,
      });
      socket?.on("callJoined", (data: { call: Call }) => {
        if (data.call) {
          setCurrentCall(data.call);
          socket?.off("callJoined");
        }
      });
    },
    [addStream, attachStreamToCall, setCurrentCall, socket, userId]
  );

  const answerCall = useCallback(
    async (callDetails: Call, videoEnabled?: boolean) => {
      if (!callDetails || !userId) return;

      const currUserStream = await attachStreamToCall({
        videoEnabled,
        audioEnabled: true,
      });
      if (!currUserStream) return;
      addStream(userId, currUserStream);
      setJoiningCall(callDetails.chatId._id);

      socket?.emit("joinCall", {
        chatId: callDetails.chatId._id,
      });

      socket?.on("callJoined", (data: { call: Call }) => {
        if (data.call) {
          setCurrentCall(data.call);
          setJoiningCall(null);
          socket?.off("callJoined");
        }
      });
    },
    [
      userId,
      attachStreamToCall,
      addStream,
      setJoiningCall,
      socket,
      setCurrentCall,
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
      resetConnections();
      setCurrentCall(null);
      setIsUserSharingVideo(false);
      setIsUserMicrophoneMuted(false);
    },
    [
      socket,
      peerConnections,
      resetConnections,
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
      if (userStream?.getVideoTracks().length === 0) {
        // Start screen sharing
        const newStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: 60, max: 60 },
            height: { ideal: 1080, max: 2160 },
            width: { ideal: 1920, max: 3840 },
          },
          audio: false,
        });

        const oldStream = userStream;
        if (!newStream || !oldStream) return;

        oldStream.addTrack(newStream.getVideoTracks()[0]);

        // Add the new video track to the peer
        Object.values(peerConnections).forEach((peer) => {
          peer.addTrack(oldStream.getVideoTracks()[0], oldStream);
        });

        newStream.removeTrack(newStream.getVideoTracks()[0]);
        // Update local stream and state
        addStream(userId, oldStream);
        setIsUserSharingVideo("screen");
      } else {
        // Stop current video stream and create a new audio-only one
        const newStream = await attachStreamToCall({
          audioEnabled: true,
        });
        const oldStream = userStream;
        if (!newStream || !oldStream) return;

        // Remove existing streams
        Object.values(peerConnections).forEach((peer) => {
          peer.removeStream(oldStream);

          // Add new stream
          peer.addStream(newStream);
        });

        // Stop video tracks from the current stream
        oldStream?.getTracks().forEach((track) => {
          track.stop();
          oldStream.removeTrack(track);
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
    userId,
    userStream,
    peerConnections,
    addStream,
    setIsUserSharingVideo,
    attachStreamToCall,
    toast,
  ]);

  const handleVideoShare = useCallback(async () => {
    try {
      if (!userId) return;
      if (userStream?.getVideoTracks().length === 0) {
        // Start video sharing
        const newStream = await attachStreamToCall({
          videoEnabled: true,
        });
        const oldStream = userStream;
        if (!newStream || !oldStream) return;

        // Add the new video track to the peer
        Object.values(peerConnections).forEach((peer) => {
          peer.addTrack(newStream.getVideoTracks()[0], oldStream);
        });

        oldStream.addTrack(newStream.getVideoTracks()[0]);
        newStream.removeTrack(newStream.getVideoTracks()[0]);
        // Update local stream and state
        addStream(userId, oldStream);
        setIsUserSharingVideo("video");
      } else {
        // Stop current video stream and create a new audio-only one
        const newStream = await attachStreamToCall({
          audioEnabled: true,
        });
        const oldStream = userStream;
        if (!newStream || !oldStream) return;

        // Remove existing streams
        Object.values(peerConnections).forEach((peer) => {
          peer.removeStream(oldStream);

          // Add new stream
          peer.addStream(newStream);
        });

        // Stop video tracks from the current stream
        oldStream?.getTracks().forEach((track) => {
          track.stop();
          oldStream?.removeTrack(track);
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
    userId,
    userStream,
    attachStreamToCall,
    peerConnections,
    addStream,
    setIsUserSharingVideo,
    toast,
  ]);

  const handleSwitchCameraOrientation = useCallback(async () => {
    setCameraOrientation((prev) => !prev);

    const oldStream = userStream;
    // Stop existing video tracks before switching
    userStream?.getVideoTracks().forEach((track) => track.stop());

    const newStream = await attachStreamToCall({
      videoEnabled: true,
      orientation: !cameraOrientation,
    });

    if (!newStream || !oldStream || !userId) return;

    // Replace video track in the peer connection
    Object.values(peerConnections).forEach((peer) => {
      peer.replaceTrack(
        oldStream.getVideoTracks()[0],
        newStream.getVideoTracks()[0],
        oldStream
      );
    });

    // Add new track to the local stream
    userStream.getTracks().forEach((track) => oldStream.removeTrack(track));
    oldStream.getVideoTracks().forEach((track) => oldStream.removeTrack(track));
    oldStream.addTrack(newStream.getVideoTracks()[0]);

    addStream(userId, oldStream);
  }, [
    addStream,
    attachStreamToCall,
    cameraOrientation,
    peerConnections,
    userId,
    userStream,
  ]);

  const handleSwitchDevice = useCallback(
    async (device: MediaDeviceInfo) => {
      if (device.kind === "audioinput") {
        setSelectedDevices({
          audioInput: device,
        });
        const newStream = await attachStreamToCall({
          audioEnabled: true,
        });
        const peerStream = userStream;
        if (!newStream || !peerStream) return;
        Object.values(peerConnections).forEach((peer) => {
          const oldAudioTrack = peerStream.getAudioTracks()[0];
          if (oldAudioTrack) {
            peer.replaceTrack(
              oldAudioTrack,
              newStream.getAudioTracks()[0],
              peerStream
            );
          }
        });
        const currAudioTrack = userStream?.getAudioTracks()[0];
        if (currAudioTrack && userId) {
          userStream.removeTrack(currAudioTrack);
          userStream.addTrack(newStream.getAudioTracks()[0]);
          addStream(userId, userStream);
        }
      } else if (device.kind === "videoinput") {
        setSelectedDevices({
          videoInput: device,
        });
        if (userStream?.getVideoTracks().length === 0) {
          const newStream = await attachStreamToCall({
            videoEnabled: true,
          });
          const peerStream = userStream;
          if (!newStream || !peerStream) return;
          Object.values(peerConnections).forEach((peer) => {
            if (!peerStream) return;
            const oldVideoTrack = peerStream.getVideoTracks()[0];
            if (oldVideoTrack) {
              peer.replaceTrack(
                oldVideoTrack,
                newStream.getVideoTracks()[0],
                peerStream
              );
            }
          });
          const currVideoTrack = userStream?.getVideoTracks()[0];
          if (currVideoTrack && userId) {
            userStream.removeTrack(currVideoTrack);
            userStream.addTrack(newStream.getVideoTracks()[0]);
            addStream(userId, userStream);
          }
        }
      } else if (device.kind === "audiooutput") {
        setSelectedDevices({
          audioOutput: device,
        });

        const switchOutputDevice = async (deviceId: string) => {
          // Iterate over audio elements and attempt to set sink ID
          const audioElements = Object.values(audioTracksRef.current);

          for (const audioElement of audioElements) {
            if (audioElement instanceof HTMLAudioElement) {
              try {
                await audioElement.setSinkId(deviceId);
              } catch (error) {
                toast({
                  variant: "destructive",
                  title: "Error accessing audio device.",
                });
              }
            } else {
              toast({
                variant: "destructive",
                title: "Could not set audio device. Please try again.",
              });
            }
          }
        };
        switchOutputDevice(device.deviceId);
      }
    },
    [
      addStream,
      attachStreamToCall,
      peerConnections,
      setSelectedDevices,
      toast,
      userId,
      userStream,
    ]
  );

  const handleAdjustVolume = useCallback((volume: number) => {
    Object.values(audioTracksRef.current).forEach((audioElement) => {
      if (audioElement instanceof HTMLAudioElement) {
        audioElement.volume = volume;
      }
    });
  }, []);

  useEffect(() => {
    if (!currentCall) return;

    const currentParticipants = currentCall.participants.filter(
      (participant) => participant.userId._id !== userId
    );

    currentParticipants.forEach((participant) => {
      const userId = participant.userId._id;
      const stream = streams[userId]?.stream;

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
      handleScreenShare,
      handleVideoShare,
      handleSwitchCameraOrientation,
      handleSwitchDevice,
      handleAdjustVolume,
    }),
    [
      answerCall,
      endCall,
      handleScreenShare,
      startCall,
      handleVideoShare,
      handleSwitchCameraOrientation,
      handleSwitchDevice,
      handleAdjustVolume,
    ]
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
