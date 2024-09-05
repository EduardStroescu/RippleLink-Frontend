import { useSocketContext } from "@/providers/SocketProvider";
import { Message } from "@/types/message";
import { User } from "@/types/user";
import { useEffect, useState } from "react";
import { useSocketSubscription } from "./useSocketSubscription";
import { useSetMessagesCache } from "./useSetMessagesCache";
import { create } from "mutative";

export function useMessageEvents(params, user: User | null) {
  const { socket } = useSocketContext();

  const [isInterlocutorOnline, setIsInterlocutorOnline] =
    useState<boolean>(false);
  const [interlocutorIsTyping, setInterlocutorIsTyping] =
    useState<boolean>(false);

  const setMessagesCache = useSetMessagesCache(params.chatId);

  useEffect(() => {
    if (!socket) return;
    socket.emit("joinRoom", { room: params.chatId });
    return () => {
      socket.emit("leaveRoom", { room: params.chatId });
    };
  }, [socket, params.chatId]);

  useSocketSubscription("messagesRead", () => {
    if (user?._id) {
      setMessagesCache((prev) =>
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
      setMessagesCache((prev) => (prev ? [...prev, content] : [content]));
      // setTimeout(() => {
      //   //
      // }, 100);
    }
  );

  useSocketSubscription(
    "messageUpdated",
    ({ content }: { content: Message }) => {
      setMessagesCache((prev) => {
        if (!prev) return [content];

        return create(prev, (draft) => {
          const index = draft.findIndex((item) => item._id === content._id);
          if (index === -1) return;
          draft[index] = { ...draft[index], ...content };
        });
      });
    }
  );

  useSocketSubscription(
    "messageDeleted",
    ({ content }: { content: Message }) => {
      setMessagesCache((prev) =>
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
    interlocutorIsTyping,
    isInterlocutorOnline,
    setIsInterlocutorOnline,
  };
}
