import { useCallback, useEffect, useState } from "react";

import { useSocketSubscription } from "@/lib/hooks/useSocketSubscription";
import { Chat } from "@/types/chat";
import { PublicUser } from "@/types/user";

type ChatId = Chat["_id"];

export function useIsInterlocutorOnline({
  interlocutors,
  chatId,
}: {
  interlocutors: PublicUser[];
  chatId: ChatId;
}) {
  const [isInterlocutorOnline, setIsInterlocutorOnline] =
    useState<boolean>(false);
  const interlocutor = interlocutors[0];

  useEffect(() => {
    setIsInterlocutorOnline(interlocutor?.status?.online || false);
  }, [interlocutor?.status?.online, chatId]);

  const handleInterlocutorOnlineStatus = useCallback(
    ({
      content,
    }: {
      content: { _id: PublicUser["_id"]; isOnline: boolean };
    }) => {
      if (interlocutor?._id === content._id) {
        setIsInterlocutorOnline(content.isOnline);
      }
    },
    [interlocutor?._id]
  );
  useSocketSubscription("broadcastUserStatus", handleInterlocutorOnlineStatus);

  return { isInterlocutorOnline };
}
