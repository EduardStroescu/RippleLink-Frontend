import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { BackIcon } from "@/components/Icons";
import { FullscreenImage } from "@/components/ui/FullscreenImage";
import { placeholderAvatar } from "@/lib/const";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
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
  loader: async ({ context }) => {
    const { queryClient, sharedFilesQuery } = context as typeof context & {
      queryClient: QueryClient;
    };

    return await queryClient.ensureQueryData(sharedFilesQuery);
  },
  component: () => <ChatDetails />,
});

function ChatDetails() {
  // @ts-expect-error chatId exists as a param
  const params = useParams({ chatId: "chatId" });
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const chatData = queryClient.getQueryData<Chat[] | []>(["chats"]);
  const sharedFilesData = Route.useLoaderData<Message[] | []>();

  const currentChat = useMemo(
    () => chatData?.filter((chat) => chat._id === params.chatId)?.[0],
    [chatData, params.chatId]
  );
  const interlocutors = useMemo(
    () =>
      currentChat &&
      currentChat?.users?.filter((person) => person._id !== user?._id),
    [currentChat, user?._id]
  );

  const interlocutorsDisplayNames = interlocutors
    ?.map((user) => user?.displayName)
    .slice(0, 3)
    .join(", ");

  return (
    <aside className="relative w-full col-span-full xl:col-span-3 flex flex-col border-l-slate-700 border-l-[1px] overflow-hidden">
      <div className="flex w-full py-2 px-4 items-center">
        <Link
          to={"/chat/$chatId"}
          preload={false}
          params={{ chatId: params.chatId }}
          className="group flex items-center gap-2 py-4"
        >
          <BackIcon /> <span className="text-xs">Back</span>
        </Link>
      </div>
      <div className="overflow-y-auto py-2">
        {interlocutors && interlocutors?.length <= 1 ? (
          <UserDetailsHeader
            avatarUrl={interlocutors?.[0].avatarUrl || placeholderAvatar}
            name={interlocutors?.[0].displayName}
            statusMessage={interlocutors?.[0].status?.statusMessage}
          />
        ) : (
          <UserDetailsHeader
            avatarUrl={interlocutors?.[0].avatarUrl || placeholderAvatar}
            name={
              currentChat?.name || `Group Chat: ${interlocutorsDisplayNames}`
            }
          />
        )}
        <div className="flex flex-col gap-2 items-center my-4">
          <h2 className="w-4/5 text-center bg-cyan-400/60 text-white rounded-t py-2">
            Shared Files
          </h2>
          <div className="flex flex-wrap w-4/5 h-full items-start justify-center overflow-y-auto">
            {sharedFilesData?.length ? (
              sharedFilesData?.map((message) => (
                <div key={message._id}>{displayMessageByType(message)}</div>
              ))
            ) : (
              <p className="self-center text-lg">No files shared yet</p>
            )}
          </div>
        </div>
        <div className="flex flex-col jutify-center items-center">
          {/* TODO: FINISH IMPLEMENTING THIS */}
          <button className="text-white w-4/5 rounded bg-red-900 hover:bg-red-800 py-2 px-3">
            Block User
          </button>
        </div>
      </div>
    </aside>
  );
}

function UserDetailsHeader({
  avatarUrl,
  name,
  statusMessage,
}: {
  avatarUrl: string;
  name: string;
  statusMessage?: string;
}) {
  return (
    <div className="flex flex-col gap-2 items-center">
      <AvatarCoin
        source={avatarUrl}
        shouldInvalidate
        width={200}
        alt={`User's avatar`}
      />
      <p className="w-4/5 text-3xl text-center truncate">{name}</p>
      {statusMessage && <p className="text-center">{statusMessage}</p>}
    </div>
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
