import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { EmojiPicker } from "@/components/EmojiPicker";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ImageIcon, SendIcon } from "@/components/Icons";
import { useSocketContext } from "@/providers/SocketProvider";
import { useUserStore } from "@/stores/useUserStore";
import { AvatarCoin } from "@/components/AvatarCoin";
import { useThrottle } from "@/lib/hooks/useThrottle";
import { TypingIndicator } from "@/components/TypingIndicator";
import chatApi from "@/api/modules/chat.api";
import { placeholderAvatar } from "@/lib/const";
import { adaptTimezone } from "@/lib/hepers";

export const Route = createFileRoute("/chat/$chatId")({
  beforeLoad: ({ params: { chatId } }) => {
    const messagesQuery = {
      queryKey: ["messages", chatId],
      queryFn: () => chatApi.getMessagesByChatId(chatId),
      enabled: !!chatId,
    };

    return { messagesQuery };
  },
  loader: async ({ context: { queryClient, queryContent, messagesQuery } }) => {
    return {
      messagesData: await queryClient.ensureQueryData(messagesQuery),
      chatData: await queryClient.ensureQueryData(queryContent),
    };
  },
  component: ChatId,
});

type Message = {
  chatId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

function ChatId() {
  const { socket } = useSocketContext();
  const user = useUserStore((state) => state.user);
  const { messagesData, chatData } = Route.useLoaderData();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[] | []>([]);
  const [userIsTyping, setUserIsTyping] = useState<boolean>(false);
  const params = useParams({ from: "/chat/$chatId" });
  const scrollToBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messagesData) return;
    setMessages(messagesData);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const room = params.chatId;
    socket.emit("joinRoom", { room });
    socket.on("messageCreated", ({ content }) => {
      setMessages((prev) => [...prev, content]);
    });
    socket.on("messageUpdated", (data) => {
      setMessages((prev) => {
        const index = prev.findIndex((item) => item.content === data.content);
        if (index === -1) return prev;
        prev[index].content = data.content.message;
        return [...prev];
      });
    });
    socket.on("messageDeleted", (data) => {
      setMessages((prev) => {
        return prev.filter((item) => item.content !== data.content);
      });
    });
    socket.on("userIsTyping", (data) => {
      if (data.content.isTyping === true) {
        setUserIsTyping(true);
      } else {
        setUserIsTyping(false);
      }
    });

    return () => {
      socket.off("userIsTyping");
      socket.off("messageCreated");
      socket.off("messageUpdated");
      socket.off("messageDeleted");

      socket.emit("leaveRoom", { room });
    };
  }, []);

  const handleTyping = useThrottle(() => {
    if (!socket) return;
    socket.emit("typing", { room: params.chatId, isTyping: true });
  }, 2000);

  useEffect(() => {
    if (!socket) return;
    if (!message) {
      socket.emit("typing", { room: params.chatId, isTyping: false });
    } else {
      handleTyping();
    }
  }, [socket, message, handleTyping, params.chatId]);

  const handleSubmitMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.length === 0) return;
    const payload = { room: params.chatId, message };

    socket?.emit("createMessage", payload);
    setMessage("");
  };

  useEffect(() => {
    if (userIsTyping || messages) {
      scrollToBottomRef?.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, userIsTyping]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex flex-row gap-2 text-white min-h-[56px] p-2 items-center">
        <AvatarCoin
          source={chatData?.[0].users[1]?.avatarUrl || placeholderAvatar}
          width={50}
          alt=""
        />
        <p>{chatData?.[0].users[1]?.displayName}</p>
      </div>
      <div className="w-full flex-1  h-full p-4 text-white overflow-y-auto flex flex-col gap-4">
        {messages?.map((message, idx) => (
          <div
            key={idx}
            className={`${
              message.userId === String(user?._id)
                ? "self-end bg-green-600/60"
                : "self-start bg-black/60"
            } flex flex-row py-2 px-4 max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-xl`}
          >
            <div className="flex flex-col w-full">
              <p className="break-words whitespace-normal">{message.content}</p>
              <p className="text-xs self-end">
                {adaptTimezone(message.createdAt, "ro-RO")}
              </p>
            </div>
          </div>
        ))}
        <TypingIndicator ref={scrollToBottomRef} userIsTyping={userIsTyping} />
      </div>

      <form
        onSubmit={handleSubmitMessage}
        className=" py-3 px-6 flex justify-center items-center gap-4 text-white border-t-slate-700 border-t-[1px]"
      >
        <label
          className="flex flex-col gap-2 cursor-pointer group"
          htmlFor="image"
        >
          <ImageIcon />
        </label>
        <input
          type="file"
          id="image"
          placeholder="Upload Image"
          className="hidden"
        />
        <EmojiPicker getValue={(emoji) => setMessage(message + emoji)}>
          😏
        </EmojiPicker>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          className="w-full p-2 bg-black/40 rounded-xl"
        />
        <button type="submit" className="px-2 py-1 rounded-full group">
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
