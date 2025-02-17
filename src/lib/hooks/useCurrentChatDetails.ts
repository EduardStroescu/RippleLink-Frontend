import { useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useUserStore } from "@/stores/useUserStore";
import chatApi from "@/api/modules/chat.api";
import { useSetChatsCache } from "./useSetChatsCache";
import { create } from "mutative";
import { Chat, Status } from "@/types";

interface useCurrentChatDetailsProps {
  chatsQuery: {
    queryKey: string[];
    queryFn: () => Promise<Chat[] | []>;
    placeholderData: never[];
  };
}

export function useCurrentChatDetails({
  chatsQuery,
}: useCurrentChatDetailsProps) {
  const user = useUserStore((state) => state.user);
  const params = useParams({ from: "/chat/$chatId" });
  const setChatsCache = useSetChatsCache();

  const { data: chatData } = useQuery(chatsQuery);
  const currentChat = useMemo(
    () => chatData?.find((chat) => chat._id === params.chatId),
    [chatData, params.chatId]
  );

  const isDmChat = useMemo(
    () => currentChat?.type === "dm",
    [currentChat?.type]
  );
  const interlocutors = useMemo(
    () =>
      currentChat &&
      currentChat?.users?.filter((person) => person._id !== user?._id),
    [currentChat, user?._id]
  );

  const shouldQueryInterlocutorStatus = interlocutors?.[0]?._id && isDmChat;
  const { data: interlocutorStatus } = useQuery({
    queryKey: ["interlocutorStatus", interlocutors?.[0]?._id],
    queryFn: () => chatApi.getInterlocutorStatus(interlocutors?.[0]._id),
    enabled: !!shouldQueryInterlocutorStatus,
  });

  const updateInterlocutorStatus = useCallback(
    (interlocutorStatus: Status) => {
      setChatsCache((prev) => {
        if (!prev) return prev;

        return create(prev, (draft) => {
          const chatIndex = draft.findIndex(
            (chat) => chat._id === params.chatId
          );
          if (chatIndex === -1) return;
          const chatUsers = draft[chatIndex].users;
          const interlocutorIndex = chatUsers.findIndex(
            (user) => user._id === interlocutorStatus.userId
          );
          if (interlocutorIndex === -1) return;
          draft[chatIndex].users[interlocutorIndex].status = interlocutorStatus;
        });
      });
    },
    [params.chatId, setChatsCache]
  );

  useEffect(() => {
    if (!interlocutorStatus) return;
    updateInterlocutorStatus(interlocutorStatus);
  }, [interlocutorStatus, updateInterlocutorStatus]);

  return useMemo(
    () => ({
      isDmChat,
      interlocutors,
      currentChat,
    }),
    [currentChat, interlocutors, isDmChat]
  );
}
