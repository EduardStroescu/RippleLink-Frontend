import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useSocketContext } from "@/providers/SocketProvider";
import { Message } from "@/types/message";
import { useUserTyping } from "./useUserTyping";

export function useCreateMessage() {
  const { socket } = useSocketContext();
  const params = useParams({ from: "/chat/$chatId" });
  const [message, setMessage] = useState<Message["content"]>("");
  const [messageType, setMessageType] = useState<Message["type"]>("text");
  const [gif, setGif] = useState<string | null>(null);
  const [contentPreview, setContentPreview] = useState<{
    content: string | null;
    name: string | null;
  } | null>(null);

  useUserTyping(params, message);

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (gif) {
      const payload = { room: params.chatId, message: gif, type: "text" };
      socket?.emit("createMessage", payload);
      setGif(null);
    } else if (contentPreview?.content && messageType !== "text") {
      const payload = {
        room: params.chatId,
        message: contentPreview.content,
        type: "image",
      };
      socket?.emit("createMessage", payload);
      setContentPreview(null);
    } else {
      if (message.length === 0) return;

      const payload = { room: params.chatId, message, type: messageType };
      socket?.emit("createMessage", payload);
      setMessage("");
    }
  };

  return {
    handleSubmitMessage,
    message,
    contentPreview,
    messageType,
    setMessage,
    setGif,
    setMessageType,
    setContentPreview,
  };
}
