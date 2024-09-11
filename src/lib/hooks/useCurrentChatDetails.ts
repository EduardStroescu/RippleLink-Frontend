import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";
import chatApi from "@/api/modules/chat.api";
import { useSetChatsCache } from "./useSetChatsCache";
import { create } from "mutative";
import { Status } from "@/types/status";
import { useToast } from "@/components/ui";

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
  const { toast } = useToast();
  const setChatsCache = useSetChatsCache();

  const [chatName, setChatName] = useState("");
  const [isEditingChatName, setIsEditingChatName] = useState(false);

  const { data: chatData } = useQuery(chatsQuery);
  const currentChat = chatData?.find((chat) => chat._id === params.chatId);

  const isDmChat = currentChat?.type === "dm";
  const interlocutors = useMemo(
    () =>
      currentChat &&
      currentChat?.users?.filter((person) => person._id !== user?._id),
    [currentChat, user?._id]
  );

  const { data: interlocutorStatus } = useQuery({
    queryKey: ["interlocutorStatus", interlocutors?.[0]._id],
    queryFn: () => chatApi.getInterlocutorStatus(interlocutors?.[0]._id),
    enabled: !!interlocutors?.[0]._id && isDmChat,
  });

  const updateInterlocutorStatus = useCallback(
    (interlocutorStatus: Status) => {
      if (!user?._id) return;
      setChatsCache((prev) => {
        if (!prev) [];

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
    [params.chatId, setChatsCache, user?._id]
  );

  useEffect(() => {
    if (!interlocutorStatus) return;
    updateInterlocutorStatus(interlocutorStatus);
  }, [interlocutorStatus, updateInterlocutorStatus]);

  const interlocutorsDisplayNames = interlocutors
    ?.map((user) => user?.displayName)
    ?.slice(0, 3)
    ?.join(", ");

  const placeholderChatName = `Group Chat: ${interlocutorsDisplayNames}`;

  const updateChatNameMutation = useMutation({
    mutationFn: () => chatApi.updateChat(params.chatId, { name: chatName }),
    onSuccess: (response) => {
      setChatName(response.name);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      setChatName(currentChat?.name || placeholderChatName);
    },
  });

  const handleInitChatName = useCallback(() => {
    if (chatName === currentChat?.name || chatName === placeholderChatName)
      return;
    if (!isDmChat && !isEditingChatName) {
      setChatName(currentChat?.name || placeholderChatName);
    }
  }, [
    chatName,
    currentChat?.name,
    isDmChat,
    isEditingChatName,
    placeholderChatName,
  ]);

  useEffect(() => {
    if (currentChat?.name || interlocutorsDisplayNames) {
      handleInitChatName();
    }
  }, [currentChat?.name, handleInitChatName, interlocutorsDisplayNames]);

  const handleResetInput = () => {
    setChatName(currentChat?.name || placeholderChatName);
    setIsEditingChatName(false);
  };

  const handleEditChatName = async () => {
    if (chatName && chatName !== currentChat?.name) {
      await updateChatNameMutation.mutateAsync();
    }
    setIsEditingChatName((state) => !state);
  };

  return {
    isDmChat,
    interlocutors,
    interlocutorsDisplayNames,
    currentChat,
    chatName,
    setChatName,
    isEditingChatName,
    setIsEditingChatName,
    handleResetInput,
    handleEditChatName,
  };
}
