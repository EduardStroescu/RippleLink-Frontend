import { Chat } from "@/types/chat";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useSetChatsCache() {
  const queryClient = useQueryClient();

  return useCallback(
    (updateFunction: (prevChats: Chat[]) => Chat[]) => {
      queryClient.setQueryData(["chats"], (prevChats: Chat[]) => {
        return updateFunction(prevChats);
      });
    },
    [queryClient]
  );
}
