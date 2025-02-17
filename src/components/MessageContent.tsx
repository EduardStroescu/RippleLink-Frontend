import { isImageUrl, isVidUrlPattern } from "@/lib/utils";
import { Message } from "@/types/message";
import {
  AudioComponent,
  FileComponent,
  FullscreenImage,
  VideoComponent,
} from "./ui";
import ReactPlayer from "react-player";

export const MessageContent = ({ message }) => {
  if (!message) return null;
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
    className="w-[300px] lg:w-[400px]"
  />
);

const renderVideo = (content: string) => <VideoComponent src={content} />;

const renderEmbedVideo = (content: string) => (
  <div className="w-full h-full rounded overflow-clip my-2">
    <ReactPlayer
      url={content}
      controls
      light={content.includes("youtube") || content.includes("soundcloud")}
      pip
      stopOnUnmount
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
      }}
    />
  </div>
);

const renderAudio = (content: string) => <AudioComponent src={content} />;

const renderFile = (content: string) => {
  const fileName = content.split("/").pop();
  return <FileComponent href={content} download fileName={fileName} />;
};
