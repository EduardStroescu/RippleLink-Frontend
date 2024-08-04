import { AvatarCoin } from "@/components/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import chatApi from "@/api/modules/chat.api";
import userApi from "@/api/modules/user.api";
import { CreateMessageForm } from "@/components/CreateMessageForm";
import { Chat } from "@/types/chat";
import { Message } from "@/types/message";
import { useUserStore } from "@/stores/useUserStore";

export const Route = createFileRoute("/chat/create-chat")({
  beforeLoad: async ({ search: { userId }, context: { queryClient } }) => {
    const chatsData: Chat[] | [] = queryClient.getQueryData(["chats"]);
    const currentUser = useUserStore.getState().user;

    const existingChat = chatsData?.find((chat) =>
      chat.users.some(
        (user) => user?._id === userId && user?._id !== currentUser?._id
      )
    );

    if (existingChat) {
      throw redirect({
        to: `/chat/${existingChat._id}`,
      });
    }
    const usersQuery = {
      queryKey: ["users", userId],
      queryFn: () => userApi.getUsersById(userId),
      enabled: !!userId,
    };
    return { usersQuery };
  },
  loader: async ({ context: { queryClient, usersQuery } }) => {
    return await queryClient.ensureQueryData(usersQuery);
  },
  component: CreateNewChat,
});

function CreateNewChat() {
  const data = Route.useLoaderData();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState<Message["content"]>("");
  const [gif, setGif] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [chatType, setChatType] = useState<Chat["type"] | "">("");
  const [chatName, setChatName] = useState("");
  const [messageType, setMessageType] = useState<Message["type"]>("text");

  const createChatMutation = useMutation({
    mutationFn: async (values: {
      userId: string;
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
      userId: string;
      lastMessage: string;
      type?: string;
      name?: string;
      messageType?: string;
    } = {
      userId: data?._id,
      lastMessage: message,
      type: chatType,
      name: chatName,
      messageType: messageType,
    };

    !chatType && delete values.type;
    !chatName && delete values.name;

    if (gif) {
      values.lastMessage = gif;
      values.messageType = "image";
    } else {
      if (message.length === 0) return;
      const imgUrlPattern =
        /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|tiff|svg)(?:\?.*)?$/i;

      values.messageType = imgUrlPattern.test(message) ? "image" : "text";
    }

    await createChatMutation.mutateAsync(values, {
      onSuccess: (response) => {
        router.history.push(`/chat/${response._id}`);
        queryClient.removeQueries({ queryKey: ["chats"] });
      },
      onError: () => {
        console.log("error");
      },
    });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex flex-row gap-2 text-white min-h-[56px] p-2 items-center">
        <AvatarCoin
          source={data?.avatarUrl || placeholderAvatar}
          width={50}
          alt={`${data?.displayName}'s avatar`}
        />
        <div>
          <p>{data?.displayName}</p>
          <p className="text-xs">
            {data?.status?.online ? "online" : "offline"}
          </p>
        </div>
      </div>
      <div className="w-full flex-1 h-full p-4 text-white overflow-y-auto flex flex-col gap-4" />

      <CreateMessageForm
        handleSubmitMessage={handleSubmitMessage}
        message={message}
        imagePreview={imagePreview}
        messageType={messageType}
        setMessage={setMessage}
        setGif={setGif}
        setMessageType={setMessageType}
        setImagePreview={setImagePreview}
      />
    </div>
  );
}
