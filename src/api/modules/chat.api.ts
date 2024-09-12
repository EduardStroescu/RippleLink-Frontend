import privateClient from "../privateClient";
import { Chat, Message, Call, Status } from "@/types";

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

const chatApi = {
  getAllChats: async (): Promise<Chat[] | []> => {
    return await privateClient.get(chatEndpoints.getAllChats);
  },

  getAllCalls: async (): Promise<Call[] | []> => {
    return await privateClient.get(chatEndpoints.getAllCalls);
  },

  getChatById: async (chatId: string): Promise<Chat[] | []> => {
    return await privateClient.get(
      chatEndpoints.getChatById.replace(":chatId", chatId)
    );
  },

  getMessagesByChatId: async (
    chatId: string,
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
    userIds: string[];
    lastMessage: string;
    type?: string;
    name?: string;
    messageType?: string;
  }): Promise<Chat> => {
    return await privateClient.post(chatEndpoints.createChat, chatData);
  },

  getSharedFilesByChatId: async (chatId: string): Promise<Message[] | []> => {
    return await privateClient.get(
      chatEndpoints.getSharedFilesByChatId.replace(":chatId", chatId)
    );
  },

  updateChat: async (
    chatId: string,
    chatData: { name?: string }
  ): Promise<Chat> => {
    return await privateClient.patch(
      chatEndpoints.updateChat.replace(":chatId", chatId),
      chatData
    );
  },

  deleteChat: async (chatId: string): Promise<{ success: string }> => {
    return await privateClient.delete(
      chatEndpoints.deleteChat.replace(":chatId", chatId)
    );
  },

  getInterlocutorStatus: async (
    userId?: string
  ): Promise<Status | undefined> => {
    if (!userId) return;
    return await privateClient.get(
      chatEndpoints.getInterlocutorStatus.replace(":userId", userId)
    );
  },
};

export default chatApi;
