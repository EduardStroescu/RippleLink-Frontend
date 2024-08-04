import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { useSocketContext } from "@/providers/SocketProvider";
import { useUserStore } from "@/stores/useUserStore";
import { AvatarCoin } from "@/components/AvatarCoin";
import { TypingIndicator } from "@/components/TypingIndicator";
import chatApi from "@/api/modules/chat.api";
import { placeholderAvatar } from "@/lib/const";
import { adaptTimezone } from "@/lib/hepers";
import { Message } from "@/types/message";
import { DeleteButton } from "@/components/DeleteButton";
import { Chat } from "@/types/chat";
import { CreateMessageForm } from "@/components/CreateMessageForm";
import { AddUsersIcon, CheckIcon } from "@/components/Icons";
import { useMessageEvents } from "@/lib/hooks/useMessageEvents";
import { useUserTyping } from "@/lib/hooks/useUserTyping";
import { useMessageFilters } from "@/lib/hooks/useMessageFilters";
import { useCreateMessage } from "@/lib/hooks/useCreateMessage";
import { useMessageReadStatus } from "@/lib/hooks/useMessageReadStatus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MediaPreviewDialog from "@/components/MediaPreviewDialog";

export const Route = createFileRoute("/chat/$chatId")({
  beforeLoad: async ({ params: { chatId } }) => {
    const messagesQuery = {
      queryKey: ["messages", chatId],
      queryFn: () => chatApi.getMessagesByChatId(chatId),
      enabled: !!chatId,
      placeholderData: [],
    };
    return { messagesQuery };
  },
  loader: async ({ context: { messagesQuery } }) => messagesQuery,
  component: ChatId,
});

function ChatId() {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const messagesQuery = Route.useLoaderData();
  const { data: messages } = useQuery(messagesQuery);
  const chatData = queryClient.getQueryData<Chat[] | []>(["chats"]);

  const { socket } = useSocketContext();
  const scrollToBottomRef = useRef<HTMLDivElement>(null);
  const params = useParams({ from: "/chat/$chatId" });

  const currentChat = useMemo(
    () => chatData?.filter((chat) => chat._id === params.chatId)?.[0],
    [chatData, params.chatId]
  );
  const interlocutor = useMemo(
    () =>
      currentChat &&
      currentChat?.users?.filter((person) => person._id !== user?._id)[0],
    [currentChat, user?._id]
  );

  const {
    handleSubmitMessage,
    message,
    imagePreview,
    messageType,
    setMessage,
    setGif,
    setImagePreview,
    setMessageType,
  } = useCreateMessage(params);
  const {
    interlocutorIsTyping,
    isInterlocutorOnline,
    setMessages,
    setIsInterlocutorOnline,
  } = useMessageEvents(params, user, scrollToBottomRef);
  useMessageFilters(interlocutor, setIsInterlocutorOnline);
  useUserTyping(params, message);
  useMessageReadStatus(messages, setMessages, user, params);

  useEffect(() => {
    setTimeout(() => {
      scrollToBottomRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 400);
  }, []);

  const handleDelete = (messageId: string) => {
    if (!socket) return;
    socket.emit("deleteMessage", { room: params.chatId, messageId });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex justify-between p-2 items-center">
        <div className="flex flex-row gap-2 text-white min-h-[56px]  items-center">
          <AvatarCoin
            source={interlocutor?.avatarUrl || placeholderAvatar}
            width={50}
            alt={`${interlocutor?.displayName || currentChat?.name || "User"}'s avatar`}
          />
          <div>
            <p>{interlocutor?.displayName || "User"}</p>
            {interlocutor?.status?.lastSeen && (
              <p className="text-xs">
                {isInterlocutorOnline
                  ? "online"
                  : `Last seen ${interlocutor.status.lastSeen.slice(0, 10)}`}
              </p>
            )}
          </div>
        </div>
        <div className="mr-4">
          {/* TODO: FINISH IMPLEMENTING THIS */}
          <button className="group">
            <AddUsersIcon />
          </button>
        </div>
      </div>
      <div className="w-full flex-1 h-full p-4 text-white overflow-y-auto flex flex-col gap-4">
        {!!messages?.length &&
          messages?.map((message) => {
            const isOwnMessage = message.senderId._id === user?._id;
            return (
              <div
                key={message._id}
                className={`${
                  isOwnMessage ? "self-end" : "self-start"
                } group flex flex-row gap-2 items-center`}
              >
                <div
                  className={`${
                    isOwnMessage ? "bg-green-600/60" : "bg-black/60"
                  } relative flex flex-row py-2 px-4 max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-xl overflow-hidden`}
                >
                  <div className="flex flex-col w-full">
                    {displayMessageByType(message)}
                    <div className="flex gap-1 items-center self-end">
                      <p className="text-xs">
                        {adaptTimezone(message.createdAt, "ro-RO")}
                      </p>
                      {message.read && isOwnMessage && <CheckIcon />}
                    </div>
                  </div>
                  {isOwnMessage && (
                    <div className="w-[50px] h-[40px] absolute justify-end py-2 px-2.5 -right-1 -top-1 hidden group-hover:flex bg-message-gradient pointer-events-none">
                      <DeleteButton
                        className="group h-fit pointer-events-auto"
                        onClick={() => handleDelete(message._id)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        <TypingIndicator
          ref={scrollToBottomRef}
          interlocutorIsTyping={interlocutorIsTyping}
        />
      </div>

      <CreateMessageForm
        handleSubmitMessage={handleSubmitMessage}
        message={message}
        imagePreview={imagePreview}
        messageType={messageType}
        setMessage={setMessage}
        setGif={setGif}
        setImagePreview={setImagePreview}
        setMessageType={setMessageType}
      />
    </div>
  );
}

const displayMessageByType = (message: Message) => {
  switch (message.type) {
    case "text":
      return <p className="break-words whitespace-normal">{message.content}</p>;
    case "image":
      return (
        <MediaPreviewDialog
          content={<FullScreenImage message={message} />}
          className="group w-full"
        >
          <img
            src={message.content}
            alt="User Uploaded Image"
            width={300}
            className="rounded-xl aspect-auto object-cover p-2 cursor-pointer"
          />
        </MediaPreviewDialog>
      );
    case "file":
      return <p className="break-words whitespace-normal">{message.content}</p>;
    case "video":
      return <video src={message.content} controls />;
    case "audio":
      return <audio src={message.content} controls />;
    default:
      return <p className="break-words whitespace-normal">{message.content}</p>;
  }
};

function FullScreenImage({ message }: { message: Message }) {
  return (
    <img
      className="w-full h-full aspect-square object-cover rounded-md"
      src={message.content}
      alt={`Image sent by ${message.senderId.displayName}`}
    />
  );
}
