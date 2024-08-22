import { Link } from "@tanstack/react-router";
import { BackIcon } from "./Icons";
import { AvatarCoin } from "./ui/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";

export function ChatHeaderDetails({
  avatarUrl,
  name,
  lastSeen,
  isInterlocutorOnline,
}: {
  avatarUrl: string;
  name: string;
  lastSeen?: string;
  isInterlocutorOnline?: boolean;
}) {
  return (
    <div className="flex flex-row gap-2 text-white min-h-[56px] items-center overflow-hidden">
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
        alt={`${name}'s avatar`}
      />
      <div className="overflow-hidden">
        <p className="truncate">{name}</p>
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
}
