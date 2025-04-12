import { useInfiniteQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { memo, useMemo } from "react";

import { MessageComponent } from "@/components/chatId/MessageComponent";
import { MessagesLoadingIndicator } from "@/components/chatId/MessagesLoadingIndicator";
import { TypingIndicator } from "@/components/chatId/TypingIndicator";
import { Virtualizer } from "@/components/ui/Virtualizer";
import { useIsInterlocutorTyping } from "@/lib/hooks/useIsInterlocutorTyping";
import { useMessageEvents } from "@/lib/hooks/useMessageEvents";
import { useMessageReadStatus } from "@/lib/hooks/useMessageReadStatus";
import { useVirtualizer } from "@/lib/hooks/useVirtualizer";
import { getLastMessagesOfDay } from "@/lib/utils";
import { Message } from "@/types/message";
import { PublicUser } from "@/types/user";

const Route = getRouteApi("/chat/$chatId");

export const ChatContent = memo(function ChatContent({
  interlocutors,
}: {
  interlocutors: PublicUser[];
}) {
  const { messagesQuery } = Route.useLoaderData();

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
              idx={virtualItem.index}
              canDeleteMessage={virtualItem.index !== messages.length}
              interlocutorsNumber={interlocutors.length}
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
});
