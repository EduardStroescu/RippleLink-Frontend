import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/stores/useUserStore";
import chatApi from "@/api/modules/chat.api";
import { placeholderAvatar } from "@/lib/const";
import { Chat, Message } from "@/types";

import { BackIcon, MediaComponent } from "@/components";
import {
  AvatarCoin,
  FileComponent,
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
  const { chatId } = Route.useParams();
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const chatData = queryClient.getQueryData<Chat[] | []>(["chats"]);
  const sharedFilesData = Route.useLoaderData<Message[] | []>();

  const currentChat = useMemo(
    () => chatData?.filter((chat) => chat._id === chatId)?.[0],
    [chatData, chatId]
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
          params={{ chatId: chatId }}
          className="group flex items-center gap-2 py-4"
        >
          <BackIcon /> <span className="text-xs">Back</span>
        </Link>
      </div>
      <div className="overflow-y-auto py-2">
        {interlocutors && interlocutors?.length <= 1 ? (
          <UserDetailsHeader
            avatarUrl={interlocutors?.[0]?.avatarUrl || placeholderAvatar}
            name={interlocutors?.[0]?.displayName}
            statusMessage={interlocutors?.[0]?.status?.statusMessage}
          />
        ) : (
          <UserDetailsHeader
            avatarUrl={interlocutors?.[0]?.avatarUrl || placeholderAvatar}
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
                <div className="flex flex-wrap gap-2 w-full h-full max-h-[500px] items-center justify-center overflow-y-auto">
                  {sharedFilesData?.length ? (
                    sharedFilesData?.map((file) => (
                      <div
                        key={file._id}
                        className="max-h-[100px] max-w-[100px] overflow-hidden"
                      >
                        {displayFileByType(file)}
                      </div>
                    ))
                  ) : (
                    <p className="self-center text-lg">No files shared yet</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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

const displayFileByType = (message: Message) => {
  switch (message.type) {
    case "image":
      return renderImage(message);
    case "file":
      return renderFile(message.content);
    case "video":
      return renderMediaContent(message.content);
    case "audio":
      return renderMediaContent(message.content);
    default:
      return renderImage(message);
  }
};

const renderImage = (message: Message) => (
  <FullscreenImage
    src={message.content}
    alt={`Image sent by ${message.senderId.displayName}`}
    className="aspect-square"
  />
);

const renderMediaContent = (content: string) => (
  <MediaComponent file={content} />
);

const renderFile = (content: string) => (
  <div className="group">
    <FileComponent
      href={content}
      download
      fileName={content}
      className="max-w-none min-w-0 w-full h-full max-h-[95px] m-0"
    />
  </div>
);
