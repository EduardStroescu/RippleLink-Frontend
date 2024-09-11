import { useCallback, useEffect, useState } from "react";
import { useSocketContext } from "@/providers/SocketProvider";
import { create } from "mutative";
import { useParams } from "@tanstack/react-router";
import { useUserStore } from "@/stores/useUserStore";
import { Message } from "@/types/message";
import { useSocketSubscription, useSetMessagesCache } from "@/lib/hooks";
import { User } from "@/types/user";

export function useMessageEvents(interlocutors: User[] | undefined) {
  const { socket } = useSocketContext();
  const params = useParams({ from: "/chat/$chatId" });
  const user = useUserStore((state) => state.user);
  const interlocutor = interlocutors?.[0];

  const [isInterlocutorOnline, setIsInterlocutorOnline] =
    useState<boolean>(false);
  const [interlocutorIsTyping, setInterlocutorIsTyping] =
    useState<boolean>(false);

  const setMessagesCache = useSetMessagesCache(params.chatId);

  useEffect(() => {
    // State doesn't reset as Tanstack Router reuses components nested under the same route - see dynamic routes
    setInterlocutorIsTyping(false);
    if (!socket) return;
    socket.emit("joinRoom", { room: params.chatId });
    return () => {
      socket.emit("leaveRoom", { room: params.chatId });
    };
  }, [socket, params.chatId]);

  useSocketSubscription("messagesRead", () => {
    if (user?._id) {
      setMessagesCache((prevData) => {
        if (!prevData) {
          return undefined;
        }

        return create(prevData, (draft) => {
          // Mark messages as read for the specific user
          draft.pages.forEach((page) => {
            page.messages.forEach((message) => {
              if (message.senderId._id === user?._id) {
                message.read = true;
              }
            });
          });
        });
      });
    }
  });

  useSocketSubscription(
    "messageCreated",
    ({ content }: { content: Message }) => {
      setMessagesCache((prevData) => {
        if (!prevData) {
          return {
            pages: [{ messages: [content], nextCursor: null }],
            pageParams: [],
          };
        }

        return create(prevData, (draft) => {
          // Add new message to the end of the latest page's messages
          if (draft.pages.length > 0) {
            draft.pages[0].messages.push(content);
          } else {
            // No pages exist, initialize with the new message
            draft.pages.push({ messages: [content], nextCursor: null });
          }
        });
      });
    }
  );

  useSocketSubscription(
    "messageUpdated",
    ({ content }: { content: Message }) => {
      setMessagesCache((prevData) => {
        if (!prevData) {
          return {
            pages: [{ messages: [content], nextCursor: null }],
            pageParams: [],
          };
        }

        return create(prevData, (draft) => {
          // Update the specific message in all pages
          draft.pages.forEach((page) => {
            const index = page.messages.findIndex(
              (item) => item._id === content._id
            );
            if (index !== -1) {
              page.messages[index] = { ...page.messages[index], ...content };
            }
          });
        });
      });
    }
  );

  useSocketSubscription(
    "messageDeleted",
    ({ content }: { content: Message }) => {
      setMessagesCache((prevData) => {
        if (!prevData) {
          return prevData;
        }

        return create(prevData, (draft) => {
          // Filter out the deleted message from all pages
          draft.pages.forEach((page) => {
            page.messages = page.messages.filter(
              (message) => message._id !== content._id
            );
          });
        });
      });
    }
  );

  const handleInterlocutorTyping = useCallback(
    ({
      content,
    }: {
      content: {
        user: { _id: User["_id"]; displayName: string };
        isTyping: boolean;
      };
    }) => {
      const isTypingUserInCurrentChat = interlocutors?.some(
        (person) => person._id === content.user._id
      );
      if (isTypingUserInCurrentChat) {
        setInterlocutorIsTyping(content.isTyping);
      }
    },
    [interlocutors]
  );
  useSocketSubscription("interlocutorIsTyping", handleInterlocutorTyping);

  useEffect(() => {
    setIsInterlocutorOnline(interlocutor?.status?.online || false);
  }, [interlocutor?.status?.online, params.chatId]);

  const handleInterlocutorOnlineStatus = useCallback(
    ({ content }: { content: { _id: User["_id"]; isOnline: boolean } }) => {
      if (interlocutor?._id === content._id) {
        setIsInterlocutorOnline(content.isOnline);
      }
    },
    [interlocutor?._id]
  );
  useSocketSubscription("broadcastUserStatus", handleInterlocutorOnlineStatus);

  return {
    interlocutorIsTyping,
    isInterlocutorOnline,
    setIsInterlocutorOnline,
  };
}
