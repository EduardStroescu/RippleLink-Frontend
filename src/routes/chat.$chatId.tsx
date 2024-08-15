import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useParams,
} from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { useSocketContext } from "@/providers/SocketProvider";
import { useUserStore } from "@/stores/useUserStore";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { TypingIndicator } from "@/components/ui/TypingIndicator";
import { placeholderAvatar } from "@/lib/const";
import { Chat } from "@/types/chat";
import { CreateMessageForm } from "@/components/CreateMessageForm";
import {
  AddUsersIcon,
  BackIcon,
  CallIcon,
  InfoIcon,
  VideoCallIcon,
} from "@/components/Icons";
import { useMessageEvents } from "@/lib/hooks/useMessageEvents";
import { useUserTyping } from "@/lib/hooks/useUserTyping";
import { useMessageFilters } from "@/lib/hooks/useMessageFilters";
import { useCreateMessage } from "@/lib/hooks/useCreateMessage";
import { useMessageReadStatus } from "@/lib/hooks/useMessageReadStatus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import chatApi from "@/api/modules/chat.api";
import { MessageComponent } from "@/components/MessageComponent";
import { CallComponent } from "@/components/CallComponent";
import { useCallContext } from "@/providers/CallProvider";
import { getParsedPath } from "@/lib/utils";
import { Call } from "@/types/call";
import { useCallStore } from "@/stores/useCallStore";
import CustomDialogTrigger from "@/components/CustomDialogTrigger";
import { SearchUsersForm } from "@/components/SearchUsersForm";

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
  loader: async ({ context: { messagesQuery, chatsQuery, callsQuery } }) => ({
    messagesQuery,
    chatsQuery,
    callsQuery,
  }),
  component: ChatId,
});

function ChatId() {
  const location = useLocation();
  const parsedPath = getParsedPath(location.pathname);
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const currentCall = useCallStore((state) => state.currentCall);

  const { messagesQuery, chatsQuery, callsQuery } = Route.useLoaderData();
  const { data: messages } = useQuery(messagesQuery);
  useQuery(chatsQuery);
  useQuery(callsQuery);
  const chatData = queryClient.getQueryData<Chat[] | []>(["chats"]);
  const callData = queryClient.getQueryData<Call[] | []>(["calls"]);

  const { socket } = useSocketContext();
  const scrollToBottomRef = useRef<HTMLDivElement>(null);
  const params = useParams({ from: "/chat/$chatId" });
  const { startCall } = useCallContext();

  const currentChat = chatData?.find((chat) => chat._id === params.chatId);
  const currentCallDetails = callData?.find(
    (call) => call.chatId._id === params.chatId
  );
  const interlocutor = useMemo(
    () =>
      currentChat &&
      currentChat?.users?.find((person) => person._id !== user?._id),
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
  }, [params?.chatId]);

  useEffect(() => {
    setTimeout(() => {
      if (contentPreview && scrollToBottomRef.current) {
        scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 1000);
  }, [contentPreview]);

  const handleDelete = (messageId: string) => {
    if (!socket) return;
    socket.emit("deleteMessage", { room: params.chatId, messageId });
  };

  const handleStartCall = (videoEnabled?: boolean) => {
    if (!currentChat) return;
    startCall(currentChat, videoEnabled);
  };

  return (
    <div className="flex w-full h-full">
      <div
        className={`${parsedPath === "/chat/$chatId/details" ? "hidden" : "flex"} xl:flex  relative flex-1 flex-col overflow-hidden`}
      >
        <div className="flex justify-between p-2 items-center">
          <div className="flex flex-row gap-2 text-white min-h-[56px] items-center">
            <Link
              to="/chat"
              preload={false}
              className="group flex sm:hidden gap-1 items-center"
            >
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
          <div className="mr-4 flex gap-4">
            {!currentCall && (
              <>
                <button onClick={() => handleStartCall()} className="group">
                  <CallIcon />
                </button>
                <button onClick={() => handleStartCall(true)} className="group">
                  <VideoCallIcon />
                </button>
              </>
            )}
            <CustomDialogTrigger
              header="Create Group Chat"
              content={
                <SearchUsersForm
                  existingChatUsersIds={interlocutor && [interlocutor._id]}
                />
              }
              className="group"
            >
              <AddUsersIcon />
            </CustomDialogTrigger>
            <Link
              to="/chat/$chatId/details"
              preload={false}
              params={{ chatId: params.chatId }}
              className="group"
            >
              <InfoIcon />
            </Link>
          </div>
        </div>
        {(currentCall || currentCallDetails) && (
          <CallComponent currentCallDetails={currentCallDetails} />
        )}
        <div className="w-full flex-1 h-full p-4 text-white overflow-y-auto flex flex-col gap-4">
          {!!messages?.length &&
            messages?.map((message, idx) => {
              const isOwnMessage = message.senderId._id === user?._id;
              return (
                <MessageComponent
                  key={message._id}
                  isOwnMessage={isOwnMessage}
                  message={message}
                  handleDelete={handleDelete}
                  idx={idx}
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
      {parsedPath === "/chat/$chatId/details" && <Outlet />}
    </div>
  );
}
