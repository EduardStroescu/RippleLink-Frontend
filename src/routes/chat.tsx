import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { SocketProvider } from "../providers/SocketProvider";
import { SearchForm } from "@/components/SearchForm";
import { isAuthenticated } from "@/lib/utils";
import { AddIcon, SettingsIcon } from "@/components/Icons";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { UserSettingsOverlay } from "@/components/UserSettingsOverlay";
import chatApi from "@/api/modules/chat.api";
import CustomDialogTrigger from "@/components/CustomDialogTrigger";
import { SearchUsersForm } from "@/components/SearchUsersForm";
import { useUserStore } from "@/stores/useUserStore";
import { groupAvatar, placeholderAvatar } from "@/lib/const";
import { Chat } from "@/types/chat";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { adaptTimezone } from "@/lib/utils";
import { useChatEvents } from "@/lib/hooks/useChatEvents";
import { useChatsFilters } from "@/lib/hooks/useChatsFilters";
import { FilterOption } from "@/types/filterOptions";
import { CallProvider } from "@/providers/CallProvider";
import { useToast } from "@/components/ui/use-toast";
import { getParsedPath } from "@/lib/utils";
import { CallEventOverlay } from "@/components/CallEventOverlay";
import CallDialog from "@/components/CallDialog";
import { DraggableVideos } from "@/components/DraggableVideos";
import { useCallEvents } from "@/lib/hooks/useCallEvents";
import { Message } from "@/types/message";
import { Fragment } from "react/jsx-runtime";

export const Route = createFileRoute("/chat")({
  beforeLoad: async ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    const chatsQuery = {
      queryKey: ["chats"],
      queryFn: chatApi.getAllChats,
      placeholderData: [],
    };
    const callsQuery = {
      queryKey: ["calls"],
      queryFn: chatApi.getAllCalls,
      placeholderData: [],
    };
    return { chatsQuery, callsQuery };
  },
  loader: async ({ context: { chatsQuery, callsQuery } }) => ({
    chatsQuery,
    callsQuery,
  }),
  component: () => (
    <SocketProvider>
      <CallProvider>
        <ChatWrapper />
      </CallProvider>
    </SocketProvider>
  ),
});

