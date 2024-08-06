import {
  createFileRoute,
  Link,
  Outlet,
  useParams,
} from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { useSocketContext } from "@/providers/SocketProvider";
import { useUserStore } from "@/stores/useUserStore";
import { AvatarCoin } from "@/components/AvatarCoin";
import { TypingIndicator } from "@/components/TypingIndicator";
import { placeholderAvatar } from "@/lib/const";
import { Chat } from "@/types/chat";
import { CreateMessageForm } from "@/components/CreateMessageForm";
import { AddUsersIcon, BackIcon, CallIcon } from "@/components/Icons";
import { useMessageEvents } from "@/lib/hooks/useMessageEvents";
import { useUserTyping } from "@/lib/hooks/useUserTyping";
import { useMessageFilters } from "@/lib/hooks/useMessageFilters";
import { useCreateMessage } from "@/lib/hooks/useCreateMessage";
import { useMessageReadStatus } from "@/lib/hooks/useMessageReadStatus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import chatApi from "@/api/modules/chat.api";
import { useAppStore } from "@/stores/useAppStore";
import { MessageComponent } from "@/components/MessageComponent";

export const Route = createFileRoute("/chat/$chatId")({
  beforeLoad: async ({ params: { chatId } }) => {
    const setIsDrawerOpen = useAppStore.getState().actions.setIsDrawerOpen;
    setIsDrawerOpen(false);
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
    contentPreview,
    messageType,
    setMessage,
    setGif,
    setContentPreview,
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

  useEffect(() => {
    setTimeout(() => {
      if (contentPreview && scrollToBottomRef.current) {
        console.log("executing");
        scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 1000);
  }, [contentPreview]);

  const handleDelete = (messageId: string) => {
    if (!socket) return;
    socket.emit("deleteMessage", { room: params.chatId, messageId });
  };

  return (
    <div className="flex w-full h-full">
      <div className="relative flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between p-2 items-center">
          <div className="flex flex-row gap-2 text-white min-h-[56px]  items-center">
            <Link to="/chat?" className="flex sm:hidden gap-1 items-center">
              <BackIcon /> <span className="text-xs">Back</span>
            </Link>
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
          {/* TODO: FINISH IMPLEMENTING THIS */}
          <div className="mr-4 flex gap-6">
            <button className="group">
              <CallIcon />
            </button>
            <button className="group">
              <AddUsersIcon />
            </button>
            <Link to="/chat/$chatId/details" params={{ chatId: params.chatId }}>
              info
            </Link>
          </div>
        </div>
        <div className="w-full flex-1 h-full p-4 text-white overflow-y-auto flex flex-col gap-4">
          {!!messages?.length &&
            messages?.map((message) => {
              const isOwnMessage = message.senderId._id === user?._id;
              return (
                <MessageComponent
                  key={message._id}
                  isOwnMessage={isOwnMessage}
                  message={message}
                  handleDelete={handleDelete}
                />
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
          contentPreview={contentPreview}
          messageType={messageType}
          setMessage={setMessage}
          setGif={setGif}
          setContentPreview={setContentPreview}
          setMessageType={setMessageType}
        />
      </div>
      <Outlet />
    </div>
  );
}
