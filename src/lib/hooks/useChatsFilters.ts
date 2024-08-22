import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";
import { FilterOption } from "@/types/filterOptions";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export function useChatsFilters(chats: Chat[] | [] | undefined) {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const [filteredChats, setFilteredChats] = useState<typeof chats>([]);
  const setChats = useCallback(
    (updateFunction: (prevChats: typeof chats) => typeof chats) => {
      queryClient.setQueryData(["chats"], (prevChats: typeof chats) => {
        return updateFunction(prevChats);
      });
    },
    [queryClient]
  );

  useEffect(() => {
    setFilteredChats(chats);
  }, [chats]);

  const handleFilter = (filter: FilterOption) => {
    if (filter === "Unread") {
      setFilteredChats(() =>
        chats?.filter(
          (chat) =>
            chat.lastMessage?.read === false &&
            chat.lastMessage.senderId._id !== user?._id
        )
      );
    } else if (filter === "Groups") {
      setFilteredChats(() => chats?.filter((chat) => chat?.type === "group"));
    } else {
      setFilteredChats(chats);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value !== "") {
      setFilteredChats(() =>
        chats?.filter((chat) =>
          chat.users.some((user) =>
            user.displayName
              .toLowerCase()
              .includes(e.target.value.toLowerCase())
          )
        )
      );
    } else {
      setFilteredChats(chats);
    }
  };

  return {
    filteredChats,
    setFilteredChats,
    setChats,
    handleFilter,
    handleSearch,
  };
}
