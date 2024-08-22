import { Message } from "@/types/message";
import { CheckIcon, EditIcon } from "./Icons";
import { DeleteButton } from "./ui/DeleteButton";
import { adaptTimezone } from "@/lib/utils";
import { FullscreenImage } from "./ui/FullscreenImage";
import { VideoComponent } from "./ui/Video";
import { AudioComponent } from "./ui/Audio";
import { FileComponent } from "./ui/File";
import { useRef, useState } from "react";
import { CustomChatInput } from "./ui/CustomChatInput";
import { useSocketContext } from "@/providers/SocketProvider";
import { useParams } from "@tanstack/react-router";
import { isImageUrl, isVidUrlPattern } from "@/lib/utils";
import ReactPlayer from "react-player";

export function MessageComponent({
  isOwnMessage,
  message,
  handleDelete,
  idx,
}: {
  isOwnMessage: boolean;
  message: Message;
  handleDelete: (messageId: string) => void;
  idx: number;
}) {
  const { socket } = useSocketContext();
  const [isEditing, setIsEditing] = useState(false);
  const [updatedMessage, setUpdatedMessage] = useState(message.content);
  const formRef = useRef<HTMLFormElement>(null);
  const { chatId } = useParams({ from: "/chat/$chatId" });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (socket) {
      setIsEditing(false);
      socket.emit("updateMessage", {
        room: chatId,
        messageId: message._id,
        message: updatedMessage,
      });
    }
  };

  const handleKeyDown = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };
  return (
    <div
      className={`${
        isOwnMessage ? "self-end" : "self-start"
      } group flex flex-row gap-2 items-center max-w-full`}
    >
      {isOwnMessage && message.type === "text" && (
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="hidden group-hover:flex"
        >
          <EditIcon />
        </button>
      )}
      <div
        className={`${
          isOwnMessage ? "bg-green-600/60" : "bg-black/60"
        } relative flex flex-row py-2 px-4 max-w-xs md:max-w-md lg:max-w-lg rounded-xl overflow-hidden`}
      >
        <div className="flex flex-col w-full">
          {!isEditing ? (
            displayMessageByType(message)
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="md:min-w-[30rem] py-1 flex gap-1 sm:gap-2 text-white"
            >
              <CustomChatInput
                message={updatedMessage}
                setMessage={setUpdatedMessage}
                handleKeyDown={handleKeyDown}
              />
            </form>
          )}
          <div className="flex gap-1 items-center self-end">
            {!isOwnMessage && (
              <p className="text-xs">{message.senderId.displayName}</p>
            )}
            <p className="text-xs">
              {adaptTimezone(message.createdAt, "ro-RO")?.slice(0, 6)}
            </p>
            {message.read && isOwnMessage && <CheckIcon />}
          </div>
        </div>
        {isOwnMessage && idx !== 0 && (
          <div className="w-[50px] h-[40px] absolute justify-end py-2 px-2.5 -right-1 -top-1 hidden group-hover:flex bg-message-gradient pointer-events-none">
            <DeleteButton
              className="group h-fit pointer-events-auto"
              onClick={() => handleDelete(message._id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const displayMessageByType = (message: Message) => {
  switch (message.type) {
    case "text": {
      if (isImageUrl(message.content)) {
        return renderImage(message);
      } else if (isVidUrlPattern(message.content)) {
        return renderEmbedVideo(message.content);
      } else {
        return renderText(message.content);
      }
    }
    case "image":
      return renderImage(message);
    case "file":
      return renderFile(message.content);
    case "video":
      return renderVideo(message.content);
    case "audio":
      return renderAudio(message.content);
    default:
      return renderText(message.content);
  }
};

const renderText = (content: string) => (
  <p className="break-words whitespace-normal">{content}</p>
);

const renderImage = (message: Message) => (
  <FullscreenImage
    src={message.content}
    alt={`Image sent by ${message.senderId.displayName}`}
    width={300}
  />
);

const renderVideo = (content: string) => <VideoComponent src={content} />;

const renderEmbedVideo = (content: string) => (
  <div className="w-full h-full rounded overflow-hidden mr-2 my-2">
    <ReactPlayer
      url={content}
      controls
      light
      pip
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
      }}
    />
  </div>
);

const renderAudio = (content: string) => <AudioComponent src={content} />;

const renderFile = (content: string) => (
  <FileComponent href={content} download fileName={content} />
);
