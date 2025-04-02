import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { chatApi } from "@/api/modules/chat.api";
import { toast } from "@/components/ui/use-toast";
import { getGroupChatNamePlaceholder } from "@/lib/utils";
import { Chat } from "@/types/chat";
import { PublicUser } from "@/types/user";

export function useChatName({
  currentChat,
  interlocutors,
  isDmChat,
}: {
  currentChat: Chat | undefined;
  interlocutors: PublicUser[] | undefined;
  isDmChat: boolean;
}) {
  const chatId = useParams({
    from: "/chat/$chatId",
    select: (params) => params.chatId,
  });
  const [chatName, setChatName] = useState("");
  const [isEditingChatName, setIsEditingChatName] = useState(false);

  const updateChatNameMutation = useMutation({
    mutationFn: () => chatApi.updateChat(chatId, { name: chatName }),
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

  const placeholderChatName = getGroupChatNamePlaceholder(interlocutors);

  const handleResetInput = useCallback(() => {
    setChatName(currentChat?.name || placeholderChatName);
    setIsEditingChatName(false);
  }, [currentChat?.name, placeholderChatName]);

  const handleEditChatName = async () => {
    if (chatName && chatName !== currentChat?.name) {
      await updateChatNameMutation.mutateAsync();
    }
    setIsEditingChatName((state) => !state);
  };

  const handleInitChatName = useCallback(() => {
    if (
      (chatName.length && chatName === currentChat?.name) ||
      chatName === placeholderChatName
    )
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
    if (currentChat?.name || placeholderChatName) {
      handleInitChatName();
    }
  }, [currentChat?.name, handleInitChatName, placeholderChatName]);

  return {
    isEditingChatName,
    chatName,
    setChatName,
    handleResetInput,
    handleEditChatName,
  };
}
