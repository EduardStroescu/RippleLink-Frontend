import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";

import { chatApi } from "@/api/modules/chat.api";
import { DraggableVideos } from "@/components/call/DraggableVideos";
import { ChatFilterSection } from "@/components/chat/ChatFilterSection";
import { ChatHeaderSection } from "@/components/chat/ChatHeaderSection";
import { ChatsListSection } from "@/components/chat/ChatListSection";
import { ChatSearchSection } from "@/components/chat/ChatSearchSection";
import { useCallEvents } from "@/lib/hooks/useCallEvents";
import { useChatEvents } from "@/lib/hooks/useChatEvents";
import { useChatsFilters } from "@/lib/hooks/useChatsFilters";
import { useCurrentCallState } from "@/lib/hooks/useCurrentCallState";
import { useSocketConnection } from "@/lib/hooks/useSocketConenction";
import { getParsedPath, isAuthenticated } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";

export const Route = createFileRoute("/chat")({
  beforeLoad: async ({ location, context: { queryClient } }) => {
    const user = useUserStore.getState().user;
    if (!isAuthenticated() || !user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    const chatsQuery = {
      queryKey: ["chats", user._id],
      queryFn: chatApi.getAllChats,
      placeholderData: [],
      enabled: !!user._id,
    };
    const callsQuery = {
      queryKey: ["calls", user._id],
      queryFn: chatApi.getAllCalls,
      placeholderData: [],
      enabled: !!user._id,
    };
    await Promise.all([
      queryClient.ensureQueryData(chatsQuery),
      queryClient.ensureQueryData(callsQuery),
    ]);
    return { chatsQuery, callsQuery };
  },
  loader: ({ context: { chatsQuery, callsQuery } }) => {
    return {
      chatsQuery,
      callsQuery,
    };
  },
  component: () => <ChatWrapper />,
});

function ChatEffects() {
  const { callsQuery } = Route.useLoaderData();

  useSocketConnection();
  useChatEvents();
  useCallEvents(callsQuery);
  useCurrentCallState();

  return null;
}

function ChatWrapper() {
  const location = useLocation();
  const parsedPath = getParsedPath(location.pathname);

  return (
    <>
      <ChatEffects />
      <div className="relative grid grid-flow-col grid-cols-1 md:grid-cols-7 xl:grid-cols-8 w-full h-full">
        <aside
          className={`${parsedPath === "/chat" ? "flex" : "hidden"} md:flex flex-col flex-1 max-w-full col-span-3 lg:col-span-3 xl:col-span-2 overflow-hidden`}
        >
          <ChatHeaderSection />
          <ChatSection />
        </aside>
        <aside
          className={`${parsedPath === "/chat" ? "hidden" : "flex"} md:flex flex-col border-l-[1px] border-slate-700 col-span-6 overflow-hidden`}
        >
          <Outlet />
        </aside>
        <DraggableVideos />
      </div>
    </>
  );
}

function ChatSection() {
  const { chatsQuery } = Route.useLoaderData();

  const { data: chats } = useQuery(chatsQuery);
  const { filteredChats, handleFilter, handleSearch } = useChatsFilters(chats);

  return (
    <div className="flex flex-col overflow-hidden">
      <ChatSearchSection handleSearch={handleSearch} />
      <ChatFilterSection handleFilter={handleFilter} />
      <ChatsListSection filteredChats={filteredChats} />
    </div>
  );
}
