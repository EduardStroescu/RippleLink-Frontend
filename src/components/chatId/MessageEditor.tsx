import { memo, useRef, useState } from "react";

import { BackIcon, SendIcon } from "@/components/Icons";
import { CustomChatInput } from "@/components/ui/CustomChatInput";
import { useAppStoreActions } from "@/stores/useAppStore";
import { TextMessage } from "@/types/message";

interface MessageEditorProps {
  message: TextMessage;
  setIsEditing: (isEditing: boolean) => void;
}

export const MessageEditor = memo(function MessageEditor({
  message,
  setIsEditing,
}: MessageEditorProps) {
  const { socketEmit } = useAppStoreActions();
  const [updatedMessage, setUpdatedMessage] = useState(message.content);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsEditing(false);
    socketEmit("updateMessage", {
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
    <div className="flex flex-col gap-2 py-1 px-0.5">
      <button
        aria-label="Cancel Edit"
        title="Cancel Edit"
        className="group flex gap-1 items-center w-fit"
        onClick={() => setIsEditing(false)}
      >
        <BackIcon className="w-[14px] h-[14px]" />
        <span className="text-xs">Back</span>
      </button>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-screen max-w-full min-w-fit flex gap-1 sm:gap-2 text-white"
      >
        <CustomChatInput
          message={updatedMessage}
          setMessage={setUpdatedMessage}
          handleKeyDown={handleKeyDown}
          emojiClassName="w-[20px] h-[20px] sm:w-[20px] sm:h-[20px]"
        />
        <button
          type="submit"
          title="Confirm Edit"
          aria-label="Confirm Edit"
          className="group"
        >
          <SendIcon className="w-[20px] h-[20px] sm:w-[20px] sm:h-[20px]" />
        </button>
      </form>
    </div>
  );
});
