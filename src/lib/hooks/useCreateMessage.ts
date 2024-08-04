import { useSocketContext } from "@/providers/SocketProvider";
import { Message } from "@/types/message";
import { useState } from "react";

export function useCreateMessage(params: any) {
  const { socket } = useSocketContext();
  const [message, setMessage] = useState<Message["content"]>("");
  const [messageType, setMessageType] = useState<Message["type"]>("text");
  const [gif, setGif] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (gif) {
      const payload = { room: params.chatId, message: gif, type: "image" };
      socket?.emit("createMessage", payload);
      setGif(null);
    } else {
      if (message.length === 0) return;
      const imgUrlPattern =
        /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|tiff|svg)(?:\?.*)?$/i;

      const messageType = imgUrlPattern.test(message) ? "image" : "text";

      const payload = { room: params.chatId, message, type: messageType };
      socket?.emit("createMessage", payload);
      setMessage("");
    }
  };

  return {
    handleSubmitMessage,
    message,
    imagePreview,
    messageType,
    setMessage,
    setGif,
    setImagePreview,
    setMessageType,
  };
}
