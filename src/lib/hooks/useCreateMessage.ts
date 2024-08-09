import { useToast } from "@/components/UI/use-toast";
import { useSocketContext } from "@/providers/SocketProvider";
import { Message } from "@/types/message";
import { useState } from "react";

export function useCreateMessage(params: any) {
  const { socket } = useSocketContext();
  const [message, setMessage] = useState<Message["content"]>("");
  const [messageType, setMessageType] = useState<Message["type"]>("text");
  const [gif, setGif] = useState<string | null>(null);
  const [contentPreview, setContentPreview] = useState<{
    content: string | null;
    name: string | null;
  } | null>(null);
  const { toast } = useToast();

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (gif) {
      const payload = { room: params.chatId, message: gif, type: "text" };
      socket?.emit("createMessage", payload);
      setGif(null);
    } else if (contentPreview && messageType === "image") {
      const payload = {
        room: params.chatId,
        message: contentPreview.content,
        type: "image",
      };
      socket?.emit("createMessage", payload);
      setContentPreview(null);
    } else if (contentPreview && messageType === "audio") {
      const payload = {
        room: params.chatId,
        message: contentPreview.content,
        type: "audio",
      };
      socket?.emit("createMessage", payload);
      setContentPreview(null);
    } else if (contentPreview && messageType === "video") {
      const payload = {
        room: params.chatId,
        message: contentPreview.content,
        type: "video",
      };
      try {
        socket?.emit("createMessage", payload);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error });
      }
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
