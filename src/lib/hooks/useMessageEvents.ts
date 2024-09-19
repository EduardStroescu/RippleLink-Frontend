import { useEffect } from "react";
import { create } from "mutative";
import { useParams } from "@tanstack/react-router";
import { useUserStore } from "@/stores/useUserStore";
import { useSocketSubscription, useSetMessagesCache } from "@/lib/hooks";
import { Message } from "@/types";
import { useAppStore } from "@/stores/useAppStore";

export function useMessageEvents() {
  const socket = useAppStore((state) => state.socket);
  const params = useParams({ from: "/chat/$chatId" });
  const user = useUserStore((state) => state.user);

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
    ({ content }: { content: Message & { tempId?: string } }) => {
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
            if (content.tempId) {
              // If a temporary message matches the message, replace the temporary message
              const index = draft.pages[0].messages.findIndex(
                (item) => item._id === content.tempId
              );
              if (index !== -1) {
                draft.pages[0].messages[index] = content;
              }
            } else {
              draft.pages[0].messages.push(content);
            }
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
}
