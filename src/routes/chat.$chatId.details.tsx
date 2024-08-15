import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { BackIcon } from "@/components/Icons";
import { FullscreenImage } from "@/components/ui/FullscreenImage";
import { placeholderAvatar } from "@/lib/const";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Chat } from "@/types/chat";
import { useMemo } from "react";
import { useUserStore } from "@/stores/useUserStore";
import chatApi from "@/api/modules/chat.api";
import { VideoComponent } from "@/components/ui/Video";
import { AudioComponent } from "@/components/ui/Audio";
import { FileComponent } from "@/components/ui/File";
import { Message } from "@/types/message";

export const Route = createFileRoute("/chat/$chatId/details")({
  beforeLoad: async ({ params: { chatId } }) => {
    const sharedFilesQuery = {
      queryKey: ["sharedFiles", chatId],
      queryFn: () => chatApi.getSharedFilesByChatId(chatId),
      enabled: !!chatId,
      placeholderData: [],
    };

    return { sharedFilesQuery };
  },
  loader: async ({ context: { queryClient, sharedFilesQuery } }) => {
    return await queryClient.ensureQueryData(sharedFilesQuery);
  },
  component: () => <ChatDetails />,
});

//TODO: FINISH IMPLEMENTING THIS
function ChatDetails() {
  const params = useParams({ chatId: "chatId" });
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const chatData = queryClient.getQueryData<Chat[] | []>(["chats"]);
  const sharedFilesData = Route.useLoaderData<Message[] | []>();

  const currentChat = useMemo(
    () => chatData?.filter((chat) => chat._id === params.chatId)?.[0],
    [chatData, params.chatId]
  );
  const interlocutor = useMemo(
    () =>
      currentChat &&
      currentChat?.users?.filter((person) => person._id !== user?._id)[0],
    [currentChat, user?._id]
  );

  return (
    <aside className="relative w-full lg:min-w-[400px] lg:max-w-[400px] 2xl:min-w-[500px] 2xl:max-w-[500px] flex gap-6 flex-col overflow-hidden py-4 border-l-slate-700 border-l-[1px] overflow-y-auto">
      <div className="flex w-full py-2 px-4 items-center">
        <Link
          to={"/chat/$chatId"}
          preload={false}
          params={{ chatId: params.chatId }}
          className="group flex items-center gap-2"
        >
          <BackIcon /> <span className="text-xs">Back</span>
        </Link>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AvatarCoin
          source={interlocutor?.avatarUrl || placeholderAvatar}
          width={200}
          alt={`User's avatar`}
        />
        <p className="text-3xl">{interlocutor?.displayName}</p>
      </div>
      <div className="flex flex-col gap-2 items-center h-[40%]">
        <h2 className="w-4/5 text-center bg-cyan-400/60 text-white rounded-t py-2">
          Shared Files
        </h2>
        <div className="flex flex-wrap w-4/5 h-full items-start justify-center overflow-y-auto">
          {sharedFilesData?.length ? (
            sharedFilesData?.map((message) => (
              <div key={message._id}>{displayMessageByType(message)}</div>
            ))
          ) : (
            <p className="self-center text-xl">No files shared</p>
          )}
        </div>
      </div>
      <div className="flex flex-col jutify-center items-center">
        <button className="text-white w-4/5 rounded bg-red-900 hover:bg-red-800 py-2 px-3">
          Block User
        </button>
      </div>
    </aside>
  );
}

const displayMessageByType = (message: Message) => {
  switch (message.type) {
    case "image":
      return renderImage(message);
    case "file":
      return renderFile(message.content);
    case "video":
      return renderVideo(message.content);
    case "audio":
      return renderAudio(message.content);
    default:
      return renderImage(message);
  }
};

const renderImage = (message: Message) => (
  <FullscreenImage
    src={message.content}
    alt={`Image sent by ${message.senderId.displayName}`}
    width={100}
    className="aspect-square"
  />
);

const renderVideo = (content: string) => <VideoComponent src={content} />;

const renderAudio = (content: string) => <AudioComponent src={content} />;

const renderFile = (content: string) => (
  <FileComponent href={content} download fileName={content} />
);
