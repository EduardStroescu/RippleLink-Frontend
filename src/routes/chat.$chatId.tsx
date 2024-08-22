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
import { TypingIndicator } from "@/components/ui/TypingIndicator";
import { groupAvatar, placeholderAvatar } from "@/lib/const";
import { CreateMessageForm } from "@/components/CreateMessageForm";
import {
  AddUsersIcon,
  CallIcon,
  InfoIcon,
  VideoCallIcon,
} from "@/components/Icons";
import { useMessageEvents } from "@/lib/hooks/useMessageEvents";
import { useUserTyping } from "@/lib/hooks/useUserTyping";
import { useCreateMessage } from "@/lib/hooks/useCreateMessage";
import { useMessageReadStatus } from "@/lib/hooks/useMessageReadStatus";
import { useQuery } from "@tanstack/react-query";
import chatApi from "@/api/modules/chat.api";
import { MessageComponent } from "@/components/MessageComponent";
import { CallComponent } from "@/components/CallComponent";
import { useCallContext } from "@/providers/CallProvider";
import { getParsedPath } from "@/lib/utils";
import { useCallStore } from "@/stores/useCallStore";
import CustomDialogTrigger from "@/components/CustomDialogTrigger";
import { SearchUsersForm } from "@/components/SearchUsersForm";
import { ChatHeaderDetails } from "@/components/ChatHeaderDetails";

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
  const user = useUserStore((state) => state.user);
  const currentCall = useCallStore((state) => state.currentCall);

  const { messagesQuery, chatsQuery, callsQuery } = Route.useLoaderData();
  const { data: messages } = useQuery(messagesQuery);
  const { data: chatData } = useQuery(chatsQuery);
  const { data: callData } = useQuery(callsQuery);

  const { socket } = useSocketContext();
  const scrollToBottomRef = useRef<HTMLDivElement>(null);
  const params = useParams({ from: "/chat/$chatId" });
  const { startCall } = useCallContext();

  const currentChat = chatData?.find((chat) => chat._id === params.chatId);
  const currentCallDetails = callData?.find(
    (call) => call.chatId._id === params.chatId
  );

  const isDmChat = currentChat?.type === "dm";
  const interlocutors = useMemo(
    () =>
      currentChat &&
      currentChat?.users?.filter((person) => person._id !== user?._id),
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
  // useMessageFilters(interlocutor, setIsInterlocutorOnline);
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

  const interlocutorsDisplayNames = interlocutors
    ?.map((user) => user?.displayName)
    .slice(0, 3)
    .join(", ");

  return (
    <div className="grid grid-flow-col grid-cols-8 w-full h-full">
      <div
        className={`${parsedPath === "/chat/$chatId/details" ? "hidden" : "flex col-span-8"} xl:flex relative w-full flex-col col-span-5 overflow-hidden`}
      >
        <div className="flex justify-between p-2 items-center">
          {isDmChat ? (
            <ChatHeaderDetails
              avatarUrl={interlocutors?.[0]?.avatarUrl || placeholderAvatar}
              name={interlocutors?.[0]?.displayName || "User"}
              lastSeen={interlocutors?.[0]?.status?.lastSeen}
              isInterlocutorOnline={isInterlocutorOnline}
            />
          ) : (
            <ChatHeaderDetails
              avatarUrl={currentChat?.avatarUrl || groupAvatar}
              name={
                currentChat?.name || `Group Chat: ${interlocutorsDisplayNames}`
              }
            />
          )}
          <div className="mr-0.5 sm:mr-4 flex gap-2 sm:gap-4">
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
                  existingChatUsersIds={
                    interlocutors && [
                      ...interlocutors.map((person) => person._id),
                    ]
                  }
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
        <div className="w-full flex-1 h-full p-4 text-white overflow-y-auto overflow-x-hidden flex flex-col gap-4">
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
