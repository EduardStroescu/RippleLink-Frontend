import React, { FormEvent, useEffect, useRef, useState } from "react";
import { AddIcon, CloseIcon, FileIcon, GifIcon, SendIcon } from "./Icons";
import { GifPicker } from "./GifPicker";
import { FileUploadOverlay } from "./FileUploadOverlay";
import { Message } from "@/types/message";
import { FileUploadOverlayContent } from "./FileUploadOverlayContent";
import { FullscreenImage } from "./ui/FullscreenImage";
import { VideoComponent } from "./ui/VideoComponent";
import { AudioComponent } from "./ui/AudioComponent";
import { CustomChatInput } from "./ui/CustomChatInput";

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

  const handleGifSelect = (gif: string) => {
    setGif(gif);
    setMessageType("text");
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }, 0);
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

  const handleKeyDown = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardItem = e.clipboardData.items[0];
    if (clipboardItem.type.startsWith("image")) {
      e.preventDefault();
      const file = clipboardItem.getAsFile();
      if (!file) return;
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onloadend = () => {
        const content = fileReader.result;
        if (content && typeof content === "string") {
          setMessageType("image");
          setContentPreview({ content, name: file.name });
        }
      };
    }
  };

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
          <button type="submit" className="rounded-full group">
            <SendIcon />
          </button>
        </div>
      )}
      {shouldRenderInput && (
        <div
          className={`${!contentPreview ? "fade-in-up" : "fade-out-down"} py-3 px-2 sm:px-6 flex justify-center items-center gap-1 sm:gap-4 text-white border-t-slate-700 border-t-[1px]`}
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
          <CustomChatInput
            disabled={!!contentPreview}
            message={message}
            setMessage={setMessage}
            handleKeyDown={handleKeyDown}
            handlePaste={handlePaste}
          />
          <GifPicker getValue={handleGifSelect}>
            <GifIcon />
          </GifPicker>
          <button type="submit" className="rounded-full group">
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
