import { memo } from "react";
import ReactPlayer from "react-player";

import { AudioComponent } from "@/components/ui/AudioComponent";
import { FileComponent } from "@/components/ui/FileComponent";
import { FullscreenImage } from "@/components/ui/FullscreenImage";
import { VideoComponent } from "@/components/ui/VideoComponent";
import { isImageUrl, isVidUrlPattern } from "@/lib/utils";
import { Message, TextMessage } from "@/types/message";

type MessageDisplayName = Message["senderId"]["displayName"];

const renderers = {
  text: (_: string, content: TextMessage["content"]) => (
    <p className="break-words whitespace-normal">{content}</p>
  ),
  image: (
    id: string,
    content: TextMessage["content"],
    displayName: MessageDisplayName,
    idx?: number
  ) => (
    <FullscreenImage
      key={id}
      src={content}
      alt={`Image sent by ${displayName}`}
      width={300}
      className={`${idx === 0 ? "flex-grow" : "w-full sm:w-[calc((100%-0.75rem)/5)]"}`}
      contentClassName={`${idx === 0 ? "w-full py-1" : "w-full"}`}
    />
  ),
  video: (id: string, content: TextMessage["content"], _, idx: number) => (
    <VideoComponent
      key={id}
      src={content}
      className={`${idx === 0 ? "flex-grow" : "w-full sm:w-[calc((100%-0.75rem)/2)]"}`}
    />
  ),
  audio: (id: string, content: TextMessage["content"]) => (
    <AudioComponent
      key={id}
      src={content}
      className="min-w-full max-w-full px-1"
    />
  ),
  file: (id: string, content: TextMessage["content"]) => {
    const fileName = content.split("/").pop();
    return (
      <FileComponent
        key={id}
        href={content}
        download
        fileName={fileName}
        className="max-w-[95px] min-w-[95px] lg:max-w-[120px] lg:min-w-[120px]"
      />
    );
  },
  embedVideo: (_: string, content: TextMessage["content"]) => (
    <div className="relative w-full h-full rounded overflow-clip my-2">
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
  ),
  event: (_: string, content: TextMessage["content"]) => (
    <p className="break-words whitespace-normal text-xs">{content}</p>
  ),
};

/**
 Main component to handle message types
*/
export const MessageContent = memo(({ message }: { message?: Message }) => {
  if (!message) return null;

  // Determine type of content and render accordingly
  if (message.type === "file") {
    // If message type is handled in the renderer mapping
    return (
      <div
        className={`max-w-[400px] lg:max-w-[500px] flex flex-row flex-wrap gap-1.5 justify-center`}
      >
        {message.content.map((content, idx) =>
          renderers[content.type]?.(
            content.fileId,
            content.content,
            message.senderId.displayName,
            idx
          )
        )}
      </div>
    );
  } else {
    if (isImageUrl(message.content)) {
      return renderers.image(
        message._id,
        message.content,
        message.senderId.displayName,
        0
      );
    } else if (isVidUrlPattern(message.content)) {
      return renderers.embedVideo(message._id, message.content);
    } else {
      return renderers[message.type](message._id, message.content);
    }
  }
});

MessageContent.displayName = "MessageContent";
