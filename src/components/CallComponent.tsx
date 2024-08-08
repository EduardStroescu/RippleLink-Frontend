import { useSocketContext } from "@/providers/SocketProvider";
import { useRef, useEffect, useState } from "react";
import Peer from "simple-peer";
import { User } from "@/types/user";
import { AvatarCoin } from "./UI/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";
import { CallIcon, CloseIcon } from "./Icons";
import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";
import { useAppStore, useAppStoreActions } from "@/stores/useAppStore";
import MediaPreviewDialog from "./MediaPreviewDialog";

interface VideoCallProps {
  chatId: string;
  chatParticipants: User[];
  currentChat: Chat;
}

export const CallComponent = ({
  chatId,
  chatParticipants,
  currentChat,
}: VideoCallProps) => {
  const { socket } = useSocketContext();
  const user = useUserStore((state) => state.user);
  const answeredCall = useAppStore((state) => state.answeredCall);
  const { setAnsweredCall } = useAppStoreActions();
  const currentCallDetails = currentChat.ongoingCall;

  const [stream, setStream] = useState<MediaStream | undefined>();

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const connectionRef = useRef<InstanceType<typeof Peer> | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<HTMLVideoElement | null>(
    null
  );

  // Start local stream
  useEffect(() => {
    const startLocalStream = async () => {
      if (!user?._id) return;
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: {
            autoGainControl: false,
            channelCount: 2,
            echoCancellation: false,
            noiseSuppression: false,
            sampleRate: 48000,
            sampleSize: 16,
          },
        });

        setStream(stream);
        if (videoRefs.current) {
          videoRefs.current[user?._id].srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };

    startLocalStream();
  }, [user?._id]);

  // Initiate call if none is ongoing
  useEffect(() => {
    const otherCallParticipants =
      currentChat?.ongoingCall?.callParticipants.filter(
        (participant) => participant?._id !== user?._id
      );
    if (!otherCallParticipants?.length) return;

    chatParticipants.forEach((participant) => {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
      });

      peer.on("signal", (data) => {
        socket?.emit("initiateCall", { chatId, offer: data });
      });
      peer.on("stream", (stream) => {
        if (videoRefs.current) {
          videoRefs.current[participant?._id].srcObject = stream;
        }
      });
      socket?.on("incomingCallAnswer", (data) => {
        peer.signal(data.answer);
      });
      connectionRef.current = peer;
    });

    return () => {
      socket?.off("incomingCallAnswer");
    };
  }, [
    socket,
    chatId,
    stream,
    chatParticipants,
    user?._id,
    currentChat?.ongoingCall?.callParticipants,
  ]);

  // Join call if already ongoing
  const answerCall = () => {
    if (!user?._id || !currentCallDetails) return;
    setAnsweredCall(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket?.emit("sendCallAnswer", { chatId, answer: data });
    });
    peer.on("stream", (stream) => {
      if (videoRefs.current) {
        videoRefs.current[user?._id].srcObject = stream;
      }
    });
    peer.signal(currentCallDetails.callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setAnsweredCall(false);
    connectionRef?.current?.destroy();
  };

  const handleVideoClick = (participantId: string) => {
    const selectedVideoElement = videoRefs.current[participantId];
    if (selectedVideoElement) {
      setSelectedVideo(selectedVideoElement);
    }
  };

  const fullScreenVideoRefCallback = (videoElement) => {
    if (videoElement && selectedVideo) {
      videoElement.srcObject = selectedVideo.srcObject;
      videoElement.play();
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 bg-gray-950/70 0 py-6 border-b-[1px] border-cyan-600">
      <div className="grid grid-flow-col p-4 gap-2]">
        {currentCallDetails?.callParticipants?.length &&
          currentCallDetails?.callParticipants.map((participant) => {
            return (
              <div
                key={participant?._id}
                className="bg-blue-950 hover:bg-blue-900 border-slate-600 border-[1px] flex rounded flex-col items-center justify-center gap-2 py-10 px-4"
              >
                <AvatarCoin
                  //TODO: REVERSE THIS
                  className={`${participant?.isSharingVideo ? "block" : "hidden"}`}
                  source={participant?.avatarUrl || placeholderAvatar}
                  width={200}
                  alt={`${participant?.displayName}'s Avatar`}
                />
                <MediaPreviewDialog
                  content={
                    <video
                      ref={fullScreenVideoRefCallback}
                      muted={participant?._id === user?._id}
                      //TODO: REVERSE THIS
                      className={`${!participant?.isSharingVideo ? "block" : "hidden"} w-full h-full object-cover rounded-md`}
                    />
                  }
                >
                  <video
                    autoPlay
                    onClick={() => handleVideoClick(participant._id)}
                    muted={participant?._id === user?._id}
                    //TODO: REVERSE THIS
                    className={`${!participant?.isSharingVideo ? "block" : "hidden"} max-w-[500px] aspect-video object-fit rounded-md`}
                    ref={(el) => {
                      if (el) {
                        videoRefs.current[participant?._id] = el;
                      }
                    }}
                  />
                </MediaPreviewDialog>
                <p>{participant?.displayName || "User"}</p>
              </div>
            );
          })}
      </div>

      <div className="flex justify-center items-center gap-2">
        {!answeredCall && (
          <button
            onClick={answerCall}
            className="group p-2 max-w-1/2 h-fit bg-green-950 rounded-full hover:bg-green-900"
          >
            <CallIcon />
          </button>
        )}
        <button
          onClick={leaveCall}
          className="group p-2 max-w-fit h-fit bg-red-950 rounded-full hover:bg-red-900"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};
