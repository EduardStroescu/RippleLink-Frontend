import { memo, useRef, useState } from "react";

import { PopUpIcon } from "@/components/Icons";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { MediaPreviewDialog } from "@/components/ui/MediaPreviewDialog";
import { VideoComponent } from "@/components/ui/VideoComponent";
import { placeholderAvatar } from "@/lib/const";

interface UserBoxProps {
  displayName: string;
  userId: string;
  avatar: string | undefined;
  muted: boolean;
  isSharingVideo: boolean;
  userStream: { stream: MediaStream | null; shouldDisplayPopUp?: boolean };
  handleVideoClick: (
    userId: string,
    fullscreenVideoRef: React.RefObject<HTMLVideoElement>
  ) => void;
  handleToggleVideoPopUp?: (userId: string) => void;
}

export const UserBox = memo(function UserBox({
  displayName,
  userId,
  avatar,
  muted,
  isSharingVideo,
  userStream,
  handleVideoClick,
  handleToggleVideoPopUp,
}: UserBoxProps) {
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative bg-blue-950 hover:bg-blue-900 border-slate-600 border-[1px] flex rounded flex-col items-center justify-center gap-1 py-6 px-4 w-full overflow-hidden">
      <AvatarCoin
        className={`${isSharingVideo ? "hidden" : "block"} min-w-[80px]`}
        source={avatar || placeholderAvatar}
        alt={`${displayName}'s Avatar`}
      />
      {isSharingVideo && (
        <MediaPreviewDialog
          className="w-full h-full"
          open={isVideoFullscreen}
          setOpen={setIsVideoFullscreen}
          content={
            <VideoComponent
              ref={fullscreenVideoRef}
              muted={true}
              controls={false}
              contentClassName="max-h-[80dvh]"
              className="w-[min(70dvw,130dvh)] max-w-fit"
            />
          }
        >
          <VideoComponent
            onClick={() => handleVideoClick(userId, fullscreenVideoRef)}
            muted={muted}
            controls={false}
            className="w-full min-w-[70px] min-h-[70px] h-full object-fit rounded-md"
            contentClassName="w-full min-w-[70px] min-h-[70px] h-full object-fit rounded-md"
            ref={(el) => {
              if (
                el &&
                el.srcObject !== userStream?.stream &&
                !isVideoFullscreen
              ) {
                el.srcObject = userStream?.stream;
                el.play().catch((_) => undefined);
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
          title="Toggle Video Popup"
          aria-label="Toggle Video Popup"
        >
          <PopUpIcon />
        </button>
      )}
    </div>
  );
});
