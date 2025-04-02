import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { FormEvent, useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { chatApi } from "@/api/modules/chat.api";
import { toast } from "@/components/ui/use-toast";
import { ContentPreviewState } from "@/lib/hooks/useCreateMessage";
import { chunkFilesAndUpload } from "@/lib/utils";
import { Message } from "@/types/message";
import { PublicUser } from "@/types/user";

export const useCreateChat = ({
  newChatUsers,
  defaultChatHeaderTitle,
}: {
  newChatUsers: (PublicUser | undefined)[];
  defaultChatHeaderTitle: string | false;
}) => {
  const [message, setMessage] = useState<string>("");
  const [gif, setGif] = useState<string | null>(null);
  const [contentPreview, setContentPreview] =
    useState<ContentPreviewState>(null);
  const [chatName, setChatName] = useState("");
  const [messageType, setMessageType] = useState<Message["type"]>("text");

  const createChatMutation = useMutation({
    mutationFn: async (values: Parameters<typeof chatApi.createChat>[0]) =>
      await chatApi.createChat(values),
  });
  const router = useRouter();

  const handleSubmitMessage = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!newChatUsers.every((user) => !!user)) return;

      const values: Parameters<typeof chatApi.createChat>[0] = {
        userIds: newChatUsers.map((user) => user._id),
        lastMessage: { content: message, type: messageType },
        type: newChatUsers.length > 1 ? "group" : "dm",
        name: chatName,
      };

      chatName === defaultChatHeaderTitle && delete values.name;

      if (gif) {
        values.lastMessage.content = gif;
      } else if (contentPreview?.length && messageType !== "text") {
        values.lastMessage.content = contentPreview.map((content) => ({
          content: "placeholder",
          type: content.type,
          fileId: uuidv4(),
        }));
      } else {
        if (message.length === 0) return;

        values.lastMessage.content = message;
      }

      await createChatMutation.mutateAsync(values, {
        onSuccess: (response) => {
          if (response.lastMessage.type === "file" && contentPreview) {
            chunkFilesAndUpload(response.lastMessage, contentPreview);
          }
          router.history.push(`/chat/${response._id}`);
        },
        onError: (error: unknown) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error as string,
          });
        },
      });
    },
    [
      chatName,
      contentPreview,
      createChatMutation,
      defaultChatHeaderTitle,
      gif,
      message,
      messageType,
      newChatUsers,
      router.history,
    ]
  );

  return {
    handleSubmitMessage,
    message,
    setMessage,
    contentPreview,
    setContentPreview,
    messageType,
    setMessageType,
    chatName,
    setChatName,
    setGif,
  };
};
