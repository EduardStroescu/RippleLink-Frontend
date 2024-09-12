import { useMemo } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/stores/useUserStore";
import chatApi from "@/api/modules/chat.api";
import { placeholderAvatar } from "@/lib/const";
import { Chat, Message } from "@/types";

import { BackIcon } from "@/components";
import {
  AvatarCoin,
  VideoComponent,
  FileComponent,
  AudioComponent,
  FullscreenImage,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui";

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
        <div className="w-full flex flex-col items-center mt-4 mb-2">
          <Accordion
            type="single"
            collapsible
            className="w-4/5 flex flex-col gap-2"
          >
            {interlocutors && interlocutors?.length > 1 && (
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-center bg-green-500/60 text-white rounded-t p-2">
                  Users In Chat
                </AccordionTrigger>
                <AccordionContent className="mt-1">
                  <div className="flex flex-col w-full h-full max-h-[300px] items-center justify-center overflow-y-auto gap-1">
                    {interlocutors?.map((interlocutor) => (
                      <div key={interlocutor._id}>
                        <p>{interlocutor.displayName}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-center bg-cyan-500/60 text-white rounded-t p-2">
                Shared Files
              </AccordionTrigger>
              <AccordionContent className="mt-1">
                <div className="flex flex-wrap w-full h-full max-h-[300px] items-start justify-center overflow-y-auto">
                  {sharedFilesData?.length ? (
                    sharedFilesData?.map((file) => (
                      <div key={file._id}>{displayFileByType(file)}</div>
                    ))
                  ) : (
                    <p className="self-center text-lg">No files shared yet</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        {/* TODO: FINISH IMPLEMENTING THIS */}
        {interlocutors && interlocutors?.length <= 1 && (
          <div className="flex flex-col jutify-center items-center">
            <button className="text-white w-4/5 rounded bg-red-900 hover:bg-red-800 py-2 px-3">
              Block User
            </button>
          </div>
        )}
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

const displayFileByType = (message: Message) => {
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
