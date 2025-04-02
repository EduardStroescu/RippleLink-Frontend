import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { userApi } from "@/api/modules/user.api";
import { ChatHeaderDetails } from "@/components/chatId/ChatHeaderDetails";
import { CreateMessageForm } from "@/components/forms/CreateMessageForm";
import { groupAvatar } from "@/lib/const";
import { useCreateChat } from "@/lib/hooks/useCreateChat";
import { checkIfChatExists } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";
import { PublicUser } from "@/types/user";

const MAX_DISPLAY_NAMES_FOR_GROUPS = 3;

export const Route = createFileRoute("/chat/create-chat")({
  beforeLoad: async ({ search, context: { queryClient } }) => {
    const user = useUserStore.getState().user;
    const { userIds } = search as typeof search & { userIds: string };
    const chatsData = queryClient.getQueryData<Chat[] | []>([
      "chats",
      user?._id,
    ]);
    const userIdsArr = userIds.split(",");

    // Check for existing chat with selected users and redirect to it if found
    if (chatsData) {
      const existingChat = checkIfChatExists(chatsData, userIdsArr);
      if (existingChat) {
        throw redirect({
          to: `/chat/${existingChat._id}`,
        });
      }
    }

    const usersQuery = {
      queries: userIdsArr.map((userId: PublicUser["_id"]) => ({
        queryKey: ["users", userId],
        queryFn: () => userApi.getUsersById(userId),
        enabled: !!userId && !!userIdsArr.length,
      })),
      combine: (results: UseQueryResult<PublicUser, Error>[]) => {
        return {
          newChatUsers: results.map((result) => result.data),
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
  const { newChatUsers } = useQueries(usersQuery);
  const [isEditingChatName, setIsEditingChatName] = useState(false);

  const newChatUsersDisplayNames = newChatUsers
    ?.map((user: PublicUser | undefined) => user?.displayName)
    .slice(0, MAX_DISPLAY_NAMES_FOR_GROUPS);
  const defaultChatHeaderTitle =
    newChatUsersDisplayNames.every((dName) => typeof dName === "string") &&
    `Group Chat: ${newChatUsersDisplayNames.join(", ")} ${newChatUsers.length > MAX_DISPLAY_NAMES_FOR_GROUPS ? `(+ ${newChatUsers.length - MAX_DISPLAY_NAMES_FOR_GROUPS})` : ""}`.trim();

  const {
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
  } = useCreateChat({ newChatUsers, defaultChatHeaderTitle });

  useEffect(() => {
    if (!isEditingChatName && !chatName.length && defaultChatHeaderTitle) {
      setChatName(defaultChatHeaderTitle);
    }
  }, [chatName, defaultChatHeaderTitle, isEditingChatName, setChatName]);

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
