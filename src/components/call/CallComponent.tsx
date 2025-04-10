import { memo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  AnswerCallButton,
  AudioSlider,
  EndCallButton,
  MicrophoneSwitch,
  ScreenShareButton,
  SwitchVideoOrientationButton,
  VideoButton,
} from "@/components/call/CallButtons";
import { UserBox } from "@/components/call/UserBox";
import { SettingsIcon } from "@/components/Icons";
import { MediaDevicesPicker } from "@/components/pickers/MediaDevicesPicker";
import { Loader } from "@/components/ui/Loader";
import { ResizableContainer } from "@/components/ui/ResizableContainer";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import {
  useStreamsStore,
  useStreamsStoreActions,
} from "@/stores/useStreamsStore";
import { useUserStore } from "@/stores/useUserStore";
import { Call } from "@/types/call";

interface CallComponentProps {
  currentCallDetails: Call | undefined;
}

export const CallComponent = memo(function CallComponent({
  currentCallDetails,
}: CallComponentProps) {
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
  const { answerCall, endCall, rejectCall } = useCallStoreActions();

  const handleAnswerCall = (videoEnabled?: boolean) => {
    if (!currentCallDetails) return;
    answerCall(currentCallDetails, videoEnabled);
  };

  const handleEndCall = () => {
    if (!currentCallDetails) return;
    endCall(currentCallDetails);
  };

  const handleRejectCall = () => {
    if (!currentCallDetails) return;
    rejectCall(currentCallDetails);
  };

  const handleVideoClick = useCallback(
    (userId: string, fullscreenVideoRef: React.RefObject<HTMLVideoElement>) => {
      setTimeout(() => {
        if (!fullscreenVideoRef.current) return;
        fullscreenVideoRef.current.srcObject = streams[userId].stream;
        fullscreenVideoRef.current.play().catch((_) => undefined);
      }, 0);
    },
    [streams]
  );

  const isUserInOngoingCall = currentCallDetails?.participants?.some(
    (participant) =>
      participant?.userId?._id === user?._id && participant.status === "inCall"
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
      if (!stream) return false;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.readyState === "live") {
        return true;
      }

      return false;
    },
    [streams]
  );

  const shouldDisplayRejectCallButton = currentCallDetails?.participants?.some(
    (participant) =>
      participant?.userId?._id === user?._id &&
      participant.status !== "rejected"
  );
  const shouldDisplayCallActionButtons =
    !currentCall && !isUserInOngoingCall && !joiningCall;
  const shouldDisplayCallLoading =
    (currentCall && !isUserInOngoingCall) || !!joiningCall;
  const shouldDisplayPlaceholderUserBox =
    !currentCallDetails?.participants?.length && !!user;
  const activeCallParticipants = currentCallDetails?.participants.filter(
    (participant) => participant.status === "inCall"
  );

  return (
    <ResizableContainer className="flex flex-col w-full bg-gray-950/70 py-2 pb-6 gap-4 border-b-[1px] border-cyan-600">
      <div className="grid grid-flow-col px-2 gap-1 md:gap-2 h-full overflow-hidden">
        {!!activeCallParticipants?.length &&
          activeCallParticipants.map((participant) => {
            return (
              <UserBox
                key={participant.userId._id}
                displayName={participant.userId.displayName}
                userId={participant.userId._id}
                avatar={participant.userId?.avatarUrl}
                muted={true}
                isSharingVideo={isParticipantSharingVideo(
                  participant?.userId._id
                )}
                userStream={streams[participant.userId._id]}
                handleVideoClick={handleVideoClick}
                handleToggleVideoPopUp={
                  participant.userId._id !== user?._id
                    ? toggleStreamPopUp
                    : undefined
                }
              />
            );
          })}
        {shouldDisplayPlaceholderUserBox && (
          <UserBox
            displayName={user.displayName}
            userId={user._id}
            avatar={user?.avatarUrl}
            muted={true}
            isSharingVideo={isParticipantSharingVideo(user?._id)}
            userStream={streams[user._id]}
            handleVideoClick={handleVideoClick}
          />
        )}
      </div>

      <div className="relative flex justify-center items-center gap-2">
        {shouldDisplayCallActionButtons && (
          <>
            <AnswerCallButton handleAnswerCall={() => handleAnswerCall()} />
            <AnswerCallButton
              withVideo
              handleAnswerCall={() => handleAnswerCall(true)}
            />
            {shouldDisplayRejectCallButton && (
              <EndCallButton handleEndCall={handleRejectCall} />
            )}
          </>
        )}
        <Loader active={shouldDisplayCallLoading} />
        {isUserInOngoingCall && (
          <>
            <EndCallButton handleEndCall={handleEndCall} />
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
