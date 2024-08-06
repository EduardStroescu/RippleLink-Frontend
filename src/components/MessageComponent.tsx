import { Message } from "@/types/message";
import { CheckIcon } from "./Icons";
import { DeleteButton } from "./DeleteButton";
import { adaptTimezone } from "@/lib/hepers";
import { FullscreenImage } from "./UI/FullscreenImage";
import { VideoComponent } from "./UI/Video";
import { AudioComponent } from "./UI/Audio";
import { FileComponent } from "./UI/File";

export function MessageComponent({
  isOwnMessage,
  message,
  handleDelete,
}: {
  isOwnMessage: boolean;
  message: Message;
  handleDelete: (messageId: string) => void;
}) {
  return (
    <div
      className={`${
        isOwnMessage ? "self-end" : "self-start"
      } group flex flex-row gap-2 items-center`}
    >
      <div
        className={`${
          isOwnMessage ? "bg-green-600/60" : "bg-black/60"
        } relative flex flex-row py-2 px-4 max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-xl overflow-hidden`}
      >
        <div className="flex flex-col w-full">
          {displayMessageByType(message)}
          <div className="flex gap-1 items-center self-end">
            <p className="text-xs">
              {adaptTimezone(message.createdAt, "ro-RO")?.slice(0, 6)}
            </p>
            {message.read && isOwnMessage && <CheckIcon />}
          </div>
        </div>
        {isOwnMessage && (
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
  const isImageUrl = (url: string) => {
    const imgUrlPattern =
      /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|tiff|svg)(?:\?.*)?$/i;
    return imgUrlPattern.test(url);
  };

  switch (message.type) {
    case "text": {
      return isImageUrl(message.content)
        ? renderImage(message)
        : renderText(message.content);
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

const renderAudio = (content: string) => <AudioComponent src={content} />;

const renderFile = (content: string) => (
  <FileComponent href={content} download fileName={content} />
);
