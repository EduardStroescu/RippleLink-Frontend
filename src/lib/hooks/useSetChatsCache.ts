import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Chat } from "@/types";

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
