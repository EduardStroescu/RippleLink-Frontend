import { useInfiniteQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { memo, useCallback, useMemo } from "react";

import { MessageComponent } from "@/components/chatId/MessageComponent";
import { MessagesLoadingIndicator } from "@/components/chatId/MessagesLoadingIndicator";
import { TypingIndicator } from "@/components/chatId/TypingIndicator";
import { Virtualizer } from "@/components/ui/Virtualizer";
import { useIsInterlocutorTyping } from "@/lib/hooks/useIsInterlocutorTyping";
import { useMessageEvents } from "@/lib/hooks/useMessageEvents";
import { useMessageReadStatus } from "@/lib/hooks/useMessageReadStatus";
import { useVirtualizer } from "@/lib/hooks/useVirtualizer";
import { getLastMessagesOfDay } from "@/lib/utils";
import { useAppStoreActions } from "@/stores/useAppStore";
import { Message } from "@/types/message";
import { PublicUser } from "@/types/user";

const Route = getRouteApi("/chat/$chatId");

export const ChatContent = memo(
  ({ interlocutors }: { interlocutors: PublicUser[] | undefined }) => {
    const { messagesQuery } = Route.useLoaderData();
    const { chatId } = Route.useParams();
    const { getSocket } = useAppStoreActions();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
      useInfiniteQuery(messagesQuery);
    const messages = data?.messages as Message[];

    useMessageEvents();
    const { scrollParentRef, virtualizer, getRowContent } =
      useVirtualizer<Message>({
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        data: messages,
      });
    const { interlocutorIsTyping } = useIsInterlocutorTyping({
      interlocutors,
    });
    useMessageReadStatus(messages);

    const handleDelete = useCallback(
      async (messageId: string) => {
        const socket = await getSocket();
        if (!socket) return;
        socket.emit("deleteMessage", { chatId, messageId });
      },
      [chatId, getSocket]
    );
    const firstMessagesOfDay = useMemo(
      () => getLastMessagesOfDay(messages),
      [messages]
    );

    return (
      <>
        <Virtualizer virtualizer={virtualizer} ref={scrollParentRef}>
          {({ virtualItem }) =>
            virtualItem.index !== 0 ? (
              <MessageComponent
                key={virtualItem.key}
                isNewDay={firstMessagesOfDay.includes(virtualItem.index)}
                virtualizer={virtualizer}
                virtualItemStart={virtualItem.start}
                message={getRowContent(virtualItem.index)}
                handleDelete={handleDelete}
                idx={virtualItem.index}
                canDeleteMessage={virtualItem.index !== messages.length}
              />
            ) : (
              <TypingIndicator
                key={virtualItem.key}
                virtualItem={virtualItem}
                interlocutorIsTyping={interlocutorIsTyping}
              />
            )
          }
        </Virtualizer>
        <MessagesLoadingIndicator shouldDisplay={isFetchingNextPage} />
      </>
    );
  }
);

ChatContent.displayName = "ChatContent";
