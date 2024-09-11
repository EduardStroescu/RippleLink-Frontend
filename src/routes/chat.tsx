import { Fragment } from "react/jsx-runtime";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";

import chatApi from "@/api/modules/chat.api";
import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";
import { Message } from "@/types/message";
import { FilterOption } from "@/types/filterOptions";

import { groupAvatar, placeholderAvatar } from "@/lib/const";
import { getParsedPath, adaptTimezone, isAuthenticated } from "@/lib/utils";

import { SocketProvider, CallProvider } from "@/providers";
import { DeleteButton, AvatarCoin, useToast } from "@/components/ui";
import {
  SearchForm,
  UserSettingsOverlay,
  AddIcon,
  SettingsIcon,
  CustomDialogTrigger,
  SearchUsersForm,
  CallEventOverlay,
  DraggableVideos,
  CallDialog,
} from "@/components";

import {
  useChatEvents,
  useChatsFilters,
  useSetChatsCache,
  useCallEvents,
} from "@/lib/hooks";

export const Route = createFileRoute("/chat")({
  beforeLoad: async ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/",
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

  const filterOptions: FilterOption[] = ["All", "Unread", "Groups"];
  const setChatsCache = useSetChatsCache();

  const { data: chats } = useQuery(chatsQuery);
  useQuery(callsQuery);
  const { filteredChats, handleFilter, handleSearch } = useChatsFilters(chats);
  useChatEvents();
  useCallEvents();

  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: Chat["_id"]) => chatApi.deleteChat(chatId),
  });

  const handleDeleteChat = async (chatId: Chat["_id"]) => {
    await deleteChatMutation.mutateAsync(chatId, {
      onSuccess: () => {
        setChatsCache(
          (prev) => prev?.filter((item) => item._id !== chatId) || []
        );
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
                        chat?.name || `Group Chat: ${interlocutorsDisplayNames}`
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
      <DraggableVideos />
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
