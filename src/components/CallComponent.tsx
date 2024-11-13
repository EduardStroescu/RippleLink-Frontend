import { memo, useCallback, useRef, useState } from "react";
import { AvatarCoin } from "./ui/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";
import {
  CallIcon,
  CameraOrientationSwitchIcon,
  MuteMicIcon,
  PopUpIcon,
  RejectCallIcon,
  ScreenShareIcon,
  SettingsIcon,
  StopVideoIcon,
  UnmuteMicIcon,
  VideoCallIcon,
  VolumeIcon,
} from "./Icons";
import { useUserStore } from "@/stores/useUserStore";
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import { useShallow } from "zustand/react/shallow";
import { Call } from "@/types/call";
import { VideoComponent, ResizableContainer } from "@/components/ui";
import { PublicUser } from "@/types/user";
import { MediaDevicesPicker } from "./MediaDevicesPicker";
import { VolumeSwitcher } from "./VolumeSwitcher";
import {
  useStreamsStore,
  useStreamsStoreActions,
} from "@/stores/useStreamsStore";
import { useQueryClient } from "@tanstack/react-query";

interface VideoCallProps {
  currentCallDetails: Call | undefined;
}

export const CallComponent = memo(({ currentCallDetails }: VideoCallProps) => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const { streams, isUserMicrophoneMuted } = useStreamsStore(
    useShallow((state) => ({
      streams: state.streams,
      isUserMicrophoneMuted: state.isUserMicrophoneMuted,
    }))
  );
  const { currentCall, joiningCall } = useCallStore(
    useShallow((state) => ({
      currentCall: state.currentCall,
      joiningCall: state.joiningCall,
    }))
  );
  const {
    handleScreenShare,
    handleVideoShare,
    handleSwitchCameraOrientation,
    handleSwitchDevice,
    setIsUserMicrophoneMuted,
    toggleStreamPopUp,
  } = useStreamsStoreActions();
  const { answerCall, endCall } = useCallStoreActions();

  const handleAnswerCall = (videoEnabled?: boolean) => {
    if (currentCallDetails) {
      answerCall(currentCallDetails, videoEnabled);
    }
  };

  const handleEndCall = () => {
    if (currentCallDetails) {
      endCall(currentCallDetails);
      queryClient.invalidateQueries({ queryKey: ["calls"] });
    }
  };

  const handleVideoClick = (
    userId: string,
    fullscreenVideoRef: React.RefObject<HTMLVideoElement>
  ) => {
    setTimeout(() => {
      if (fullscreenVideoRef.current) {
        fullscreenVideoRef.current.srcObject = streams[userId].stream;
        fullscreenVideoRef.current.play();
      }
    }, 0);
  };

  const isUserInOngoingCall = currentCallDetails?.participants?.some(
    (participant) => participant?.userId?._id === user?._id
  );

  const handleAudioOff = () => {
    if (!user?._id) return;
    const audioTracks = streams[user?._id]?.stream?.getAudioTracks();
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

      const stream = streams[userId]?.stream;

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

  const handleToggleVideoPopUp = (userId: PublicUser["_id"]) => {
    toggleStreamPopUp(userId);
  };

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
                handleToggleVideoPopUp={
                  participant?.userId?._id !== user?._id
                    ? handleToggleVideoPopUp
                    : undefined
                }
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

      <div className="relative flex justify-center items-center gap-2">
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
            <MicrophoneSwitch handleAudio={handleAudioOff} />
            <ScreenShareButton handleScreenShare={handleScreenShare} />
            <AudioSlider />
            <VideoButton handleShareVideo={handleVideoShare} />
            <SwitchVideoOrientationButton
              switchCameraOrientation={handleSwitchCameraOrientation}
            />
            <MediaDevicesPicker getValue={handleSwitchDevice}>
              <div className="p-1 max-w-fit h-fit rounded-full bg-blue-950 hover:bg-blue-900">
                <SettingsIcon width={20} height={20} />
              </div>
            </MediaDevicesPicker>
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
  userStream: { stream: MediaStream | null; shouldDisplayPopUp?: boolean };
  handleVideoClick: (
    userId: string,
    fullscreenVideoRef: React.RefObject<HTMLVideoElement>
  ) => void;
  handleToggleVideoPopUp?: (userId: string) => void;
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
    handleToggleVideoPopUp,
  }: UserBoxProps) => {
    const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
    const fullscreenVideoRef = useRef<HTMLVideoElement>(null);

    return (
      <div className="relative bg-blue-950 hover:bg-blue-900 border-slate-600 border-[1px] flex rounded flex-col items-center justify-center gap-1 py-6 px-4 w-full overflow-hidden">
        <AvatarCoin
          className={`${isSharingVideo ? "hidden" : "block"} min-w-[80px]`}
          source={avatar}
          alt={`${displayName}'s Avatar`}
        />
        {isSharingVideo && (
          <MediaPreviewDialog
            className="w-full h-full"
            contentClassName="w-fit h-full md:w-fit"
            open={isVideoFullscreen}
            setOpen={setIsVideoFullscreen}
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
                if (
                  el &&
                  el.srcObject !== userStream?.stream &&
                  !isVideoFullscreen
                ) {
                  el.srcObject = userStream?.stream;
                  el.play();
                } else if (el && el.srcObject && isVideoFullscreen) {
                  el.pause();
                  el.srcObject = null;
                }
              }}
            />
          </MediaPreviewDialog>
        )}
        <p>{displayName || "User"}</p>
        {handleToggleVideoPopUp && (
          <button
            onClick={() => handleToggleVideoPopUp(userId)}
            className={`${userStream?.shouldDisplayPopUp ? "bg-green-800" : "bg-red-800"} group absolute right-1.5 top-1.5 rounded-full p-0.5 hover:scale-110 transition-all ease-in-out`}
          >
            <PopUpIcon />
          </button>
        )}
      </div>
    );
  }
);

const AudioSlider = () => {
  const outputVolume = useStreamsStore((state) => state.outputVolume);
  const { setOutputVolume } = useStreamsStoreActions();

  return (
    <VolumeSwitcher volume={outputVolume} setVolume={setOutputVolume}>
      <div
        className={`
        ${outputVolume === 0 ? "bg-red-950 hover:bg-red-900" : "bg-green-950 hover:bg-green-900"}
        group p-2 max-w-fit h-fit rounded-full`}
      >
        <VolumeIcon />
      </div>
    </VolumeSwitcher>
  );
};

const MicrophoneSwitch = ({ handleAudio }: { handleAudio: () => void }) => {
  const isUserMicrophoneMuted = useStreamsStore(
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

const VideoButton = ({
  handleShareVideo,
}: {
  handleShareVideo: () => void;
}) => {
  const isUserSharingVideo = useStreamsStore(
    (state) => state.isUserSharingVideo
  );
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

const SwitchVideoOrientationButton = ({
  switchCameraOrientation,
}: {
  switchCameraOrientation: () => void;
}) => {
  const isUserSharingVideo = useStreamsStore(
    (state) => state.isUserSharingVideo
  );
  if (isUserSharingVideo !== "video") {
    return null;
  } else
    return (
      <button
        onClick={switchCameraOrientation}
        className="group p-2 max-w-fit h-fit rounded-full"
      >
        <CameraOrientationSwitchIcon />
      </button>
    );
};

const ScreenShareButton = ({
  handleScreenShare,
}: {
  handleScreenShare: () => void;
}) => {
  const isUserSharingVideo = useStreamsStore(
    (state) => state.isUserSharingVideo
  );

  if (isUserSharingVideo === "video") {
    return null;
  } else
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
