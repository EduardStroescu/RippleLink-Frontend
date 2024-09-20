import { FormEvent, useEffect, useState } from "react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import chatApi from "@/api/modules/chat.api";
import userApi from "@/api/modules/user.api";
import { checkIfChatExists } from "@/lib/utils";
import { groupAvatar } from "@/lib/const";
import { Chat, Message, User } from "@/types";

import { useToast } from "@/components/ui";
import { CreateMessageForm, ChatHeaderDetails } from "@/components";

export const Route = createFileRoute("/chat/create-chat")({
  beforeLoad: async ({ search, context: { queryClient } }) => {
    const { userIds } = search as typeof search & { userIds: string };
    const chatsData = queryClient.getQueryData<Chat[] | []>(["chats"]);
    const userIdsArr = userIds.split(",");

    if (chatsData) {
      const existingChat = checkIfChatExists(chatsData, userIdsArr);
      if (existingChat) {
        throw redirect({
          to: `/chat/${existingChat._id}`,
        });
      }
    }

    const usersQuery = {
      queries: userIdsArr.map((userId: User["_id"]) => ({
        queryKey: ["users", userId],
        queryFn: () => userApi.getUsersById(userId),
        enabled: !!userId && !!userIdsArr.length,
      })),
      combine: (results) => {
        return {
          data: results.map((result) => result.data),
        };
      },
    };
    return { usersQuery };
  },
  loader: async ({ context: { usersQuery } }) => {
    return usersQuery;
  },
  component: CreateNewChat,
});

function CreateNewChat() {
  const usersQuery = Route.useLoaderData();
  const { data: newChatUsers } = useQueries(usersQuery);
  const queryClient = useQueryClient();

  const [message, setMessage] = useState<Message["content"]>("");
  const [gif, setGif] = useState<string | null>(null);
  const [contentPreview, setContentPreview] = useState<{
    content: string | null;
    name: string | null;
  } | null>(null);
  const [isEditingChatName, setIsEditingChatName] = useState(false);
  const [chatName, setChatName] = useState("");
  const [messageType, setMessageType] = useState<Message["type"]>("text");
  const { toast } = useToast();

  const createChatMutation = useMutation({
    mutationFn: async (values: {
      userIds: string[];
      lastMessage: string;
      type?: string;
      name?: string;
      messageType?: string;
    }) => await chatApi.createChat(values),
  });
  const router = useRouter();

  const handleSubmitMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values: {
      userIds: string[];
      lastMessage: string;
      type?: string;
      name?: string;
      messageType?: string;
    } = {
      userIds: newChatUsers.map((user: User) => user._id),
      lastMessage: message,
      type: newChatUsers.length > 1 ? "group" : "dm",
      name: chatName,
      messageType: messageType,
    };

    chatName === defaultChatHeaderTitle && delete values.name;

    if (gif) {
      values.lastMessage = gif;
      values.messageType = "text";
      setGif(null);
    } else if (contentPreview?.content && messageType !== "text") {
      values.lastMessage = contentPreview.content;
      values.messageType = messageType;
    } else {
      if (message.length === 0) return;

      values.lastMessage = message;
    }

    await createChatMutation.mutateAsync(values, {
      onSuccess: (response) => {
        router.history.push(`/chat/${response._id}`);
        queryClient.removeQueries({ queryKey: ["chats"] });
      },
      onError: (error: unknown) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error as string,
        });
      },
    });
  };

  const newChatUsersDisplayNames = newChatUsers
    ?.map((user: User) => user?.displayName)
    .slice(0, 3);
  const defaultChatHeaderTitle =
    newChatUsersDisplayNames.every((dName) => typeof dName === "string") &&
    `Group Chat: ${newChatUsersDisplayNames.join(", ")} ${newChatUsers.length > 3 ? `(+ ${newChatUsers.length - 3})` : ""}`.trim();

  useEffect(() => {
    if (!isEditingChatName && !chatName.length && defaultChatHeaderTitle) {
      setChatName(defaultChatHeaderTitle);
    }
  }, [chatName, defaultChatHeaderTitle, isEditingChatName]);

  const handleResetInput = () => {
    if (defaultChatHeaderTitle) {
      setChatName(defaultChatHeaderTitle);
      setIsEditingChatName(false);
    }
  };

  const handleEditChatName = () => {
    setIsEditingChatName((state) => !state);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="p-2">
        {newChatUsers?.length > 1 ? (
          <ChatHeaderDetails
            avatarUrl={groupAvatar}
            name={chatName}
            handleEditChatName={handleEditChatName}
            isEditingChatName={isEditingChatName}
            setChatName={setChatName}
            handleResetInput={handleResetInput}
          />
        ) : (
          <ChatHeaderDetails
            avatarUrl={newChatUsers[0]?.avatarUrl}
            name={newChatUsers[0]?.displayName}
            lastSeen={newChatUsers[0]?.status?.lastSeen}
            isInterlocutorOnline={newChatUsers[0]?.status?.online}
          />
        )}
      </div>
      <div className="w-full flex-1 h-full p-4 text-white overflow-y-auto flex flex-col gap-4" />

      <CreateMessageForm
        handleSubmitMessage={handleSubmitMessage}
        message={message}
        contentPreview={contentPreview}
        messageType={messageType}
        setMessage={setMessage}
        setGif={setGif}
        setMessageType={setMessageType}
        setContentPreview={setContentPreview}
      />
    </div>
  );
}
