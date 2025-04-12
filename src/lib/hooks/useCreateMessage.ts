import { useParams } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useUserTyping } from "@/lib/hooks/useUserTyping";
import { chunkFilesAndUpload } from "@/lib/utils";
import { useAppStoreActions } from "@/stores/useAppStore";
import {
  FileMessage,
  Message,
  PartialMessage,
  TextMessage,
} from "@/types/message";

export type ContentPreview = {
  content: string;
  fileBlob: Blob;
  name: string;
  type: "file" | "image" | "video" | "audio";
}[];
export type ContentPreviewState = ContentPreview | null;
export type FileType = ContentPreview[number]["type"];

export function useCreateMessage() {
  const { socketEmit } = useAppStoreActions();

  const chatId = useParams({
    from: "/chat/$chatId",
    select: (params) => params.chatId,
  });
  const [message, setMessage] = useState<TextMessage["content"]>("");
  const [messageType, setMessageType] = useState<Message["type"]>("text");
  const [gif, setGif] = useState<string | null>(null);
  const [contentPreview, setContentPreview] =
    useState<ContentPreviewState>(null);

  useUserTyping(chatId, message);

  const handleSubmitMessage = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const payload: PartialMessage = {
        chatId,
        type: messageType,
      };

      if (gif) {
        payload.content = gif;
        socketEmit("createMessage", payload);
        setGif(null);

        // For all types of files
      } else if (contentPreview?.length && messageType !== "text") {
        payload.content = contentPreview.map((content) => {
          URL.revokeObjectURL(content.content);
          return {
            type: content.type,
            content: "placeholder",
            fileId: uuidv4(),
          };
        });
        socketEmit(
          "createMessage",
          payload,
          (response: { message: FileMessage }) => {
            chunkFilesAndUpload(response.message, contentPreview);
          }
        );
        setContentPreview(null);
      } else {
        if (message.length === 0) return;
        payload.content = message;
        socketEmit("createMessage", payload);
        setMessage("");
      }
      setMessageType("text");
    },
    [chatId, contentPreview, socketEmit, gif, message, messageType]
  );

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
