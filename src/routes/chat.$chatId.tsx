import React, { useMemo } from "react";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useParams,
} from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import chatApi from "@/api/modules/chat.api";
import { getParsedPath } from "@/lib/utils";
import { groupAvatar, placeholderAvatar } from "@/lib/const";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import { TypingIndicator } from "@/components/ui/TypingIndicator";
import {
  AddUsersIcon,
  CallIcon,
  InfoIcon,
  VideoCallIcon,
  CreateMessageForm,
  MessageComponent,
  CallComponent,
  CustomDialogTrigger,
  SearchUsersForm,
  ChatHeaderDetails,
  Virtualizer,
  MessagesLoadingIndicator,
} from "@/components";

import {
  useMessageReadStatus,
  useCreateMessage,
  useMessageEvents,
  useVirtualizer,
  useCurrentChatDetails,
  useIsInterlocutorTyping,
  useIsInterlocutorOnline,
} from "@/lib/hooks";
import { useChatName } from "@/lib/hooks/useChatName";
import { User, Message, Chat, Call } from "@/types";
import { useAppStore } from "@/stores/useAppStore";

export const Route = createFileRoute("/chat/$chatId")({
  beforeLoad: async ({ params: { chatId } }) => {
    const messagesQuery = {
      queryKey: ["messages", chatId],
      queryFn: ({ pageParam }) =>
        chatApi.getMessagesByChatId(chatId, pageParam),
      initialPageParam: null,
      getNextPageParam: (lastPage) => lastPage.nextCursor || null,
      enabled: !!chatId,
      select: (data): { messages: Message[]; pageParams: string[] } => {
        // Reverse pages and combine messages
        const reversedPages = [...data.pages].reverse();
        const combinedMessages = reversedPages.flatMap((page) => page.messages);
        return {
          messages: combinedMessages.reverse(),
          pageParams: [...data.pageParams].reverse(),
        };
      },
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
  const params = useParams({ from: "/chat/$chatId" });
  const parsedPath = getParsedPath(location.pathname);
  const currentCall = useCallStore((state) => state.currentCall);

  const { chatsQuery, callsQuery } = Route.useLoaderData();
  const { isDmChat, interlocutors, currentChat } = useCurrentChatDetails({
    chatsQuery,
  });
  const { data: callData } = useQuery(callsQuery);
  const currentCallDetails = callData?.find(
    (call) => call.chatId._id === params.chatId
  );

  return (
    <div className="grid grid-flow-col grid-cols-8 w-full h-full">
      <div
        className={`${parsedPath === "/chat/$chatId/details" ? "hidden" : "flex col-span-8"} xl:flex relative w-full flex-col col-span-5 overflow-hidden`}
      >
        <ChatHeader
          isDmChat={isDmChat}
          interlocutors={interlocutors}
          currentChat={currentChat}
          currentCall={currentCall}
        />
        {(currentCall?.chatId._id === params.chatId || currentCallDetails) && (
          <CallComponent currentCallDetails={currentCallDetails} />
        )}
        <ChatContent interlocutors={interlocutors} />
        <CreateMessage />
      </div>
      {parsedPath === "/chat/$chatId/details" && <Outlet />}
    </div>
  );
}

const ChatHeader = ({
  isDmChat,
  interlocutors,
  currentChat,
  currentCall,
}: {
  isDmChat: boolean;
  interlocutors: User[] | undefined;
  currentChat: Chat | undefined;
  currentCall: Call | null;
}) => {
  const params = useParams({ from: "/chat/$chatId" });
  const { startCall } = useCallStoreActions();

  const {
    isEditingChatName,
    chatName,
    setChatName,
    handleResetInput,
    handleEditChatName,
  } = useChatName({ currentChat, isDmChat, interlocutors });
  const { isInterlocutorOnline } = useIsInterlocutorOnline({
    interlocutors,
    params,
  });

  const handleStartCall = (videoEnabled?: boolean) => {
    if (!currentChat) return;
    startCall(currentChat, videoEnabled);
  };

  return (
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
          name={chatName}
          handleEditChatName={handleEditChatName}
          isEditingChatName={isEditingChatName}
          setChatName={setChatName}
          handleResetInput={handleResetInput}
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
  );
};

const ChatContent = ({
  interlocutors,
}: {
  interlocutors: User[] | undefined;
}) => {
  const { messagesQuery } = Route.useLoaderData();
  const socket = useAppStore((state) => state.socket);
  const params = useParams({ from: "/chat/$chatId" });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(messagesQuery);
  const messages = useMemo(() => data?.messages || [], [data?.messages]);

  useMessageEvents();
  const { scrollParentRef, virtualizer, getMessageContent } = useVirtualizer({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    messages,
  });
  const { interlocutorIsTyping } = useIsInterlocutorTyping({
    interlocutors,
    params,
  });
  useMessageReadStatus(messages);

  const handleDelete = (messageId?: string) => {
    if (!socket || !messageId) return;
    socket.emit("deleteMessage", { room: params.chatId, messageId });
  };

  return (
    <>
      <Virtualizer virtualizer={virtualizer} ref={scrollParentRef}>
        {({ virtualItem }) => (
          <React.Fragment key={virtualItem.key}>
            {virtualItem.index !== 0 ? (
              <MessageComponent
                virtualizer={virtualizer}
                virtualItem={virtualItem}
                message={getMessageContent(virtualItem.index)}
                handleDelete={handleDelete}
                idx={virtualItem.index}
                canDeleteMessage={virtualItem.index !== messages.length}
              />
            ) : (
              <TypingIndicator
                virtualItem={virtualItem}
                interlocutorIsTyping={interlocutorIsTyping}
              />
            )}
          </React.Fragment>
        )}
      </Virtualizer>
      <MessagesLoadingIndicator shouldDisplay={isFetchingNextPage} />
    </>
  );
};

const CreateMessage = () => {
  const {
    handleSubmitMessage,
    message,
    contentPreview,
    messageType,
    setMessage,
    setGif,
    setContentPreview,
    setMessageType,
  } = useCreateMessage();

  return (
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
  );
};
