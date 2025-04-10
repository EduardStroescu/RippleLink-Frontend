import { Link } from "@tanstack/react-router";
import { memo, useEffect, useRef, useState } from "react";

import { BackIcon, CheckIcon, EditIcon } from "@/components/Icons";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";
import { PublicUser } from "@/types/user";

export const ChatHeaderDetails = memo(function ChatHeaderDetails({
  avatarUrl,
  name,
  lastSeen,
  isInterlocutorOnline,
  handleEditChatName,
  isEditingChatName,
  setChatName,
  handleResetInput,
}: {
  avatarUrl: PublicUser["avatarUrl"];
  name: string | undefined;
  lastSeen?: string;
  isInterlocutorOnline?: boolean;
  handleEditChatName?: () => void;
  isEditingChatName?: boolean;
  setChatName?: React.Dispatch<React.SetStateAction<string>>;
  handleResetInput?: () => void;
}) {
  const [inputWidth, setInputWidth] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!spanRef.current) return;
    setInputWidth(spanRef.current.offsetWidth + 10);
  }, [name, isEditingChatName]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleEditChatName && handleEditChatName();
    } else if (e.key === "Escape") {
      handleResetInput && handleResetInput();
    }
  };

  return (
    <div className="flex flex-row gap-0.5 sm:gap-2 text-white items-center overflow-hidden w-full">
      <Link
        to="/chat"
        preload={false}
        className="group flex md:hidden gap-1 items-center"
      >
        <BackIcon /> <span className="text-xs">Back</span>
      </Link>
      <AvatarCoin
        source={avatarUrl || placeholderAvatar}
        shouldInvalidate
        width={50}
        className="min-h-[50px]"
        alt={`${name || "Chat"}'s avatar`}
      />
      <div className="overflow-hidden w-full">
        <div className="flex items-center gap-1 w-full">
          {isEditingChatName ? (
            <>
              <input
                autoFocus
                ref={inputRef}
                value={name}
                onKeyUp={handleKeyPress}
                style={{ width: `${inputWidth}px` }}
                onChange={(e) => setChatName && setChatName(e.target.value)}
                className="bg-inherit focus-visible:outline-0 truncate border-white border-[1px] rounded px-1 max-w-[calc(100%-30px)]"
              />
              {/* Hidden span to calculate input width */}
              <span
                ref={spanRef}
                className="absolute invisible whitespace-nowrap truncate border-[1px] px-1"
                aria-hidden="true"
              >
                {name}
              </span>
            </>
          ) : (
            <p className="truncate">{name}</p>
          )}
          {handleEditChatName && (
            <button
              onClick={handleEditChatName}
              className="flex items-center justify-center"
              title={isEditingChatName ? "Save Chat Name" : "Edit Chat Name"}
              aria-label={
                isEditingChatName ? "Save Chat Name" : "Edit Chat Name"
              }
            >
              {isEditingChatName ? (
                <CheckIcon width="15px" height="15px" />
              ) : (
                <EditIcon />
              )}
            </button>
          )}
        </div>
        {lastSeen && (
          <p className="text-xs">
            {isInterlocutorOnline
              ? "online"
              : `Last seen ${lastSeen.slice(0, 10)}`}
          </p>
        )}
      </div>
    </div>
  );
});
