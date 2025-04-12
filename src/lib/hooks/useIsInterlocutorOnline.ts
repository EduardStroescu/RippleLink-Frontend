import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { chatApi } from "@/api/modules/chat.api";
import { useSocketSubscription } from "@/lib/hooks/useSocketSubscription";
import { Chat } from "@/types/chat";
import { PublicUser } from "@/types/user";

export function useIsInterlocutorOnline({
  interlocutor,
  chatId,
  isDmChat,
}: {
  interlocutor: PublicUser | undefined;
  chatId: Chat["_id"];
  isDmChat: boolean;
}) {
  const [isInterlocutorOnline, setIsInterlocutorOnline] =
    useState<boolean>(false);

  const shouldQueryInterlocutorStatus = !!interlocutor?._id && isDmChat;
  const { data: interlocutorStatus } = useQuery({
    queryKey: ["interlocutorStatus", interlocutor?._id],
    queryFn: () => chatApi.getInterlocutorStatus(interlocutor?._id as string),
    enabled: shouldQueryInterlocutorStatus,
  });

  useEffect(() => {
    setIsInterlocutorOnline((prev) => {
      if (interlocutorStatus?.online === undefined) return prev;

      return interlocutorStatus.online;
    });
  }, [interlocutorStatus?.online, chatId]);

  const handleInterlocutorOnlineStatus = useCallback(
    ({
      content,
    }: {
      content: { _id: PublicUser["_id"]; isOnline: boolean };
    }) => {
      if (interlocutor?._id !== content._id) return;
      setIsInterlocutorOnline((prev) =>
        prev === content.isOnline ? prev : content.isOnline
      );
    },
    [interlocutor?._id]
  );
  useSocketSubscription("broadcastUserStatus", handleInterlocutorOnlineStatus);

  return { isInterlocutorOnline, lastSeen: interlocutorStatus?.lastSeen };
}
