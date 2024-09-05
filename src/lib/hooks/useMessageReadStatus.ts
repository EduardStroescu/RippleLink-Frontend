import { useSocketContext } from "@/providers/SocketProvider";
import { Message } from "@/types/message";
import { User } from "@/types/user";
import { useEffect } from "react";
import { useSetMessagesCache } from "./useSetMessagesCache";

export function useMessageReadStatus(
  messages: Message[] | [] | undefined,
  user: User | null,
  params
) {
  const { socket } = useSocketContext();
  const setMessagesCache = useSetMessagesCache(params.chatId);

  useEffect(() => {
    if (!socket || !user?._id) return;

    const interlocutorMessages = messages
      ? messages?.filter((message) => message?.senderId?._id !== user._id)
      : [];

    if (
      interlocutorMessages.length > 0 &&
      !interlocutorMessages?.[interlocutorMessages.length - 1]?.read
    ) {
      setMessagesCache(() =>
        messages
          ? messages?.map((message: Message) =>
              message.senderId?._id !== user._id
                ? { ...message, read: true }
                : message
            )
          : []
      );
      socket.emit("readMessages", { room: params.chatId });
    }
  }, [socket, messages, user?._id, params.chatId, setMessagesCache]);
}
