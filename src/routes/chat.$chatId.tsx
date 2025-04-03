import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { useMemo } from "react";

import { chatApi } from "@/api/modules/chat.api";
import { CallComponent } from "@/components/call/CallComponent";
import { ChatContent } from "@/components/chatId/ChatContentSection";
import { ChatHeaderSection } from "@/components/chatId/ChatHeaderSection";
import { CreateMessageSection } from "@/components/chatId/CreateMessageSection";
import { useCurrentChatDetails } from "@/lib/hooks/useCurrentChatDetails";
import { getParsedPath } from "@/lib/utils";
import { useCallStore } from "@/stores/useCallStore";
import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";
import { Message } from "@/types/message";

export const Route = createFileRoute("/chat/$chatId")({
  beforeLoad: ({ params: { chatId }, context: { queryClient } }) => {
    // Stop the user from accessing the chat if they are not part of it
    const user = useUserStore.getState().user;
    const chats = queryClient.getQueryData<Chat[] | []>(["chats", user?._id]);
    const isCurrUserPartOfTheChat = chats?.find(
      (chat) =>
        chat._id === chatId && chat.users.some((u) => u._id === user?._id)
    );

    if (!isCurrUserPartOfTheChat) {
      throw redirect({
        to: "/chat",
      });
    }

    const messagesQuery = {
      queryKey: ["messages", chatId],
      queryFn: ({ pageParam }) =>
        chatApi.getMessagesByChatId(chatId, pageParam),
      initialPageParam: null,
      getNextPageParam: (lastPage: {
        messages: Message[] | [];
        nextCursor: string | null;
      }) => lastPage.nextCursor ?? null,
      enabled: !!chatId,
      placeholderData: { pages: [], pageParams: [] },
      select: (data: {
        pages: { messages: Message[] | []; nextCursor: string | null }[];
        pageParams: (string | null)[];
      }) => {
        // Reverse pages and combine messages
        const combinedMessages = data.pages.flatMap((page) =>
          [...page.messages].reverse()
        );

        return {
          messages: combinedMessages,
          pageParams: data.pageParams,
        };
      },
    };
    return { messagesQuery };
  },
  loader: ({ context: { messagesQuery, chatsQuery, callsQuery } }) => ({
    messagesQuery,
    chatsQuery,
    callsQuery,
  }),
  component: ChatId,
});

function ChatId() {
  const location = useLocation();
  const { chatId } = Route.useParams();
  const parsedPath = getParsedPath(location.pathname);
  const currentCall = useCallStore((state) => state.currentCall);

  const { chatsQuery, callsQuery } = Route.useLoaderData();
  const { isDmChat, interlocutors, currentChat } = useCurrentChatDetails({
    chatsQuery,
  });
  const { data: callData } = useQuery(callsQuery);
  const currentCallDetails = useMemo(
    () => callData?.find((call) => call.chatId._id === chatId),
    [callData, chatId]
  );

  return (
    <div className="grid grid-flow-col grid-cols-8 w-full h-full">
      <div
        className={`${parsedPath === "/chat/$chatId/details" ? "hidden" : "flex col-span-8"} xl:flex relative w-full flex-col col-span-5 overflow-hidden`}
      >
        <ChatHeaderSection
          key={"header" + chatId}
          isDmChat={isDmChat}
          interlocutors={interlocutors}
          currentChat={currentChat}
          isAbleToCall={!currentCall}
        />
        {!!currentCallDetails && (
          <CallComponent currentCallDetails={currentCallDetails} />
        )}
        <ChatContent key={"messages" + chatId} interlocutors={interlocutors} />
        <CreateMessageSection key={"message" + chatId} />
      </div>
      {parsedPath === "/chat/$chatId/details" && <Outlet />}
    </div>
  );
}
