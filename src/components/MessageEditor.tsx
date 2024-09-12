import { forwardRef } from "react";
import { CustomChatInput } from "./ui";
import { SendIcon } from "./Icons";

interface MessageEditorProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setUpdatedMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
  updatedMessage?: string;
  handleKeyDown: () => void;
}

export const MessageEditor = forwardRef<HTMLFormElement, MessageEditorProps>(
  ({ handleSubmit, setUpdatedMessage, updatedMessage, handleKeyDown }, ref) => {
    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className="w-screen max-w-full min-w-fit py-1 pr-0.5 flex gap-0.5 sm:gap-2 text-white"
      >
        <CustomChatInput
          message={updatedMessage}
          setMessage={setUpdatedMessage}
          handleKeyDown={handleKeyDown}
          emojiClassName="w-[20px] h-[20px] sm:w-[20px] sm:h-[20px]"
        />
        <button type="submit">
          <SendIcon
            className="w-[20px] h-[20px] sm:w-[20px] sm:h-[20px]"
            title="Confirm Edit"
          />
        </button>
      </form>
    );
  }
);
