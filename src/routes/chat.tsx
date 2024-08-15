import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { SocketProvider } from "../providers/SocketProvider";
import { SearchForm } from "@/components/SearchForm";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { AddIcon, SettingsIcon } from "@/components/Icons";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { UserSettingsOverlay } from "@/components/UserSettingsOverlay";
import chatApi from "@/api/modules/chat.api";
import CustomDialogTrigger from "@/components/CustomDialogTrigger";
import { SearchUsersForm } from "@/components/SearchUsersForm";
import { useUserStore } from "@/stores/useUserStore";
import { placeholderAvatar } from "@/lib/const";
import { Chat } from "@/types/chat";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { adaptTimezone } from "@/lib/hepers";
import { useChatEvents } from "@/lib/hooks/useChatEvents";
import { useChatsFilters } from "@/lib/hooks/useChatsFilters";
import { FilterOption } from "@/types/filterOptions";
import { CallProvider } from "@/providers/CallProvider";
import { useToast } from "@/components/ui/use-toast";
import { getParsedPath } from "@/lib/utils";
import { CallEventOverlay } from "@/components/CallEventOverlay";
import CallDialog from "@/components/CallDialog";
import { DraggableVideos } from "@/components/DraggableVideos";
import { Call } from "@/types/call";
import { useCallEvents } from "@/lib/hooks/useCallEvents";

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

  useQuery(chatsQuery);
  useQuery(callsQuery);
  const queryClient = useQueryClient();
  const chats = queryClient.getQueryData<Chat[] | []>(["chats"]);
  const calls = queryClient.getQueryData<Call[] | []>(["calls"]);
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
    <div className="relative flex flex-row w-full h-full">
      <aside
        className={`${parsedPath === "/chat" ? "flex" : "hidden"} sm:flex flex-col flex-1 min-w-[30%] sm:max-w-[20%]`}
      >
        <div className="flex flex-row justify-between text-white min-h-[66px] py-2 px-4 items-center">
          <div className="flex items-center gap-2">
            <UserSettingsOverlay>
              <AvatarCoin
                source={user?.avatarUrl || placeholderAvatar}
                width={50}
                alt=""
              />
            </UserSettingsOverlay>
            <p>{user?.displayName}</p>
          </div>
          <div className="flex flex-row gap-2">
            <Link to="/chat/settings" className="group flex items-center gap-2">
              <SettingsIcon />
            </Link>
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="flex flex-row m-4 items-center justify-center gap-2">
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
              const interlocutor = chat?.users?.filter(
                (participant) => participant._id !== user?._id
              )[0];
              return (
                <Link
                  key={chat._id}
                  to={`/chat/${chat._id}`}
                  activeOptions={{ exact: true }}
                  preload={false}
                  activeProps={{ className: `font-bold` }}
                  className="flex items-center text-white hover:bg-black/80 group"
                >
                  <AvatarCoin
                    source={interlocutor?.avatarUrl || placeholderAvatar}
                    width={50}
                    alt={interlocutor?.displayName || "User"}
                    className="m-3 p-0"
                  />
                  <div className="flex flex-col py-5 px-3 border-b-[1px] border-slate-700 flex-1 w-full overflow-hidden">
                    <p>
                      {interlocutor?.displayName || "User"}{" "}
                      <span
                        className={`${
                          chat?.lastMessage?.senderId?._id !== interlocutor?._id
                            ? "hidden"
                            : ""
                        } text-xs font-normal text-gray-300
                        `}
                      >
                        {!chat?.lastMessage?.read && "(New)"}
                      </span>
                    </p>
                    <p className="font-normal text-gray-400 truncate">
                      {chat?.lastMessage?.type === "text"
                        ? chat.lastMessage?.content
                        : chat.lastMessage?.type}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center border-b-[1px] border-slate-700 h-full">
                    <p className="text-xs font-normal pr-2 group-hover:pr-0">
                      {adaptTimezone(
                        chat.lastMessage?.updatedAt,
                        "ro-RO"
                      ).slice(0, 6)}
                    </p>
                    <DeleteButton
                      className="group pr-2 hidden group-hover:block"
                      onClick={() => handleDeleteChat(chat._id)}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
      <aside
        className={`${parsedPath === "/chat" ? "hidden" : "flex"} sm:flex flex-col flex-1 h-full border-l-[1px] border-slate-700`}
      >
        <Outlet />
      </aside>
      {/* TODO: FINISH IMPLEMENTING THIS */}
      <CallDialog content={<CallEventOverlay chats={chats} />} />
      {parsedPath !== "/chat/$chatId" && <DraggableVideos />}
    </div>
  );
}
