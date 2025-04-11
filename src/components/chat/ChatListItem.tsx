import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { TrashIcon } from "@/components/Icons";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";
import { getLastMessageDate } from "@/lib/utils";
import { Message } from "@/types/message";

export const ChatListItem = ({
  linkTo,
  avatarUrl,
  name,
  lastMessage,
  displayLastMessageReceipt,
  handleDeleteChat,
}: {
  linkTo: string;
  avatarUrl: string;
  name: string;
  lastMessage: Message;
  displayLastMessageReceipt: boolean;
  handleDeleteChat: (linkTo: string) => void;
}) => {
  const activeProps = useMemo(() => ({ className: `font-bold` }), []);

  return (
    <Link
      to={`/chat/${linkTo}`}
      preload={false}
      activeProps={activeProps}
      className="flex items-center text-white hover:bg-black/80 group/chat"
    >
      <AvatarCoin
        source={avatarUrl || placeholderAvatar}
        shouldInvalidate
        width={50}
        alt={name}
        className="m-3 p-0"
      />
      <div className="flex flex-col py-5 px-3 border-b-[1px] border-slate-700 flex-1 w-full overflow-hidden">
        <div className="flex gap-1 items-center">
          <p className="truncate">{name || "User"}</p>
          {displayLastMessageReceipt && (
            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 focus:outline-none bg-slate-950">
              <span className="animate-pulse text-xs font-bold text-slate-400">
                Unread
              </span>
            </div>
          )}
        </div>
        <p className="font-normal text-gray-400 truncate">
          {lastMessage.type === "file" ? lastMessage.type : lastMessage.content}
        </p>
      </div>
      <div className="flex gap-2 items-center border-b-[1px] border-slate-700 h-full">
        <p className="text-xs font-normal pr-2 group-hover/chat:pr-0">
          {getLastMessageDate(lastMessage.createdAt, "ro-RO")}
        </p>
        <button
          title="Delete Chat"
          aria-label="Delete Chat"
          className="group mr-2 hidden group-hover/chat:block"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleDeleteChat(linkTo);
          }}
        >
          <TrashIcon />
        </button>
      </div>
    </Link>
  );
};
