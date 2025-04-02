import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { memo, useCallback } from "react";
import { Fragment } from "react/jsx-runtime";

import { chatApi } from "@/api/modules/chat.api";
import { ChatListItem } from "@/components/chat/ChatListItem";
import { toast } from "@/components/ui/use-toast";
import { groupAvatar, placeholderAvatar } from "@/lib/const";
import { useSetTanstackCache } from "@/lib/hooks/useSetTanstackCache";
import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";

export const ChatsListSection = memo(
  ({ filteredChats }: { filteredChats: [] | Chat[] | undefined }) => {
    const router = useRouter();
    const user = useUserStore((state) => state.user);

    const setChatsCache = useSetTanstackCache<Chat[]>(["chats", user?._id]);

    const deleteChatMutation = useMutation({
      mutationFn: async (chatId: Chat["_id"]) => chatApi.deleteChat(chatId),
    });

    const handleDeleteChat = useCallback(
      async (chatId: Chat["_id"]) => {
        await deleteChatMutation.mutateAsync(chatId, {
          onSuccess: () => {
            setChatsCache(
              (prev) => prev?.filter((item) => item._id !== chatId) || []
            );
            router.navigate({ to: "/chat", replace: true });
          },
          onError: (error: unknown) => {
            toast({
              variant: "destructive",
              title: "Error",
              description: error as string,
            });
          },
        });
      },
      [deleteChatMutation, router, setChatsCache]
    );

    return (
      <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
        {filteredChats?.map((chat: Chat) => {
          const interlocutors = chat.users.filter(
            (participant) => participant._id !== user?._id
          );
          const interlocutorsDisplayNames = interlocutors
            ?.map((user) => user?.displayName)
            .slice(0, 3)
            .join(", ");

          return (
            <Fragment key={chat._id}>
              {chat.type === "dm" ? (
                <ChatListItem
                  linkTo={chat._id}
                  avatarUrl={interlocutors[0].avatarUrl || placeholderAvatar}
                  name={interlocutors[0].displayName || "User"}
                  lastMessage={chat.lastMessage}
                  displayLastMessageReceipt={
                    chat.lastMessage.senderId._id !== user?._id &&
                    !chat.lastMessage?.readBy.some(
                      (member) => member.userId._id === user?._id
                    )
                  }
                  handleDeleteChat={handleDeleteChat}
                />
              ) : (
                <ChatListItem
                  linkTo={chat._id}
                  avatarUrl={chat.avatarUrl || groupAvatar}
                  name={chat.name || `Group Chat: ${interlocutorsDisplayNames}`}
                  lastMessage={chat.lastMessage}
                  displayLastMessageReceipt={
                    chat.lastMessage.senderId._id !== user?._id &&
                    !chat.lastMessage?.readBy.some(
                      (member) => member.userId._id === user?._id
                    )
                  }
                  handleDeleteChat={handleDeleteChat}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    );
  }
);

ChatsListSection.displayName = "ChatsListSection";
