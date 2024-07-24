import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { SocketProvider } from "../providers/SocketProvider";
import { FormEvent } from "react";
import { SearchForm } from "@/components/SearchForm";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { SettingsOverlay } from "@/components/SettingsOverlay";
import { AddIcon, SettingsIcon, TrashIcon } from "@/components/Icons";
import { AvatarCoin } from "@/components/AvatarCoin";
import { ChangeAvatarOverlay } from "@/components/ChangeAvatarOverlay";
import chatApi from "@/api/modules/chat.api";
import CustomDialogTrigger from "@/components/CustomDialogTrigger";
import { SearchUsersForm } from "@/components/SearchUsersForm";
import { useUserStore } from "@/stores/useUserStore";
import { placeholderAvatar } from "@/lib/const";

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
    return {
      queryContent: {
        queryKey: ["chats"],
        queryFn: chatApi.getAllChats,
      },
    };
  },
  loader: async ({ context: { queryClient, queryContent } }) => {
    return await queryClient.ensureQueryData(queryContent);
  },
  component: () => (
    <SocketProvider>
      <ChatWrapper />
    </SocketProvider>
  ),
});

function ChatWrapper() {
  const chats = Route.useLoaderData();
  const user = useUserStore((state) => state.user);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get("search");
    if (searchQuery) {
      // console.log(searchQuery);
    }
  };

  return (
    <div className="flex flex-row w-full h-full">
      <section className="flex flex-col flex-1 max-w-[20%]">
        <div className="flex flex-row justify-between text-white min-h-[66px] py-2 px-4 items-center">
          <div className="flex items-center gap-2">
            <ChangeAvatarOverlay>
              <AvatarCoin
                source={user?.avatarUrl || placeholderAvatar}
                width={50}
                alt=""
              />
            </ChangeAvatarOverlay>
            <p>Chats</p>
          </div>
          <div className="flex flex-row gap-2">
            <SettingsOverlay>
              <SettingsIcon />
            </SettingsOverlay>
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="flex flex-row m-4 items-center justify-center gap-2">
            <SearchForm
              handleSearchSubmit={handleSearchSubmit}
              className="flex-1"
            />
            <CustomDialogTrigger
              header="Start new chat"
              content={<SearchUsersForm />}
              className="group"
            >
              <AddIcon />
            </CustomDialogTrigger>
          </div>
          <div className="flex justify-around items-center gap-2 p-2 text-white border-b-[1px] border-slate-700">
            <button>Read</button>
            <button>Unread</button>
            <button>Groups</button>
          </div>
          <div className="flex flex-col justify-center h-full overflow-y-auto overflow-x-hidden">
            {chats?.map((chat, idx) => {
              const interlocutor = chat.users.filter(
                (participant) => participant._id !== user?._id
              )[0];
              return (
                <Link
                  key={chat._id}
                  to={`/chat/${chat._id}`}
                  activeOptions={{ exact: true }}
                  activeProps={{ className: `font-bold` }}
                  className="flex items-center text-white hover:bg-black/80"
                >
                  <img
                    src={interlocutor.avatarUrl || placeholderAvatar}
                    width={60}
                    alt=""
                    className="p-2 rounded-full"
                  />
                  <p className="p-5 border-b-[1px] border-slate-700 flex-1">
                    {interlocutor.displayName}
                  </p>
                  <button
                    className="group border-b-[1px] border-slate-700 h-full pr-2"
                    onClick={() => {
                      console.log("delete");
                    }}
                  >
                    <TrashIcon />
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="flex flex-col flex-1 h-full">
        <Outlet />
      </section>
    </div>
  );
}
