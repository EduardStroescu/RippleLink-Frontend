import { useSocketContext } from "@/providers/SocketProvider";
import { Message } from "@/types/message";
import { User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useSocketSubscription } from "./useSocketSubscription";

export function useMessageEvents(
  params,
  user: User | null,
  scrollToBottomRef: React.RefObject<HTMLDivElement>
) {
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();

  const [isInterlocutorOnline, setIsInterlocutorOnline] =
    useState<boolean>(false);
  const [interlocutorIsTyping, setInterlocutorIsTyping] =
    useState<boolean>(false);

  const setMessages = useCallback(
    (
      updateFunction: (
        prevMessages: Message[] | [] | undefined
      ) => Message[] | [] | undefined
    ) => {
      queryClient.setQueryData(
        ["messages", params.chatId],
        (prevMessages: Message[] | [] | undefined) => {
          return updateFunction(prevMessages);
        }
      );
    },
    [queryClient, params.chatId]
  );

  useEffect(() => {
    if (!socket) return;
    socket.emit("joinRoom", { room: params.chatId });
    return () => {
      socket.emit("leaveRoom", { room: params.chatId });
    };
  }, [socket, params.chatId]);

  useSocketSubscription("messagesRead", () => {
    if (user?._id) {
      setMessages((prev) =>
        prev?.map((message: Message) =>
          message.senderId._id === user?._id
            ? { ...message, read: true }
            : message
        )
      );
    }
  });

  useSocketSubscription(
    "messageCreated",
    ({ content }: { content: Message }) => {
      setMessages((prev) => (prev ? [...prev, content] : [content]));
      setTimeout(() => {
        scrollToBottomRef?.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  );

  useSocketSubscription(
    "messageUpdated",
    ({ content }: { content: Message }) => {
      setMessages((prev) => {
        if (!prev) return [content];

        const index = prev.findIndex((item) => item._id === content._id);
        if (index === -1) return prev;

        // Create a new array with an updated object
        const newMessages = prev.map((message: Message, idx: number) =>
          idx === index ? { ...message, ...content } : message
        );

        return newMessages;
      });
    }
  );

  useSocketSubscription(
    "messageDeleted",
    ({ content }: { content: Message }) => {
      setMessages((prev) =>
        prev ? prev.filter((item) => item._id !== content._id) : [content]
      );
    }
  );

  useSocketSubscription(
    "interlocutorIsTyping",
    ({
      content,
    }: {
      content: {
        user: { _id: string; displayName: string };
        isTyping: boolean;
      };
    }) => {
      setInterlocutorIsTyping(content.isTyping);
    }
  );

  useSocketSubscription(
    "broadcastUserStatus",
    ({ content }: { content: { _id: string; isOnline: boolean } }) => {
      setIsInterlocutorOnline(content.isOnline);
    }
  );

  return {
    setMessages,
    interlocutorIsTyping,
    isInterlocutorOnline,
    setIsInterlocutorOnline,
  };
}
