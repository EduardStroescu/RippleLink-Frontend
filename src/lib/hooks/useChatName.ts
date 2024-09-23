import { useCallback, useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import chatApi from "@/api/modules/chat.api";
import { useToast } from "@/components/ui";
import { Chat, User } from "@/types";

export function useChatName({
  currentChat,
  interlocutors,
  isDmChat,
}: {
  currentChat: Chat | undefined;
  interlocutors: User[] | undefined;
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

  const interlocutorsDisplayNames = interlocutors
    ?.map((user) => user?.displayName)
    ?.slice(0, 3)
    ?.join(", ");

  const placeholderChatName = `Group Chat: ${interlocutorsDisplayNames}`;

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
    if (currentChat?.name || interlocutorsDisplayNames) {
      handleInitChatName();
    }
  }, [currentChat?.name, handleInitChatName, interlocutorsDisplayNames]);

  return {
    isEditingChatName,
    chatName,
    setChatName,
    handleResetInput,
    handleEditChatName,
  };
}
