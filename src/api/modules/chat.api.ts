import privateClient from "@/api/privateClient";
import { Call } from "@/types/call";
import { Chat } from "@/types/chat";
import { Message } from "@/types/message";
import { Status } from "@/types/status";
import { PublicUser } from "@/types/user";

const chatEndpoints = {
  getAllChats: "chats/all",
  getAllCalls: "calls/all",
  getChatById: "chats/:chatId",
  getSharedFilesByChatId: "chats/sharedFiles/:chatId",
  getMessagesByChatId: "messages/:chatId",
  getInterlocutorStatus: "status/:userId",
  createChat: "chats",
  updateChat: "chats/:chatId",
  deleteChat: "chats/:chatId",
};

export const chatApi = {
  getAllChats: async (): Promise<Chat[] | []> =>
    await privateClient.get(chatEndpoints.getAllChats),

  getAllCalls: async (): Promise<Call[] | []> =>
    await privateClient.get(chatEndpoints.getAllCalls),

  getChatById: async (chatId: string): Promise<Chat[] | []> =>
    await privateClient.get(
      chatEndpoints.getChatById.replace(":chatId", chatId)
    ),
  getMessagesByChatId: async (
    chatId: Chat["_id"],
    cursor: string | null
  ): Promise<{ messages: Message[] | []; nextCursor: string | null }> => {
    if (cursor) {
      return await privateClient.get(
        chatEndpoints.getMessagesByChatId.replace(":chatId", chatId) +
          "?cursor=" +
          cursor
      );
    } else {
      return await privateClient.get(
        chatEndpoints.getMessagesByChatId.replace(":chatId", chatId)
      );
    }
  },

  createChat: async (chatData: {
    userIds: PublicUser["_id"][];
    lastMessage: { content: Message["content"]; type: Message["type"] };
    type: Chat["type"];
    name?: Chat["name"];
  }): Promise<Chat> =>
    await privateClient.post(chatEndpoints.createChat, chatData),

  getSharedFilesByChatId: async (chatId: string): Promise<Message[] | []> =>
    await privateClient.get(
      chatEndpoints.getSharedFilesByChatId.replace(":chatId", chatId)
    ),

  updateChat: async (
    chatId: Chat["_id"],
    chatData: { name?: Chat["name"] }
  ): Promise<Chat> =>
    await privateClient.patch(
      chatEndpoints.updateChat.replace(":chatId", chatId),
      chatData
    ),

  deleteChat: async (chatId: string): Promise<{ success: string }> =>
    await privateClient.delete(
      chatEndpoints.deleteChat.replace(":chatId", chatId)
    ),

  getInterlocutorStatus: async (userId: PublicUser["_id"]): Promise<Status> => {
    return await privateClient.get(
      chatEndpoints.getInterlocutorStatus.replace(":userId", userId)
    );
  },
};
