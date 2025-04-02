import { useParams } from "@tanstack/react-router";
import { create } from "mutative";
import { useEffect } from "react";

import { useSetTanstackCache } from "@/lib/hooks/useSetTanstackCache";
import { useSocketSubscription } from "@/lib/hooks/useSocketSubscription";
import { useAppStore } from "@/stores/useAppStore";
import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";
import { Message } from "@/types/message";

export function useMessageEvents() {
  const socket = useAppStore((state) => state.socket);
  const chatId = useParams({
    from: "/chat/$chatId",
    select: (params) => params.chatId,
  });
  const user = useUserStore((state) => state.user);

  const setMessagesCache = useSetTanstackCache<{
    pages: { messages: Message[]; nextCursor: string | null }[];
    pageParams;
  }>(["messages", chatId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("joinRoom", { room: chatId });
    return () => {
      socket.emit("leaveRoom", { room: chatId });
    };
  }, [socket, chatId]);

  useSocketSubscription("messagesRead", ({ content }: { content: Chat }) => {
    if (!user?._id || content.lastMessage.senderId._id !== user?._id) return;
    setMessagesCache((prevData) => {
      if (!prevData) return undefined;

      return create(prevData, (draft) => {
        // Mark messages as read for the specific user
        draft.pages.forEach((page) => {
          page.messages.forEach((message) => {
            if (
              message.senderId._id === user?._id &&
              message.readBy.length !== content.lastMessage.readBy.length
            ) {
              message.readBy = content.lastMessage.readBy;
            }
          });
        });
      });
    });
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
            // If a temporary message matches the message, replace the temporary message
            const index = draft.pages[0].messages.findIndex(
              (item) => item._id === content._id
            );
            if (index !== -1) {
              draft.pages[0].messages[index] = content;
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
              const message = page.messages[index];

              if (message.type === "file" && content.type === "file") {
                // File Message, sends updates based on save progress, replace each temporary file with the real/saved one
                const newContent = message.content.map((file) => {
                  const updatedFileIdx = content.content.findIndex(
                    (newFile) => newFile.fileId === file.fileId
                  );
                  if (
                    updatedFileIdx !== -1 &&
                    content.content[updatedFileIdx].content !== "placeholder"
                  ) {
                    return {
                      ...file,
                      content: content.content[updatedFileIdx].content,
                    };
                  } else {
                    return file;
                  }
                });
                page.messages[index] = {
                  ...message,
                  content: newContent,
                };
              } else {
                // Normal Message, just replace everything
                page.messages[index] = content;
              }
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
