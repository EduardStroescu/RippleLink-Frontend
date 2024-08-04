import { useSocketContext } from "@/providers/SocketProvider";
import { Message } from "@/types/message";
import { User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export function useMessageEvents(
  params: any,
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
    [queryClient]
  );

  useEffect(() => {
    if (!socket) return;
    socket.emit("joinRoom", { room: params.chatId });
    return () => {
      socket.emit("leaveRoom", { room: params.chatId });
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !user?._id) return;

    const messageReadHandler = () => {
      setMessages((prev) =>
        prev?.map((message) =>
          message.senderId._id === user?._id
            ? { ...message, read: true }
            : message
        )
      );
    };

    socket.on("messagesRead", messageReadHandler);
    return () => {
      socket.off("messagesRead");
    };
  }, [socket, user?._id]);

  useEffect(() => {
    if (!socket) return;
    const messageCreatedHandler = ({ content }: { content: Message }) => {
      setMessages((prev) => (prev ? [...prev, content] : [content]));
      setTimeout(() => {
        scrollToBottomRef?.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };
    const messageUpdatedHandler = ({ content }: { content: Message }) => {
      setMessages((prev) => {
        if (!prev) return [content];
        const index = prev.findIndex((item) => item._id === content._id);
        if (index === -1) return prev;
        prev[index].content = content.content;
        return [...prev];
      });
    };
    const messageDeletedHandler = ({ content }: { content: Message }) => {
      setMessages((prev) =>
        prev ? prev.filter((item) => item._id !== content._id) : [content]
      );
    };
    const interlocutorIsTypingHandler = ({
      content,
    }: {
      content: {
        user: { _id: string; displayName: string };
        isTyping: boolean;
      };
    }) => {
      if (content.isTyping === true) {
        setInterlocutorIsTyping(true);
      } else {
        setInterlocutorIsTyping(false);
      }
    };
    const broadcastUserStatusHandler = ({
      content,
    }: {
      content: { _id: string; isOnline: boolean };
    }) => {
      setIsInterlocutorOnline(content.isOnline);
    };

    socket.on("broadcastUserStatus", broadcastUserStatusHandler);
    socket.on("messageCreated", messageCreatedHandler);
    socket.on("messageUpdated", messageUpdatedHandler);
    socket.on("messageDeleted", messageDeletedHandler);
    socket.on("interlocutorIsTyping", interlocutorIsTypingHandler);

    return () => {
      socket.off("interlocutorIsTyping");
      socket.off("messageCreated");
      socket.off("messageUpdated");
      socket.off("messageDeleted");
    };
  }, [socket, scrollToBottomRef]);

  return {
    setMessages,
    interlocutorIsTyping,
    isInterlocutorOnline,
    setIsInterlocutorOnline,
  };
}
