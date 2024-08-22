import { memo, useCallback, useRef } from "react";
import { AvatarCoin } from "./ui/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";
import {
  CallIcon,
  MuteMicIcon,
  RejectCallIcon,
  ScreenShareIcon,
  StopVideoIcon,
  UnmuteMicIcon,
  VideoCallIcon,
} from "./Icons";
import { useUserStore } from "@/stores/useUserStore";
import MediaPreviewDialog from "./MediaPreviewDialog";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import { useCallContext } from "@/providers/CallProvider";
import { useShallow } from "zustand/react/shallow";
import { VideoComponent } from "./ui/Video";
import { Call } from "@/types/call";
import { ResizableContainer } from "./ui/ResizableContainer";

interface VideoCallProps {
  currentCallDetails: Call | undefined;
}

export const CallComponent = memo(({ currentCallDetails }: VideoCallProps) => {
  const user = useUserStore((state) => state.user);
  const { setIsUserMicrophoneMuted } = useCallStoreActions();
  const { answerCall, endCall, handleScreenShare, handleVideoShare } =
    useCallContext();
  const { currentCall, streams, isUserMicrophoneMuted, joiningCall } =
    useCallStore(
      useShallow((state) => ({
        currentCall: state.currentCall,
        streams: state.streams,
        isUserMicrophoneMuted: state.isUserMicrophoneMuted,
        joiningCall: state.joiningCall,
      }))
    );

  const handleAnswerCall = (videoEnabled?: boolean) => {
    if (currentCallDetails) {
      answerCall(currentCallDetails, videoEnabled);
    }
  };

  const handleEndCall = () => {
    if (currentCallDetails) {
      endCall(currentCallDetails);
    }
  };

  const handleVideoClick = (
    userId: string,
    fullscreenVideoRef: React.RefObject<HTMLVideoElement>
  ) => {
    setTimeout(() => {
      if (fullscreenVideoRef.current) {
        fullscreenVideoRef.current.srcObject = streams[userId];
        fullscreenVideoRef.current.play();
      }
    }, 0);
  };

  const isUserInOngoingCall = currentCallDetails?.participants?.some(
    (participant) => participant?.userId?._id === user?._id
  );

  const handleAudioOff = () => {
    if (!user?._id) return;
    const audioTracks = streams[user?._id]?.getAudioTracks();
    if (!audioTracks) return;

    if (isUserMicrophoneMuted) {
      audioTracks.forEach((audioTrack) => {
        audioTrack.enabled = true;
      });
      setIsUserMicrophoneMuted(false);
    } else {
      audioTracks.forEach((audioTrack) => {
        audioTrack.enabled = false;
      });
      setIsUserMicrophoneMuted(true);
    }
  };

  const isParticipantSharingVideo = useCallback(
    (userId: string | undefined) => {
      if (!userId) return false;

      const stream = streams[userId];

      if (stream) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && videoTrack.readyState === "live") {
          return true;
        }
      }
      return false;
    },
    [streams]
  );

  return (
    <ResizableContainer className="flex flex-col w-full bg-gray-950/70 py-2 pb-6 gap-4 border-b-[1px] border-cyan-600">
      <div className="grid grid-flow-col px-2 gap-1 md:gap-2 h-full overflow-hidden">
        {!!currentCallDetails?.participants?.length &&
          currentCallDetails?.participants?.map((participant) => {
            return (
              <UserBox
                key={participant.userId._id}
                displayName={participant?.userId?.displayName}
                userId={participant?.userId?._id}
                avatar={participant?.userId?.avatarUrl || placeholderAvatar}
                muted={true}
                isSharingVideo={isParticipantSharingVideo(
                  participant?.userId?._id
                )}
                userStream={streams[participant?.userId?._id]}
                handleVideoClick={handleVideoClick}
              />
            );
          })}
        {!currentCallDetails?.participants?.length && user && (
          <UserBox
            displayName={user.displayName}
            userId={user._id}
            avatar={user.avatarUrl || placeholderAvatar}
            muted={true}
            isSharingVideo={isParticipantSharingVideo(user?._id)}
            userStream={streams[user._id]}
            handleVideoClick={handleVideoClick}
          />
        )}
      </div>

      <div className="flex justify-center items-center gap-2">
        {!currentCall && !isUserInOngoingCall && !joiningCall && (
          <>
            <button
              onClick={() => handleAnswerCall()}
              className="group p-2 max-w-1/2 h-fit bg-green-950 rounded-full hover:bg-green-900"
            >
              <CallIcon />
            </button>
            <button
              onClick={() => handleAnswerCall(true)}
              className="group p-2 max-w-1/2 h-fit bg-green-950 rounded-full hover:bg-green-900"
            >
              <VideoCallIcon />
            </button>
          </>
        )}
        {((currentCall && !isUserInOngoingCall) || joiningCall) && (
          <div className="p-1 animate-spin bg-gradient-to-bl from-pink-400 via-purple-400 to-indigo-600 w-14 h-14 aspect-square rounded-full">
            <div className="rounded-full h-full w-full bg-gray-950/95" />
          </div>
        )}

        {isUserInOngoingCall && (
          <>
            <button
              onClick={handleEndCall}
              className="group p-2 max-w-fit h-fit bg-red-950 rounded-full hover:bg-red-900"
            >
              <RejectCallIcon />
            </button>
            <AudioButton handleAudio={handleAudioOff} />
            <ShareVideoButton handleShareVideo={handleVideoShare} />
            <ScreenShareButton handleScreenShare={handleScreenShare} />
          </>
        )}
      </div>
    </ResizableContainer>
  );
});

