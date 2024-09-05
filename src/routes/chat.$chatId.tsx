import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useParams,
} from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
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
import React from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useHandleIsAtBottom } from "@/lib/hooks/useIsAtBottom";
import { Virtualizer } from "@/components/Virtualizer";

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

  const scrollParentRef = useRef<HTMLDivElement | null>(null);
  const count = useMemo(() => (messages ? messages.length + 1 : 0), [messages]);
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollParentRef?.current,
    estimateSize: () => 416,
    overscan: 10,
    getItemKey: (index) => messages?.[index]?._id || index,
  });

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
  const { interlocutorIsTyping, isInterlocutorOnline } = useMessageEvents(
    params,
    user
  );
  useUserTyping(params, message);
  useMessageReadStatus(messages, user, params);

  // Scroll User to bottom on mount
  const scrolledToBottomOnMount = useRef(false);
  useEffect(() => {
    if (!scrolledToBottomOnMount.current) {
      const timer = setTimeout(() => {
        virtualizer?.scrollToIndex(count - 1);
        scrolledToBottomOnMount.current = true;
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [count, params.chatId, virtualizer]);

  // Reset scrolledToBottomOnMount when chatId changes
  useEffect(() => {
    scrolledToBottomOnMount.current = false;
  }, [params.chatId]);

  // Keep user scrolled to bottom when contentPreview is added
  useEffect(() => {
    setTimeout(() => {
      if (contentPreview) {
        virtualizer?.scrollToIndex(count - 1);
      }
    }, 400);
  }, [contentPreview, count, virtualizer]);

  // Keep user scrolled to bottom when new messages are added
  const { isAtBottom } = useHandleIsAtBottom({
    scrollParent: scrollParentRef.current,
  });
  useEffect(() => {
    if (virtualizer.isScrolling) return;
    const timer = setTimeout(() => {
      if (isAtBottom) {
        virtualizer?.scrollToIndex(count - 1);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [count, isAtBottom, virtualizer, virtualizer.isScrolling]);

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

  const getMessageContent = useCallback(
    (virtualIndex: number) => messages?.[virtualIndex],
    [messages]
  );

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
                  existingChatUsers={
                    interlocutors && [
                      ...interlocutors.map((person) => ({
                        _id: person._id,
                        displayName: person.displayName,
                      })),
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

        <Virtualizer virtualizer={virtualizer} ref={scrollParentRef}>
          {({ virtualItem, ref }) => (
            <React.Fragment key={virtualItem.key}>
              {virtualItem.index < count - 1 ? (
                <MessageComponent
                  ref={ref}
                  virtualItem={virtualItem}
                  message={getMessageContent(virtualItem.index)}
                  handleDelete={handleDelete}
                  idx={virtualItem.index}
                />
              ) : (
                <TypingIndicator
                  ref={ref}
                  virtualItem={virtualItem}
                  interlocutorIsTyping={interlocutorIsTyping}
                />
              )}
            </React.Fragment>
          )}
        </Virtualizer>

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
