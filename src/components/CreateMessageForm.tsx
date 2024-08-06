import React, { FormEvent, useEffect, useRef, useState } from "react";
import { EmojiPicker } from "./EmojiPicker";
import { AddIcon, CloseIcon, FileIcon, GifIcon, SendIcon } from "./Icons";
import { GifPicker } from "./GifPicker";
import { FileUploadOverlay } from "./FileUploadOverlay";
import { Message } from "@/types/message";
import { FileUploadOverlayContent } from "./FileUploadOverlayContent";
import { FullscreenImage } from "./UI/FullscreenImage";
import { VideoComponent } from "./UI/Video";
import { AudioComponent } from "./UI/Audio";

type CreateMessageFormProps = {
  handleSubmitMessage: (e: FormEvent<HTMLFormElement>) => void;
  message: string | "";
  messageType: Message["type"];
  contentPreview: { content: string | null; name: string | null } | null;
  setMessage: (message: string) => void;
  setGif: (gif: string | null) => void;
  setMessageType: React.Dispatch<
    React.SetStateAction<"text" | "image" | "file" | "video" | "audio">
  >;
  setContentPreview: (
    contentPreview: { content: string | null; name: string | null } | null
  ) => void;
};

export const CreateMessageForm = ({
  handleSubmitMessage,
  message,
  messageType,
  contentPreview,
  setMessage,
  setContentPreview,
  setGif,
  setMessageType,
}: CreateMessageFormProps) => {
  const [animationState, setAnimationState] = useState("");
  const [shouldRenderInput, setShouldRenderInput] = useState(true);
  const [shouldRenderPreview, setShouldRenderPreview] =
    useState(!!contentPreview);
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

  const handleInsertFileByType = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: Message["type"],
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!e.target.files?.length) return;
    const fileReader = new FileReader();
    const file = e.target.files[0];
    fileReader.readAsDataURL(file);

    fileReader.onloadend = () => {
      const content = fileReader.result;
      if (content && typeof content === "string") {
        setOpen(false);
        setMessageType(fileType);
        setContentPreview({ content, name: file.name });
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

  useEffect(() => {
    if (contentPreview) {
      setAnimationState("fade-in-up");
      setTimeout(() => {
        setShouldRenderPreview(true);
        setShouldRenderInput(false);
      }, 200);
    } else {
      setAnimationState("fade-out-down");
      setTimeout(() => {
        setShouldRenderInput(true);
        setShouldRenderPreview(false);
      }, 200);
    }
  }, [contentPreview]);

  return (
    <form ref={formRef} onSubmit={handleSubmitMessage}>
      {shouldRenderPreview && (
        <div
          className={`${animationState} flex justify-between bg-black/40 p-6 border-t-slate-700 border-t-[1px]`}
        >
          <div className="relative max-w-[500px]">
            {displayMessagePreviewByType(messageType, contentPreview)}
            {!!contentPreview && (
              <button
                className="absolute -top-5 -right-5 cursor-pointer"
                onClick={() => {
                  setMessageType("text");
                  setContentPreview(null);
                }}
              >
                <CloseIcon />
              </button>
            )}
          </div>
          <button type="submit" className="px-2 py-1 rounded-full group">
            <SendIcon />
          </button>
        </div>
      )}
      {shouldRenderInput && (
        <div
          className={`${!contentPreview ? "fade-in-up" : "fade-out-down"} py-3 px-6 flex justify-center items-center gap-4 text-white border-t-slate-700 border-t-[1px]`}
        >
          <FileUploadOverlay
            content={
              <FileUploadOverlayContent
                handleInsertFileByType={handleInsertFileByType}
              />
            }
          >
            <AddIcon title="Add File" />
          </FileUploadOverlay>
          <EmojiPicker getValue={insertEmoji}>😏</EmojiPicker>
          <textarea
            disabled={!!contentPreview}
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
        </div>
      )}
    </form>
  );
};

function displayMessagePreviewByType(
  messageType: string,
  contentPreview: { content: string | null; name: string | null } | null
) {
  if (!contentPreview) return null;

  switch (messageType) {
    case "image":
      return renderImage(contentPreview);
    case "video":
      return renderVideo(contentPreview);
    case "audio":
      return renderAudio(contentPreview);
    case "file":
      return renderFile(contentPreview);
    default:
      return null;
  }
}

const renderImage = (contentPreview: {
  content: string | null;
  name: string | null;
}) => (
  <FullscreenImage
    src={contentPreview.content || ""}
    alt="User Pasted Image"
    width={300}
  />
);

const renderVideo = (contentPreview: {
  content: string | null;
  name: string | null;
}) => <VideoComponent src={contentPreview.content || undefined} />;

const renderAudio = (contentPreview: {
  content: string | null;
  name: string | null;
}) => <AudioComponent src={contentPreview.content || undefined} />;

const renderFile = (contentPreview: {
  content: string | null;
  name: string | null;
}) => {
  return (
    <div className="max-w-[130px] min-w-[130px] overflow-hidden p-2 m-2 flex flex-col items-center gap-1 bg-black/60 rounded">
      <FileIcon />
      <p className="w-full break-words text-center">{contentPreview.name}</p>
    </div>
  );
};