function ChatWrapper() {
  const { toast } = useToast();
  const location = useLocation();
  const router = useRouter();
  const parsedPath = getParsedPath(location.pathname);
  const { chatsQuery, callsQuery } = Route.useLoaderData();

  const user = useUserStore((state) => state.user);

  const { data: chats } = useQuery(chatsQuery);
  const { data: calls } = useQuery(callsQuery);
  const filterOptions: FilterOption[] = ["All", "Unread", "Groups"];

  const { filteredChats, setChats, handleFilter, handleSearch } =
    useChatsFilters(chats);
  useChatEvents(setChats);
  useCallEvents(calls);

  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: Chat["_id"]) => chatApi.deleteChat(chatId),
  });

  const handleDeleteChat = async (chatId: Chat["_id"]) => {
    await deleteChatMutation.mutateAsync(chatId, {
      onSuccess: () => {
        setChats((prev) => prev?.filter((item) => item._id !== chatId) || []);
        router.navigate({ to: "/chat", replace: true });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  return (
    <div className="relative grid grid-flow-col grid-cols-1 md:grid-cols-7 xl:grid-cols-8 w-full h-full">
      <aside
        className={`${parsedPath === "/chat" ? "flex" : "hidden"} md:flex flex-col flex-1 max-w-full col-span-3 lg:col-span-3 xl:col-span-2 overflow-hidden`}
      >
        <div className="flex flex-row justify-between text-white py-1 sm:py-2 px-4 items-center">
          <div className="flex items-center gap-2">
            <UserSettingsOverlay>
              <AvatarCoin
                source={user?.avatarUrl || placeholderAvatar}
                width={50}
                alt=""
              />
            </UserSettingsOverlay>
            <p className="font-bold">{user?.displayName}</p>
          </div>
          <div className="flex flex-row gap-2">
            <Link
              to={
                !/\/chat\/settings/.test(location.pathname)
                  ? "/chat/settings"
                  : "/chat"
              }
              className="group flex items-center gap-2"
            >
              <SettingsIcon />
            </Link>
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="flex flex-row mx-3.5 items-center justify-center gap-2">
            <SearchForm onChange={handleSearch} />
            <CustomDialogTrigger
              header="Start new chat"
              content={<SearchUsersForm />}
              className="group"
            >
              <AddIcon title="Start new chat" />
            </CustomDialogTrigger>
          </div>
          <div className="flex justify-around items-center gap-2 py-2 text-white border-b-[1px] border-slate-700">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleFilter(option)}
                className="w-full text-slate-300 hover:text-white"
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
            {filteredChats?.map((chat: Chat) => {
              const interlocutors = chat?.users?.filter(
                (participant) => participant._id !== user?._id
              );
              const interlocutorsDisplayNames = interlocutors
                ?.map((user) => user?.displayName)
                .slice(0, 3)
                .join(", ");
              return (
                <Fragment key={chat?._id}>
                  {chat.type === "dm" ? (
                    <ChatListItem
                      linkTo={chat?._id}
                      avatarUrl={
                        interlocutors?.[0]?.avatarUrl || placeholderAvatar
                      }
                      name={interlocutors?.[0]?.displayName || "User"}
                      lastMessage={chat?.lastMessage}
                      displayLastMessageReceipt={
                        chat?.lastMessage?.senderId?._id === user?._id
                      }
                      handleDeleteChat={handleDeleteChat}
                    />
                  ) : (
                    <ChatListItem
                      linkTo={chat?._id}
                      avatarUrl={chat?.avatarUrl || groupAvatar}
                      name={
                        `Group Chat: ${interlocutorsDisplayNames}` ||
                        "Group Chat"
                      }
                      lastMessage={chat.lastMessage}
                      displayLastMessageReceipt={
                        chat?.lastMessage?.senderId?._id === user?._id
                      }
                      handleDeleteChat={handleDeleteChat}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </aside>
      <aside
        className={`${parsedPath === "/chat" ? "hidden" : "flex"} md:flex flex-col border-l-[1px] border-slate-700 col-span-6 overflow-hidden`}
      >
        <Outlet />
      </aside>
      <CallDialog content={<CallEventOverlay chats={chats} />} />
      {parsedPath !== "/chat/$chatId" && <DraggableVideos />}
    </div>
  );
}

function ChatListItem({
  linkTo,
  avatarUrl,
  name,
  lastMessage,
  displayLastMessageReceipt,
  handleDeleteChat,
}: {
  linkTo: string;
  avatarUrl: string;
  name: string;
  lastMessage: Message;
  displayLastMessageReceipt: boolean;
  handleDeleteChat: (linkTo: string) => void;
}) {
  return (
    <Link
      to={`/chat/${linkTo}`}
      activeOptions={{ exact: true }}
      preload={false}
      activeProps={{ className: `font-bold` }}
      className="flex items-center text-white hover:bg-black/80 group"
    >
      <AvatarCoin
        source={avatarUrl || placeholderAvatar}
        shouldInvalidate
        width={50}
        alt={name}
        className="m-3 p-0"
      />
      <div className="flex flex-col py-5 px-3 border-b-[1px] border-slate-700 flex-1 w-full overflow-hidden">
        <p className="truncate">
          {name || "User"}{" "}
          <span
            className={`${
              displayLastMessageReceipt ? "hidden" : ""
            } text-xs font-bold text-slate-400
          `}
          >
            {!lastMessage?.read && "(New)"}
          </span>
        </p>
        <p className="font-normal text-gray-400 truncate">
          {lastMessage?.type === "text"
            ? lastMessage?.content
            : lastMessage?.type}
        </p>
      </div>
      <div className="flex gap-2 items-center border-b-[1px] border-slate-700 h-full">
        <p className="text-xs font-normal pr-2 group-hover:pr-0">
          {adaptTimezone(lastMessage?.updatedAt, "ro-RO").slice(0, 6)}
        </p>
        <DeleteButton
          className="group pr-2 hidden group-hover:block"
          onClick={() => handleDeleteChat(linkTo)}
        />
      </div>
    </Link>
  );
}
