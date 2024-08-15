import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { groupAvatar, placeholderAvatar } from "@/lib/const";
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import chatApi from "@/api/modules/chat.api";
import userApi from "@/api/modules/user.api";
import { CreateMessageForm } from "@/components/CreateMessageForm";
import { Chat } from "@/types/chat";
import { Message } from "@/types/message";
import { BackIcon } from "@/components/Icons";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types/user";
import { checkIfChatExists } from "@/lib/utils";

export const Route = createFileRoute("/chat/create-chat")({
  beforeLoad: async ({ search: { userIds }, context: { queryClient } }) => {
    const chatsData: Chat[] | [] = queryClient.getQueryData(["chats"]);
    const userIdsArr = userIds.split(",");

    const existingChat = checkIfChatExists(chatsData, userIdsArr);
    if (existingChat) {
      throw redirect({
        to: `/chat/${existingChat._id}`,
      });
    }

    const usersQuery = {
      queries: userIdsArr.map((userId: User["_id"]) => ({
        queryKey: ["users", userId],
        queryFn: () => userApi.getUsersById(userId),
        enabled: !!userId,
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

    !chatName && delete values.name;

    if (gif) {
      values.lastMessage = gif;
      values.messageType = "image";
    } else {
      if (message.length === 0) return;
    }

    await createChatMutation.mutateAsync(values, {
      onSuccess: (response) => {
        router.history.push(`/chat/${response._id}`);
        queryClient.removeQueries({ queryKey: ["chats"] });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  const newChatUsersDisplayNames = newChatUsers
    ?.map((user: User) => user?.displayName)
    .slice(0, 3);
  const defaultChatHeaderTitle = `Group Chat: ${newChatUsersDisplayNames.join(", ")} ${newChatUsers.length > 3 ? `(+ ${newChatUsers.length - 3})` : ""}`;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {newChatUsers?.length > 1 ? (
        <CreateNewChatHeader
          avatar={groupAvatar}
          displayName={defaultChatHeaderTitle}
        />
      ) : (
        <CreateNewChatHeader
          avatar={newChatUsers[0]?.avatarUrl}
          displayName={newChatUsers[0]?.displayName}
          onlineStatus={newChatUsers[0]?.status?.online}
        />
      )}
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

interface CreateNewChatHeaderProps {
  avatar?: string;
  displayName: string;
  onlineStatus?: string;
}

function CreateNewChatHeader({
  avatar,
  displayName,
  onlineStatus,
}: CreateNewChatHeaderProps) {
  return (
    <div className="flex flex-row gap-2 text-white min-h-[56px] p-2 items-center">
      <Link
        to="/chat"
        preload={false}
        className="group flex sm:hidden gap-1 items-center"
      >
        <BackIcon /> <span className="text-xs">Back</span>
      </Link>
      <AvatarCoin
        source={avatar || placeholderAvatar}
        width={50}
        alt={`${displayName}'s avatar`}
      />
      <div className="overflow-hidden">
        <p className="w-full truncate">{displayName}</p>
        {onlineStatus && (
          <p className="text-xs">{onlineStatus ? "online" : "offline"}</p>
        )}
      </div>
    </div>
  );
}
