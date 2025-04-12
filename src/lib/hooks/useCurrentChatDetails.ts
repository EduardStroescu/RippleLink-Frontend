import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";

interface useCurrentChatDetailsProps {
  chatsQuery: {
    queryKey: string[];
    queryFn: () => Promise<Chat[]>;
    placeholderData: never[];
    enabled: boolean;
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

  return {
    isDmChat,
    interlocutors,
    currentChat,
  };
}
