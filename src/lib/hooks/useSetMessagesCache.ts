import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { Message } from "@/types/message";

export function useSetMessagesCache(chatId: string) {
  const queryClient = useQueryClient();

  return useCallback(
    (
      updateFunction: (
        prevData:
          | {
              pages: { messages: Message[]; nextCursor: string | null }[];
              pageParams;
            }
          | undefined
      ) =>
        | {
            pages: { messages: Message[]; nextCursor: string | null }[];
            pageParams;
          }
        | undefined
    ) => {
      queryClient.setQueryData(
        ["messages", chatId],
        (
          prevData:
            | {
                pages: { messages: Message[]; nextCursor: string | null }[];
                pageParams;
              }
            | undefined
        ) => {
          return updateFunction(prevData);
        }
      );
    },
    [queryClient, chatId]
  );
}
