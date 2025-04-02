import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { create } from "mutative";
import { useCallback, useEffect, useMemo } from "react";

import { chatApi } from "@/api/modules/chat.api";
import { useSetTanstackCache } from "@/lib/hooks/useSetTanstackCache";
import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";
import { Status } from "@/types/status";

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
  const chatId = useParams({
    from: "/chat/$chatId",
    select: (params) => params.chatId,
  });
  const setChatsCache = useSetTanstackCache<Chat[]>(["chats", user?._id]);

  const { data: chatData } = useQuery(chatsQuery);
  const currentChat = useMemo(
    () => chatData?.find((chat) => chat._id === chatId),
    [chatData, chatId]
  );

  const isDmChat = useMemo(
    () => currentChat?.type !== "group",
    [currentChat?.type]
  );
  const interlocutors = useMemo(
    () =>
      currentChat && user?._id
        ? currentChat.users.filter((person) => person._id !== user._id)
        : [],
    [currentChat, user?._id]
  );
  const currInterlocutor = interlocutors[0];

  const shouldQueryInterlocutorStatus = !!currInterlocutor?._id && isDmChat;
  const { data: interlocutorStatus } = useQuery({
    queryKey: ["interlocutorStatus", currInterlocutor?._id],
    queryFn: () => chatApi.getInterlocutorStatus(currInterlocutor?._id),
    enabled: shouldQueryInterlocutorStatus,
  });

  const updateInterlocutorStatus = useCallback(
    (interlocutorStatus: Status) => {
      setChatsCache((prev) => {
        if (!prev) return prev;

        return create(prev, (draft) => {
          const chatIndex = draft.findIndex((chat) => chat._id === chatId);
          if (chatIndex === -1) return draft;
          const chatUsers = draft[chatIndex].users;
          const interlocutorIndex = chatUsers.findIndex(
            (user) => user._id === interlocutorStatus.userId
          );
          if (interlocutorIndex === -1) return;
          draft[chatIndex].users[interlocutorIndex].status = interlocutorStatus;
        });
      });
    },
    [chatId, setChatsCache]
  );

  useEffect(() => {
    if (!interlocutorStatus) return;
    updateInterlocutorStatus(interlocutorStatus);
  }, [currInterlocutor, interlocutorStatus, updateInterlocutorStatus]);

  return {
    isDmChat,
    interlocutors,
    currentChat,
  };
}
