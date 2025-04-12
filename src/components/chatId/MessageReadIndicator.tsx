import { memo } from "react";

import { MessageReadIcon } from "@/components/Icons";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { placeholderAvatar } from "@/lib/const";
import { getLocalDate } from "@/lib/utils";
import { Message } from "@/types/message";

interface MessageReadIndicatorProps {
  message: Message;
  portalInto?: Element | null;
  interlocutorsNumber: number;
  className?: string;
}

export const MessageReadIndicator: React.FC<MessageReadIndicatorProps> = memo(
  function MessageReadIndicator({
    message,
    portalInto,
    interlocutorsNumber,
    className,
  }) {
    const usersWhoHaveReadMessage = message.readBy;
    const isMessageReadByAnyone =
      usersWhoHaveReadMessage.length > 0 &&
      usersWhoHaveReadMessage.length < interlocutorsNumber;
    const isMessageReadByEveryone =
      usersWhoHaveReadMessage.length === interlocutorsNumber;

    return (
      <Sheet>
        <SheetTrigger
          className={className}
          title="See users who read this message"
        >
          <MessageReadIcon
            double={isMessageReadByEveryone}
            backgroundClassName={`${isMessageReadByEveryone ? "fill-cyan-300" : isMessageReadByAnyone ? "fill-teal-200" : "fill-white"} transition-colors duration-500 ease-in-out`}
          />
        </SheetTrigger>
        <SheetContent container={portalInto} className="gap-6 flex flex-col">
          <SheetHeader className="gap-0">
            <SheetTitle>Message Sent</SheetTitle>
            <SheetDescription className="hidden">
              See users who've read this message
            </SheetDescription>
            <h2 className="font-semibold text-slate-400">Read by</h2>
          </SheetHeader>
          <ul className="flex flex-col px-2 gap-2 overflow-y-auto">
            {usersWhoHaveReadMessage.length ? (
              usersWhoHaveReadMessage.map((readByMember) => {
                const { date, time } = getLocalDate(
                  readByMember.timestamp,
                  "ro-RO"
                );
                return (
                  <div
                    key={readByMember.userId._id}
                    className="flex gap-6 items-center justify-between cursor-default border-b-[1px] border-slate-700 last:border-transparent py-2"
                  >
                    <div className="flex items-center gap-1">
                      <AvatarCoin
                        source={
                          readByMember.userId?.avatarUrl || placeholderAvatar
                        }
                        shouldInvalidate
                        alt={readByMember.userId.displayName + "'s Avatar"}
                        width={30}
                      />
                      <p className="truncate text-sm">
                        {readByMember.userId.displayName}
                      </p>
                    </div>
                    <p className="text-xs text-center text-slate-300 mt-0.5">
                      {date} {time}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-center text-slate-300">
                Message not read yet
              </p>
            )}
          </ul>
        </SheetContent>
      </Sheet>
    );
  }
);
