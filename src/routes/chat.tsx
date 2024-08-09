import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { SocketProvider } from "../providers/SocketProvider";
import { SearchForm } from "@/components/SearchForm";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { SettingsOverlay } from "@/components/SettingsOverlay";
import { AddIcon, SettingsIcon } from "@/components/Icons";
import { AvatarCoin } from "@/components/UI/AvatarCoin";
import { UserSettingsOverlay } from "@/components/UserSettingsOverlay";
import chatApi from "@/api/modules/chat.api";
import CustomDialogTrigger from "@/components/CustomDialogTrigger";
import { SearchUsersForm } from "@/components/SearchUsersForm";
import { useUserStore } from "@/stores/useUserStore";
import { placeholderAvatar } from "@/lib/const";
import { Chat } from "@/types/chat";
import { DeleteButton } from "@/components/UI/DeleteButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { adaptTimezone } from "@/lib/hepers";
import { useChatEvents } from "@/lib/hooks/useChatEvents";
import { useChatsFilters } from "@/lib/hooks/useChatsFilters";
import { FilterOption } from "@/types/filterOptions";
import { useAppStore } from "@/stores/useAppStore";
import { CallProvider } from "@/providers/CallProvider";
import { useToast } from "@/components/UI/use-toast";

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
    useAppStore.setState({ isDrawerOpen: true });

    const chatsQuery = {
      queryKey: ["chats"],
      queryFn: chatApi.getAllChats,
      placeholderData: [],
    };
    return { chatsQuery };
  },
  loader: async ({ context: { chatsQuery } }) => chatsQuery,
  component: () => (
    <SocketProvider>
      <CallProvider>
        <ChatWrapper />
      </CallProvider>
    </SocketProvider>
  ),
});

function ChatWrapper() {
  const user = useUserStore((state) => state.user);
  const isDrawerOpen = useAppStore((state) => state.isDrawerOpen);
  const chatsQuery = Route.useLoaderData();
  useQuery(chatsQuery);
  const queryClient = useQueryClient();
  const chats = queryClient.getQueryData<Chat[] | []>(["chats"]);
  const { filteredChats, setChats, handleFilter, handleSearch } =
    useChatsFilters(chats);
  useChatEvents(setChats);
  const router = useRouter();
  const { toast } = useToast();

  const filterOptions: FilterOption[] = ["All", "Unread", "Groups"];
  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: string) => chatApi.deleteChat(chatId),
  });

  const handleDeleteChat = async (chatId: string) => {
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
    <div className="flex flex-row w-full h-full">
      <aside
        className={`${isDrawerOpen ? "flex" : "hidden"} sm:flex flex-col flex-1 sm:max-w-[20%]`}
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
            <SettingsOverlay>
              <SettingsIcon />
            </SettingsOverlay>
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
      <section
        className={`${isDrawerOpen ? "hidden" : "flex"} sm:flex flex-col flex-1 h-full border-l-[1px] border-slate-700`}
      >
        <Outlet />
      </section>
      {/* <CallDialog content={<CallEventOverlay />} /> */}
    </div>
  );
}
