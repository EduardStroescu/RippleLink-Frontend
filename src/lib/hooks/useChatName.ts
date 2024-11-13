import { useCallback, useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import chatApi from "@/api/modules/chat.api";
import { useToast } from "@/components/ui";
import { Chat, PublicUser } from "@/types";
import { getGroupChatNamePlaceholder } from "../utils";

export function useChatName({
  currentChat,
  interlocutors,
  isDmChat,
}: {
  currentChat: Chat | undefined;
  interlocutors: PublicUser[] | undefined;
  isDmChat: boolean;
}) {
  const params = useParams({ from: "/chat/$chatId" });
  const { toast } = useToast();
  const [chatName, setChatName] = useState("");
  const [isEditingChatName, setIsEditingChatName] = useState(false);

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

  const placeholderChatName = getGroupChatNamePlaceholder(interlocutors);

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
