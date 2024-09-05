import { useEffect, useRef } from "react";
import { EmojiPicker } from "../EmojiPicker";
import { EmojiIcon } from "../Icons";

interface CustomChatInputProps {
  disabled?: boolean;
  message: string | undefined;
  setMessage: (message: string) => void;
  handleKeyDown: () => void;
  handlePaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

export function CustomChatInput({
  disabled,
  message,
  setMessage,
  handleKeyDown,
  handlePaste,
}: CustomChatInputProps) {
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    autoResize();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleKeyDown();
    }
  };

  const insertEmoji = (emoji: string) => {
    const element = chatInputRef.current;
    if (element) {
      const startPos = element.selectionStart ?? 0;
      const endPos = element.selectionEnd ?? 0;
      const textBefore = element.value.substring(0, startPos);
      const textAfter = element.value.substring(endPos, element.value.length);

      element.value = textBefore + emoji + textAfter;
      setMessage(element.value);

      // Set cursor position after emoji
      const newPosition = startPos + emoji.length;
      element.setSelectionRange(newPosition, newPosition);
      element.focus();
    }
  };

  const autoResize = () => {
    const element = chatInputRef.current;
    if (element) {
      element.style.height = "auto";
      const maxHeight = window.innerHeight / 4; // Set max height to 1/4 of the viewport height
      element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;
      element.style.overflowY =
        element.scrollHeight > maxHeight ? "scroll" : "hidden";
    }
  };

  useEffect(() => {
    if (chatInputRef.current) {
      autoResize();
    }
  }, [message]);

  useEffect(() => {
    if (!message) return;
    const element = chatInputRef.current;
    if (element) {
      // Move cursor to end of the text
      element.setSelectionRange(message.length, message.length);
      element.focus();
    }
  }, [message]);

  return (
    <>
      <EmojiPicker getValue={insertEmoji}>
        <EmojiIcon />
      </EmojiPicker>
      <textarea
        disabled={disabled}
        ref={chatInputRef}
        value={message}
        rows={1}
        spellCheck={true}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onPaste={handlePaste}
        placeholder="Type a message"
        className="w-full p-2 bg-black/40 rounded-xl resize-none max-h-[25vh] break-all"
      />
    </>
  );
}
