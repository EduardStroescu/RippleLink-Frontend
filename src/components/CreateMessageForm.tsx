import React, { FormEvent, useEffect, useRef } from "react";
import { EmojiPicker } from "./EmojiPicker";
import { CloseIcon, GifIcon, ImageIcon, SendIcon } from "./Icons";
import { GifPicker } from "./GifPicker";
import { Message } from "postcss";

type CreateMessageFormProps = {
  handleSubmitMessage: (e: FormEvent<HTMLFormElement>) => void;
  message: string | "";
  messageType: Message["type"];
  imagePreview: string | null;
  setMessage: (message: string) => void;
  setGif: (gif: string | null) => void;
  setImagePreview: (imagePreview: string | null) => void;
  setMessageType: React.Dispatch<
    React.SetStateAction<"text" | "image" | "file" | "video" | "audio">
  >;
};

export const CreateMessageForm = ({
  handleSubmitMessage,
  message,
  messageType,
  imagePreview,
  setMessage,
  setImagePreview,
  setGif,
  setMessageType,
}: CreateMessageFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const handleGifSelect = (gif: string) => {
    setGif(gif);
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    autoResize();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  };

  const insertEmoji = (emoji: string) => {
    const element = chatInputRef.current;
    if (element) {
      const startPos = element.selectionStart;
      const endPos = element.selectionEnd;
      const textBefore = element.value.substring(0, startPos);
      const textAfter = element.value.substring(endPos, element.value.length);

      element.value = textBefore + emoji + textAfter;
      setMessage(element.value);
      autoResize();

      // Set cursor position after emoji
      const newPosition = startPos + emoji.length;
      element.setSelectionRange(newPosition, newPosition);
      element.focus();
    }
  };

  const handleInsertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const fileReader = new FileReader();
    const file = e.target.files[0];
    fileReader.readAsDataURL(file);

    fileReader.onloadend = () => {
      const content = fileReader.result;
      if (content && typeof content === "string") {
        setMessageType("image");
        setImagePreview(content);
      }
    };
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
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col">
      {messageType === "image" && (
        <div className="bg-black/40 p-6 border-t-slate-700 border-t-[1px]">
          <div className="relative max-w-[150px]">
            <img
              src={imagePreview || ""}
              alt="User Pasted Image"
              className=""
            />
            <button
              className="absolute -top-5 -right-5 cursor-pointer"
              onClick={() => {
                setMessageType("text");
                setImagePreview(null);
              }}
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}
      <form
        ref={formRef}
        onSubmit={handleSubmitMessage}
        className="py-3 px-6 flex justify-center items-center gap-4 text-white border-t-slate-700 border-t-[1px]"
      >
        <label
          className="flex flex-col gap-2 cursor-pointer group"
          htmlFor="preview"
        >
          <ImageIcon />
        </label>
        <input
          type="file"
          id="preview"
          placeholder="Upload Image"
          className="hidden"
          onChange={handleInsertImage}
        />
        <EmojiPicker getValue={insertEmoji}>😏</EmojiPicker>
        <textarea
          ref={chatInputRef}
          value={message}
          rows={1}
          spellCheck={true}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="w-full p-2 bg-black/40 rounded-xl resize-none max-h-[25vh] break-all"
        />
        <GifPicker getValue={handleGifSelect}>
          <GifIcon />
        </GifPicker>
        <button type="submit" className="px-2 py-1 rounded-full group">
          <SendIcon />
        </button>
      </form>
    </div>
  );
};
