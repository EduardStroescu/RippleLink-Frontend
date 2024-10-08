import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { Chat, FilterOption } from "@/types";

export function useChatsFilters(chats: Chat[] | [] | undefined) {
  const currUser = useUserStore((state) => state.user);
  const [filteredChats, setFilteredChats] = useState<typeof chats>([]);

  useEffect(() => {
    if (chats) {
      const sortedChats = [...chats].sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA;
      });
      setFilteredChats(sortedChats);
    }
  }, [chats]);

  const handleFilter = (filter: FilterOption) => {
    if (filter === "Unread") {
      setFilteredChats(() =>
        chats?.filter(
          (chat) =>
            chat.lastMessage?.read === false &&
            chat.lastMessage.senderId._id !== currUser?._id
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
      setFilteredChats(chats);
    }
  };

  return {
    filteredChats,
    setFilteredChats,
    handleFilter,
    handleSearch,
  };
}
