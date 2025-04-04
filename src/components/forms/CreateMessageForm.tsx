import React, {
  FormEvent,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { FileUploadOverlay } from "@/components/FileUploadOverlay";
import { FileUploadOverlayContent } from "@/components/FileUploadOverlayContent";
import { AddIcon, CloseIcon, GifIcon, SendIcon } from "@/components/Icons";
import { GifPicker } from "@/components/pickers/GifPicker";
import { AudioComponent } from "@/components/ui/AudioComponent";
import { CustomChatInput } from "@/components/ui/CustomChatInput";
import { FullscreenImage } from "@/components/ui/FullscreenImage";
import { toast } from "@/components/ui/use-toast";
import { VideoComponent } from "@/components/ui/VideoComponent";
import {
  ContentPreview,
  ContentPreviewState,
  FileType,
} from "@/lib/hooks/useCreateMessage";
import { bytesToMegabytes } from "@/lib/utils";
import { Message, TextMessage } from "@/types/message";

import { FileComponent } from "../ui/FileComponent";

type CreateMessageFormProps = {
  handleSubmitMessage: (e: FormEvent<HTMLFormElement>) => void;
  message: TextMessage["content"];
  messageType: Message["type"];
  contentPreview: ContentPreviewState;
  setMessage: (message: TextMessage["content"]) => void;
  setGif: (gif: string | null) => void;
  setMessageType: React.Dispatch<React.SetStateAction<Message["type"]>>;
  setContentPreview: React.Dispatch<React.SetStateAction<ContentPreviewState>>;
};

export const CreateMessageForm = memo(
  ({
    handleSubmitMessage,
    message,
    contentPreview,
    setMessage,
    setContentPreview,
    setGif,
    setMessageType,
  }: CreateMessageFormProps) => {
    const [animationState, setAnimationState] = useState("");
    const [shouldRenderInput, setShouldRenderInput] = useState(!contentPreview);
    const formRef = useRef<HTMLFormElement>(null);

    const handleGifSelect = useCallback(
      (gif: string) => {
        setGif(gif);
        setMessageType("text");
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.requestSubmit();
          }
        }, 0);
      },
      [setGif, setMessageType]
    );

    const handleInsertFileByType = useCallback(
      (
        e: React.ChangeEvent<HTMLInputElement>,
        fileType: FileType,
        setOpen: React.Dispatch<React.SetStateAction<boolean>>
      ) => {
        if (!e.target.files?.length) return;

        const files = e.target.files;
        let index = 0;
        for (const file of files) {
          const fileSize = bytesToMegabytes(file.size);

          // Check if the file size is greater than 10 MB
          if (fileSize > 10) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Some of the files' size exceeds 10 MB",
            });
            return;
          }

          const preview = URL.createObjectURL(file);
          const fileBlob = new Blob([file]);

          setContentPreview((prev) =>
            prev
              ? [
                  ...prev,
                  {
                    content: preview,
                    fileBlob,
                    name: file.name,
                    type: fileType,
                  },
                ]
              : [
                  {
                    content: preview,
                    fileBlob,
                    name: file.name,
                    type: fileType,
                  },
                ]
          );

          index++;
        }
        if (index === files.length) {
          setOpen(false);
          setMessageType("file");
        }
      },
      [setContentPreview, setMessageType]
    );

    const handleKeyDown = useCallback(() => {
      if (!formRef.current) return;
      formRef.current.requestSubmit();
    }, []);

    const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const clipboardItems = e.clipboardData.items;

        // If clipboard contains text, do not handle it
        if (clipboardItems[0].type === "text/plain") {
          return;
        }

        e.preventDefault();
        let index = 0;
        for (const clipboardItem of clipboardItems) {
          if (clipboardItem.type.startsWith("image")) {
            const file = clipboardItem.getAsFile();
            if (!file) return;

            const fileSize = bytesToMegabytes(file.size);
            // Check if the file size is greater than 10 MB
            if (fileSize > 10) {
              toast({
                variant: "destructive",
                title: "Error",
                description: "File size exceeds 10 MB",
              });
              return;
            }
            const preview = URL.createObjectURL(file);
            const fileBlob = new Blob([file]);

            setContentPreview((prev) =>
              prev
                ? [
                    ...prev,
                    {
                      content: preview,
                      fileBlob,
                      name: file.name,
                      type: "image",
                    },
                  ]
                : [
                    {
                      content: preview,
                      fileBlob,
                      name: file.name,
                      type: "image",
                    },
                  ]
            );
          }
          index++;
        }
        if (index === clipboardItems.length) {
          setMessageType("file");
        }
      },
      [setContentPreview, setMessageType]
    );

    useEffect(() => {
      if (contentPreview) {
        setAnimationState("fade-in-up");
        setTimeout(() => {
          setShouldRenderInput(false);
        }, 200);
      } else {
        setAnimationState("fade-out-down");
        setTimeout(() => {
          setShouldRenderInput(true);
        }, 200);
      }
    }, [contentPreview]);

    const handleRemoveContentPreview = useCallback(
      (content: ContentPreview[number]) => {
        setContentPreview((prev) => {
          const newContentPreview = prev?.filter((item) => {
            if (item.content === content.content) {
              // Revoke the object URL for the preview to free up memory
              URL.revokeObjectURL(item.content);
              return false;
            }
            return true;
          });
          if (!newContentPreview?.length) {
            setMessageType("text");
            return null;
          }
          return newContentPreview;
        });
      },
      [setContentPreview, setMessageType]
    );

    return (
      <form ref={formRef} onSubmit={handleSubmitMessage}>
        {!shouldRenderInput && (
          <div
            className={`${animationState} flex justify-between gap-2 bg-black/40 px-2 border-t-slate-700 border-t-[1px] py-1`}
          >
            <div className="flex gap-6 items-center w-full overflow-x-auto py-4 px-4">
              {contentPreview?.map((content) => (
                <div key={content.name} className="relative">
                  <button
                    className="absolute z-[3] -top-2 -right-3 cursor-pointer"
                    title="Remove File(s)"
                    aria-label="Remove File(s)"
                    onClick={() => handleRemoveContentPreview(content)}
                  >
                    <CloseIcon />
                  </button>
                  {displayMessagePreviewByType(content)}
                </div>
              ))}
            </div>
            <button
              autoFocus
              type="submit"
              aria-label="Send File(s)"
              title="Send File(s)"
              className="rounded-full h-fit self-center group
              ring-offset-black/60 focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-2
              "
            >
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
            <button
              aria-label="Send Message"
              title="Send Message"
              type="submit"
              className="rounded-full group ring-offset-black/60 focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-2"
            >
              <SendIcon />
            </button>
          </div>
        )}
      </form>
    );
  }
);

CreateMessageForm.displayName = "CreateMessageForm";

const renderers = {
  image: (contentPreview: ContentPreview[number]) => (
    <FullscreenImage
      src={contentPreview.content}
      alt="User Pasted Image"
      contentClassName="object-cover max-h-[10dvh] min-w-[5rem] sm:min-w-[10rem] w-full"
      width={300}
    />
  ),
  video: (contentPreview: ContentPreview[number]) => (
    <VideoComponent
      src={contentPreview.content}
      contentClassName="max-h-[7rem] sm:max-h-[10dvh] min-w-[7rem] sm:min-w-[10rem] w-full"
    />
  ),
  audio: (contentPreview: ContentPreview[number]) => (
    <AudioComponent src={contentPreview.content} className="min-w-[7rem]" />
  ),
  file: (contentPreview: ContentPreview[number]) => (
    <FileComponent
      fileName={contentPreview.name}
      href={contentPreview.content}
    />
  ),
};

function displayMessagePreviewByType(contentPreview: ContentPreview[number]) {
  if (!contentPreview) return null;

  return (
    renderers[contentPreview.type](contentPreview) ||
    renderers.file(contentPreview)
  );
}
