import { VolumeSwitcher } from "@/components/call/VolumeSwitcher";
import {
  CallIcon,
  CameraOrientationSwitchIcon,
  MuteMicIcon,
  RejectCallIcon,
  ScreenShareIcon,
  StopVideoIcon,
  UnmuteMicIcon,
  VideoCallIcon,
  VolumeIcon,
} from "@/components/Icons";
import {
  useStreamsStore,
  useStreamsStoreActions,
} from "@/stores/useStreamsStore";

export const AnswerCallButton = ({
  handleAnswerCall,
  withVideo,
}: {
  handleAnswerCall: () => void;
  withVideo?: boolean;
}) => {
  return (
    <button
      onClick={handleAnswerCall}
      className="group p-2 max-w-1/2 h-fit bg-green-950 rounded-full hover:bg-green-900"
    >
      {withVideo ? <VideoCallIcon /> : <CallIcon />}
    </button>
  );
};

export const EndCallButton = ({
  handleEndCall,
}: {
  handleEndCall: () => void;
}) => {
  return (
    <button
      onClick={handleEndCall}
      className="group p-2 max-w-fit h-fit bg-red-950 rounded-full hover:bg-red-900"
    >
      <RejectCallIcon />
    </button>
  );
};

export const AudioSlider = () => {
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

export const MicrophoneSwitch = ({
  handleAudio,
}: {
  handleAudio: () => void;
}) => {
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

export const VideoButton = ({
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

export const SwitchVideoOrientationButton = ({
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

export const ScreenShareButton = ({
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
