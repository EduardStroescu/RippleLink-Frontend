import { useCallback, useEffect, useState } from "react";
import { useSocketSubscription } from "./useSocketSubscription";
import { PublicUser } from "@/types";

export function useIsInterlocutorOnline({
  interlocutors,
  params,
}: {
  interlocutors: PublicUser[] | undefined;
  params;
}) {
  const [isInterlocutorOnline, setIsInterlocutorOnline] =
    useState<boolean>(false);
  const interlocutor = interlocutors?.[0];

  useEffect(() => {
    setIsInterlocutorOnline(interlocutor?.status?.online || false);
  }, [interlocutor?.status?.online, params.chatId]);

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
