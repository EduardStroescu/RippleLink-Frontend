import React from "react";
import { CallIcon, CloseIcon } from "./Icons";
import { AvatarCoin } from "./UI/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";

interface CallEventOverlayProps {
  callerName: string;
  onAccept: () => void;
  onDecline: () => void;
  icon: string;
}

export const CallEventOverlay: React.FC<CallEventOverlayProps> = ({
  callerName,
  onAccept,
  onDecline,
  icon,
}) => {
  return (
    <div className="bg-black/70 rounded-xl p-2 px-3 flex items-center gap-2">
      <div className="flex items-center gap-1 w-full">
        <AvatarCoin
          source={icon || placeholderAvatar}
          width={40}
          alt="Chat Avatar"
        />
        <p className="truncate max-w-[9rem]">{callerName}</p>
        <span>is calling</span>
      </div>
      <div className="flex justify-center gap-2">
        <button
          onClick={onAccept}
          className="p-2 max-w-1/2 h-fit bg-green-950 rounded-full hover:bg-green-900"
        >
          <CallIcon />
        </button>
        <button
          onClick={onDecline}
          className="p-2 max-w-fit h-fit bg-red-950 rounded-full hover:bg-red-900"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};
