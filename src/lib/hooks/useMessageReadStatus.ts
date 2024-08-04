import { useSocketContext } from "@/providers/SocketProvider";
import { Message } from "@/types/message";
import { User } from "@/types/user";
import { useEffect } from "react";

export function useMessageReadStatus(
  messages: Message[] | [] | undefined,
  setMessages: (
    updateFunction: (
      prevMessages: Message[] | [] | undefined
    ) => Message[] | [] | undefined
  ) => void,
  user: User | null,
  params: any
) {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket || !user?._id) return;

    const interlocutorMessages = messages
      ? messages?.filter((message) => message?.senderId?._id !== user._id)
      : [];

    if (
      interlocutorMessages.length > 0 &&
      !interlocutorMessages?.[interlocutorMessages.length - 1]?.read
    ) {
      setMessages(() =>
        messages
          ? messages?.map((message) =>
              message.senderId?._id !== user._id
                ? { ...message, read: true }
                : message
            )
          : []
      );
      socket.emit("readMessages", { room: params.chatId });
    }
  }, [socket, messages, user?._id]);
}
