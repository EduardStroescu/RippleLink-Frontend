import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { chatApi } from "@/api/modules/chat.api";
import { MediaComponent } from "@/components/chatId/MediaComponent";
import { BackIcon } from "@/components/Icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { FileComponent } from "@/components/ui/FileComponent";
import { FullscreenImage } from "@/components/ui/FullscreenImage";
import { groupAvatar, placeholderAvatar } from "@/lib/const";
import { getGroupChatNamePlaceholder } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { FileMessage } from "@/types/message";

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
  loader: async ({
    context: { queryClient, sharedFilesQuery, chatsQuery },
  }) => {
    const sharedFiles = await queryClient.ensureQueryData(sharedFilesQuery);

    return { sharedFiles, chatsQuery };
  },
  component: () => <ChatDetails />,
});

function ChatDetails() {
  const { chatId } = Route.useParams();
  const user = useUserStore((state) => state.user);
  const { sharedFiles: sharedFilesData, chatsQuery } = Route.useLoaderData();
  const { data: chatData } = useQuery(chatsQuery);

  const currentChat = useMemo(
    () => chatData?.filter((chat) => chat._id === chatId)?.[0],
    [chatData, chatId]
  );
  const interlocutors = useMemo(
    () =>
      currentChat && user?._id
        ? currentChat.users.filter((person) => person._id !== user._id)
        : [],
    [currentChat, user?._id]
  );

  const placeholderChatName = getGroupChatNamePlaceholder(interlocutors);

  return (
    <aside className="animate-in fade-in duration-300 ease-in relative w-full col-span-full xl:col-span-3 flex flex-col border-l-slate-700 border-l-[1px] overflow-hidden">
      <nav className="flex w-full py-2 px-4 items-center">
        <Link
          to={"/chat/$chatId"}
          preload={false}
          params={{ chatId }}
          className="group flex items-center gap-2 py-4"
        >
          <BackIcon /> <span className="text-xs">Back</span>
        </Link>
      </nav>
      <div className="overflow-y-auto py-2">
        {interlocutors.length <= 1 ? (
          <UserDetailsHeader
            avatarUrl={interlocutors[0]?.avatarUrl || placeholderAvatar}
            name={interlocutors[0].displayName || "User"}
            statusMessage={interlocutors[0]?.status?.statusMessage}
          />
        ) : (
          <UserDetailsHeader
            avatarUrl={currentChat?.avatarUrl || groupAvatar}
            name={currentChat?.name || placeholderChatName}
          />
        )}
        <div className="w-full flex flex-col items-center mt-4 mb-2">
          <Accordion
            type="single"
            collapsible
            className="w-4/5 flex flex-col gap-2"
          >
            {interlocutors.length > 1 && (
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-center bg-green-500/60 text-white rounded-t p-2">
                  Users In Chat
                </AccordionTrigger>
                <AccordionContent className="mt-1">
                  <ul className="flex flex-col w-full h-full max-h-[300px] items-center justify-center overflow-y-auto gap-1">
                    {interlocutors.map((interlocutor) => (
                      <Link
                        key={interlocutor._id}
                        as="li"
                        aria-label={`Navigate to or create chat with ${interlocutor.displayName}`}
                        to={`/chat/create-chat?userIds=${interlocutor._id}`}
                        className="hover:text-white flex items-center"
                      >
                        <AvatarCoin
                          width={30}
                          source={interlocutor?.avatarUrl || placeholderAvatar}
                          alt={interlocutor.displayName}
                        />
                        {interlocutor.displayName}
                      </Link>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-center bg-cyan-500/60 text-white rounded-t p-2">
                Shared Files
              </AccordionTrigger>
              <AccordionContent className="mt-1">
                <ul className="flex flex-wrap gap-1 w-full h-full max-h-[500px] items-center justify-center overflow-y-auto">
                  {sharedFilesData.length ? (
                    sharedFilesData.map((file: FileMessage) =>
                      file.content.map((content) => (
                        <li
                          key={content.fileId}
                          className="max-h-[100px] max-w-[100px] overflow-hidden"
                        >
                          <FileListItem file={file} content={content} />
                        </li>
                      ))
                    )
                  ) : (
                    <li className="self-center text-lg">No files shared yet</li>
                  )}
                </ul>
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

const renderers = {
  image: (
    senderName: FileMessage["senderId"]["displayName"],
    file: FileMessage["content"][number]
  ) => (
    <FullscreenImage
      src={file.content}
      alt={`Image sent by ${senderName}`}
      title={`Image sent by ${senderName}`}
      aria-label={`Image sent by ${senderName}`}
      className="aspect-square"
    />
  ),
  media: (
    senderName: FileMessage["senderId"]["displayName"],
    file: FileMessage["content"][number]
  ) => (
    <MediaComponent
      file={file.content}
      aria-label={`File sent by ${senderName}`}
    />
  ),
  file: (
    senderName: FileMessage["senderId"]["displayName"],
    file: FileMessage["content"][number]
  ) => {
    const fileName = file.content?.split("/").pop();
    return (
      <FileComponent
        title={`File sent by ${senderName}`}
        aria-label={`File sent by ${senderName}`}
        href={file.content}
        download
        fileName={fileName}
        className="max-w-none min-w-0 w-full h-full max-h-[95px]"
      />
    );
  },
};

function FileListItem({
  file,
  content,
}: {
  file: FileMessage;
  content: FileMessage["content"][number];
}) {
  if (!file || !content) return null;

  if (content.type === "image") {
    return renderers.image(file.senderId.displayName, content);
  } else if (content.type === "file") {
    return renderers.file(file.senderId.displayName, content);
  } else if (content.type === "video" || content.type === "audio") {
    return renderers.media(file.senderId.displayName, content);
  }

  return renderers.file(file.senderId.displayName, content);
}
