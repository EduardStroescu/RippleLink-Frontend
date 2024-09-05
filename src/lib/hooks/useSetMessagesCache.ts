import { Message } from "@/types/message";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useSetMessagesCache(chatId: string) {
  const queryClient = useQueryClient();

  return useCallback(
    (
      updateFunction: (
        prevMessages: Message[] | [] | undefined
      ) => Message[] | [] | undefined
    ) => {
      queryClient.setQueryData(
        ["messages", chatId],
        (prevMessages: Message[] | [] | undefined) => {
          return updateFunction(prevMessages);
        }
      );
    },
    [queryClient, chatId]
  );
}
