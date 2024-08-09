import { forwardRef, useEffect, useState } from "react";
import { User } from "@/types/user";
import { AvatarCoin } from "./UI/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";
import { CallIcon, CloseIcon } from "./Icons";
import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";
import MediaPreviewDialog from "./MediaPreviewDialog";
import { useCallStore } from "@/stores/useCallStore";
import { useCallContext } from "@/providers/CallProvider";
import { SignalData } from "simple-peer";

interface VideoCallProps {
  chatId: string;
  chatParticipants: User[];
  currentChat: Chat;
}

export const CallComponent = ({ chatId, currentChat }: VideoCallProps) => {
  const user = useUserStore((state) => state.user);
  const currentCallDetails = currentChat.ongoingCall;
  const [selectedVideo, setSelectedVideo] = useState<MediaStream | null>(null);
  const streams = useCallStore((state) => state.streams);
  const { answerCall, endCall } = useCallContext();

  const handleAnswerCall = () => {
    if (currentCallDetails) {
      answerCall(chatId, currentCallDetails);
    }
  };

  const handleEndCall = () => {
    endCall(chatId);
  };

  const handleVideoClick = (participantId: string) => {
    const selectedVideoElement = streams[participantId];
    if (selectedVideoElement) {
      setSelectedVideo(selectedVideoElement);
    }
  };

  const fullScreenVideoRefCallback = (videoElement) => {
    if (videoElement && selectedVideo) {
      videoElement.srcObject = selectedVideo;
      videoElement.play();
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 bg-gray-950/70 0 py-6 border-b-[1px] border-cyan-600">
      <div className="grid grid-flow-col p-4 gap-2]">
        {currentCallDetails?.participants?.length &&
          currentCallDetails?.participants.map((participant) => {
            return (
              <div
                key={participant.userId._id}
                className="bg-blue-950 hover:bg-blue-900 border-slate-600 border-[1px] flex rounded flex-col items-center justify-center gap-2 py-10 px-4"
              >
                <AvatarCoin
                  //TODO: REVERSE THIS
                  className={`${participant?.isSharingVideo ? "block" : "hidden"}`}
                  source={participant?.userId?.avatarUrl || placeholderAvatar}
                  width={200}
                  alt={`${participant?.userId?.displayName}'s Avatar`}
                />
                <MediaPreviewDialog
                  content={
                    <FullScreenVideo
                      currUserId={user?._id}
                      participant={participant}
                      ref={fullScreenVideoRefCallback}
                    />
                  }
                >
                  <video
                    autoPlay
                    onClick={() => handleVideoClick(participant?.userId._id)}
                    muted={participant?.userId._id === user?._id}
                    //TODO: REVERSE THIS
                    className={`${!participant?.isSharingVideo ? "block" : "hidden"} max-w-[500px] aspect-video object-fit rounded-md`}
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
        <button
          onClick={handleAnswerCall}
          className="group p-2 max-w-1/2 h-fit bg-green-950 rounded-full hover:bg-green-900"
        >
          <CallIcon />
        </button>

        <button
          onClick={handleEndCall}
          className="group p-2 max-w-fit h-fit bg-red-950 rounded-full hover:bg-red-900"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

interface FullScreenVideoProps {
  participant: { userId: User; signal: SignalData };
  currUserId: User["_id"] | undefined;
}

const FullScreenVideo = forwardRef<HTMLVideoElement, FullScreenVideoProps>(
  ({ participant, currUserId }, ref) => {
    return (
      <video
        ref={ref}
        muted={participant?.userId._id === currUserId}
        //TODO: REVERSE THIS
        className={`${!participant?.isSharingVideo ? "block" : "hidden"}  object-cover rounded-md`}
      />
    );
  }
);