interface UserBoxProps {
  displayName: string;
  userId: string;
  avatar: string;
  muted: boolean;
  isSharingVideo: boolean;
  userStream: MediaStream | null;
  handleVideoClick: (
    userId: string,
    fullscreenVideoRef: React.RefObject<HTMLVideoElement>
  ) => void;
}

const UserBox = memo(
  ({
    displayName,
    userId,
    avatar,
    muted,
    isSharingVideo,
    userStream,
    handleVideoClick,
  }: UserBoxProps) => {
    const fullscreenVideoRef = useRef<HTMLVideoElement>(null);

    return (
      <div className="bg-blue-950 hover:bg-blue-900 border-slate-600 border-[1px] flex rounded flex-col items-center justify-center gap-1 py-6 px-4 w-full overflow-hidden">
        <AvatarCoin
          className={`${isSharingVideo ? "hidden" : "block"} min-w-[80px]`}
          source={avatar}
          alt={`${displayName}'s Avatar`}
        />
        {isSharingVideo && (
          <MediaPreviewDialog
            className="w-full h-full"
            content={
              <VideoComponent
                ref={fullscreenVideoRef}
                muted={true}
                controls={false}
              />
            }
          >
            <VideoComponent
              onClick={() => handleVideoClick(userId, fullscreenVideoRef)}
              muted={muted}
              controls={false}
              className="w-full min-w-[70px] min-h-[70px] h-full object-fit rounded-md"
              ref={(el) => {
                if (el && el.srcObject !== userStream) {
                  el.srcObject = userStream;
                  el.play();
                }
              }}
            />
          </MediaPreviewDialog>
        )}
        <p>{displayName || "User"}</p>
      </div>
    );
  }
);

const AudioButton = ({ handleAudio }: { handleAudio: () => void }) => {
  const isUserMicrophoneMuted = useCallStore(
    (state) => state.isUserMicrophoneMuted
  );
  return (
    <button
      className={`
            ${isUserMicrophoneMuted ? "bg-red-950 hover:bg-red-900" : "bg-green-950 hover:bg-green-900"}
            group p-2 max-w-fit h-fit rounded-full`}
      onClick={handleAudio}
    >
      {isUserMicrophoneMuted ? <MuteMicIcon /> : <UnmuteMicIcon />}
    </button>
  );
};

const ShareVideoButton = ({
  handleShareVideo,
}: {
  handleShareVideo: () => void;
}) => {
  const isUserSharingVideo = useCallStore((state) => state.isUserSharingVideo);
  if (isUserSharingVideo !== false && isUserSharingVideo !== "video") {
    return null;
  } else
    return (
      <button
        className={`
            ${isUserSharingVideo ? "bg-red-950 hover:bg-red-900" : "bg-green-950 hover:bg-green-900"}
            group p-2 max-w-fit h-fit rounded-full `}
        onClick={handleShareVideo}
      >
        {isUserSharingVideo ? <StopVideoIcon /> : <VideoCallIcon />}
      </button>
    );
};

const ScreenShareButton = ({
  handleScreenShare,
}: {
  handleScreenShare: () => void;
}) => {
  const isUserSharingVideo = useCallStore((state) => state.isUserSharingVideo);
  return (
    <button
      className={`
        ${isUserSharingVideo ? "bg-red-950 hover:bg-red-900" : "bg-blue-950 hover:bg-blue-900"}
        group p-2 max-w-fit h-fit rounded-full`}
      onClick={handleScreenShare}
    >
      {isUserSharingVideo ? (
        <ScreenShareIcon screenShare={true} />
      ) : (
        <ScreenShareIcon screenShare={false} />
      )}
    </button>
  );
};
