import { memo, useRef, useState } from "react";

import { SendIcon } from "@/components/Icons";
import { CustomChatInput } from "@/components/ui/CustomChatInput";
import { useAppStoreActions } from "@/stores/useAppStore";
import { TextMessage } from "@/types/message";

interface MessageEditorProps {
  message: TextMessage;
  setIsEditing: (isEditing: boolean) => void;
}

export const MessageEditor = memo(
  ({ message, setIsEditing }: MessageEditorProps) => {
    const { getSocket } = useAppStoreActions();
    const [updatedMessage, setUpdatedMessage] = useState(message.content);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const socket = await getSocket();
      if (!socket || !message) return;

      setIsEditing(false);
      socket.emit("updateMessage", {
        chatId: message.chatId,
        messageId: message._id,
        content: updatedMessage,
      });
    };

    const handleKeyDown = () => {
      if (!formRef.current) return;
      formRef.current.requestSubmit();
    };

    return (
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-screen max-w-full min-w-fit py-1 pr-0.5 flex gap-0.5 sm:gap-2 text-white"
      >
        <CustomChatInput
          message={updatedMessage}
          setMessage={setUpdatedMessage}
          handleKeyDown={handleKeyDown}
          emojiClassName="w-[20px] h-[20px] sm:w-[20px] sm:h-[20px]"
        />
        <button type="submit" title="Confirm Edit" aria-label="Confirm Edit">
          <SendIcon className="w-[20px] h-[20px] sm:w-[20px] sm:h-[20px]" />
        </button>
      </form>
    );
  }
);

MessageEditor.displayName = "MessageEditor";
