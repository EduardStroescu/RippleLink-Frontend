import { MessageReadIcon } from "@/components/Icons";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { placeholderAvatar } from "@/lib/const";
import { getLocalDate } from "@/lib/utils";
import { Message } from "@/types/message";

interface MessageReadIndicatorProps {
  message: Message;
  portalInto: Element | null | undefined;
  interlocutorsNumber: number;
}

export const MessageReadIndicator: React.FC<MessageReadIndicatorProps> = ({
  message,
  portalInto,
  interlocutorsNumber,
}) => {
  const usersWhoHaveReadMessage = message.readBy;
  const isMessageReadByEveryone =
    usersWhoHaveReadMessage.length === interlocutorsNumber;

  return (
    <Sheet>
      <SheetTrigger title="See users who read this message">
        <MessageReadIcon
          width="14px"
          height="14px"
          double={isMessageReadByEveryone}
          className={`${isMessageReadByEveryone ? "fill-cyan-300" : "fill-teal-200"} transition-colors duration-500 ease-in-out`}
        />
      </SheetTrigger>
      <SheetContent className="gap-6 flex flex-col" container={portalInto}>
        <SheetHeader>
          <SheetTitle>Read By:</SheetTitle>
        </SheetHeader>
        <ul className="flex flex-col px-2 gap-2 overflow-y-auto">
          {usersWhoHaveReadMessage.map((readByMember) => {
            const { date, time } = getLocalDate(
              readByMember.timestamp,
              "ro-RO"
            );
            return (
              <div
                key={readByMember.userId._id}
                className="flex gap-6 items-center justify-between cursor-default border-b-[1px] border-slate-700 last:border-transparent py-2"
              >
                <div className="flex items-center">
                  <AvatarCoin
                    source={readByMember.userId?.avatarUrl || placeholderAvatar}
                    alt={readByMember.userId.displayName + "'s Avatar"}
                    width={30}
                  />
                  <p className="truncate text-sm">
                    {readByMember.userId.displayName}
                  </p>
                </div>
                <p className="text-xs text-center text-slate-300">
                  {date} {time}
                </p>
              </div>
            );
          })}
        </ul>
      </SheetContent>
    </Sheet>
  );
};
