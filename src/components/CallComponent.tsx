import { forwardRef, useRef } from "react";
import { AvatarCoin } from "./UI/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";
import {
  CallIcon,
  MuteMicIcon,
  RejectCallIcon,
  ScreenShareIcon,
  StopVideoIcon,
} from "./Icons";
import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";
import MediaPreviewDialog from "./MediaPreviewDialog";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import { useCallContext } from "@/providers/CallProvider";
import { useShallow } from "zustand/react/shallow";

interface VideoCallProps {
  chatId: string;
  currentChat: Chat | undefined;
}

export const CallComponent = ({ chatId, currentChat }: VideoCallProps) => {
  const user = useUserStore((state) => state.user);
  const currentCallDetails = currentChat?.ongoingCall;
  const { streams, connections } = useCallStore(
    useShallow((state) => ({
      streams: state.streams,
      connections: state.connections,
    }))
  );
  const { addStream } = useCallStoreActions();
  const { answerCall, endCall } = useCallContext();

  const handleAnswerCall = () => {
    if (currentCallDetails) {
      answerCall(currentCallDetails);
    }
  };

  const handleEndCall = () => {
    endCall(chatId);
  };
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);

  const handleVideoClick = (stream: MediaStream | null) => {
    setTimeout(() => {
      if (fullscreenVideoRef.current) {
        fullscreenVideoRef.current.srcObject = stream;
        fullscreenVideoRef.current.play();
      }
    }, 0);
  };

  const isUserInOngoingCall = currentCallDetails?.participants?.some(
    (participant) => participant.userId._id === user?._id
  );

  const handleVideoOff = () => {
    if (!user?._id) return;
    const videoTrack = streams[user?._id]
      ?.getTracks()
      .find((track) => track.kind === "video");

    if (!videoTrack) return;
    if (videoTrack.enabled) {
      videoTrack.enabled = false;
    } else {
      videoTrack.enabled = true;
    }
  };

  const handleAudioOff = () => {
    if (!user?._id) return;
    const audioTrack = streams[user?._id]
      ?.getTracks()
      .find((track) => track.kind === "audio");
    console.log(audioTrack);

    if (!audioTrack) return;
    if (audioTrack.enabled) {
      audioTrack.enabled = false;
    } else {
      audioTrack.enabled = true;
    }
  };

  const handleScreenShare = async () => {
    try {
      if (!user?._id) return;
      const newStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      if (!newStream) return;

      // Iterate over all peer connections
      Object.values(connections).forEach((peer) => {
        // Get the current video track from the existing stream
        const oldStream = peer.streams[0];
        if (!oldStream) return;
        // console.log(newStream.getVideoTracks()[0]);
        peer.addTrack(newStream.getVideoTracks()[0], oldStream);

        // Replace the old video track(s) with the new one(s)
        // const oldVideoTracks = oldStream.getVideoTracks();
        // if (oldVideoTracks.length > 0) {
        //   newStream.getVideoTracks().forEach((newTrack) => {
        //     oldVideoTracks.forEach((oldTrack) => {
        //       peer.replaceTrack(oldTrack, newTrack, oldStream);
        //     });
        //   });
        // }

        addStream(user._id, newStream);
        // Replace the old audio track(s) with the new one(s)
        // const oldAudioTracks = oldStream.getAudioTracks();
        // if (oldAudioTracks.length > 0) {
        //   newStream.getAudioTracks().forEach((newTrack) => {
        //     oldAudioTracks.forEach((oldTrack) => {
        //       peer.replaceTrack(oldTrack, newTrack, oldStream);
        //     });
        //   });
        // }
      });
    } catch (error) {
      console.error("Error accessing screen share.", error);
    }
  };

  const isParticipantSharingVideo = (userId: string) => {
    const stream = streams[userId];

    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.readyState === "live") {
        return true;
      }
    }

    return false;
  };

  return (
    <div className="flex flex-col w-full gap-4 bg-gray-950/70 0 py-6 border-b-[1px] border-cyan-600 ">
      <div className="grid grid-flow-auto md:grid-flow-col p-4 gap-2">
        {currentCallDetails?.participants?.length &&
          currentCallDetails?.participants.map((participant) => {
            return (
              <div
                key={participant.userId._id}
                className="bg-blue-950 hover:bg-blue-900 border-slate-600 border-[1px] flex rounded flex-col items-center justify-center gap-2 py-10 px-4 w-full overflow-hidden"
              >
                <AvatarCoin
                  className={`${isParticipantSharingVideo(participant?.userId._id) ? "hidden" : "block"}`}
                  source={participant?.userId?.avatarUrl || placeholderAvatar}
                  width={100}
                  alt={`${participant?.userId?.displayName}'s Avatar`}
                />
                <MediaPreviewDialog
                  content={<FullScreenVideo ref={fullscreenVideoRef} />}
                >
                  <video
                    autoPlay
                    onClick={() =>
                      handleVideoClick(streams[participant?.userId._id])
                    }
                    muted={participant?.userId._id === user?._id}
                    className={`${isParticipantSharingVideo(participant?.userId._id) ? "block" : "hidden"} max-w-full object-fit rounded-md`}
                    ref={(el) => {
                      if (el) el.srcObject = streams[participant?.userId._id];
                    }}
                  />
                </MediaPreviewDialog>
                <p>{participant?.userId?.displayName || "User"}</p>
              </div>
            );
          })}
      </div>

      <div className="flex justify-center items-center gap-2">
        {!isUserInOngoingCall && (
          <button
            onClick={handleAnswerCall}
            className="group p-2 max-w-1/2 h-fit bg-green-950 rounded-full hover:bg-green-900"
          >
            <CallIcon />
          </button>
        )}

        <button
          onClick={handleEndCall}
          className="group p-2 max-w-fit h-fit bg-red-950 rounded-full hover:bg-red-900"
        >
          <RejectCallIcon />
        </button>
        <button
          className="group p-2 max-w-fit h-fit bg-red-950 rounded-full hover:bg-red-900"
          onClick={handleAudioOff}
        >
          <MuteMicIcon />
        </button>
        <button
          className="group p-2 max-w-fit h-fit bg-red-950 rounded-full hover:bg-red-900"
          onClick={handleVideoOff}
        >
          <StopVideoIcon />
        </button>
        <button
          className="group p-2 max-w-fit h-fit bg-blue-950 rounded-full hover:bg-blue-900"
          onClick={handleScreenShare}
        >
          <ScreenShareIcon />
        </button>
      </div>
    </div>
  );
};

const FullScreenVideo = forwardRef<HTMLVideoElement>((_, ref) => {
  return <video ref={ref} muted={true} className="object-cover rounded-md" />;
});
