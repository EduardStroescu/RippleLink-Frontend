import { useCallback, useEffect, useMemo, useState } from "react";

import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";
import { FilterOption } from "@/types/filterOptions";

export function useChatsFilters(chats: Chat[] | [] | undefined) {
  const currUser = useUserStore((state) => state.user);
  const sortedChats = useMemo(
    () =>
      chats?.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA;
      }),
    [chats]
  );
  const [filteredChats, setFilteredChats] = useState<typeof chats>([]);

  useEffect(() => {
    if (sortedChats) {
      setFilteredChats(sortedChats);
    }
  }, [sortedChats]);

  const handleFilter = useCallback(
    (filter: FilterOption) => {
      if (filter === "Unread") {
        setFilteredChats(() =>
          sortedChats?.filter(
            (chat) =>
              chat.lastMessage.senderId._id !== currUser?._id &&
              !chat.lastMessage.readBy.some(
                (member) => member.userId._id === currUser?._id
              )
          )
        );
      } else if (filter === "Groups") {
        setFilteredChats(() =>
          sortedChats?.filter((chat) => chat?.type === "group")
        );
      } else {
        setFilteredChats(sortedChats);
      }
    },
    [sortedChats, currUser?._id]
  );

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value !== "") {
        setFilteredChats(() =>
          sortedChats?.filter((chat) =>
            chat.users.some(
              (user) =>
                user._id !== currUser?._id &&
                user.displayName
                  .toLowerCase()
                  .includes(e.target.value.toLowerCase())
            )
          )
        );
      } else {
        setFilteredChats(sortedChats);
      }
    },
    [sortedChats, currUser?._id]
  );

  return {
    filteredChats,
    setFilteredChats,
    handleFilter,
    handleSearch,
  };
}
