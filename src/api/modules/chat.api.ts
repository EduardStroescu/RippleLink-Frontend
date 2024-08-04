import { Chat } from "@/types/chat";
import privateClient from "../privateClient";
import { Message } from "@/types/message";

const chatEndpoints = {
  getAllChats: "chats/all",
  getChatById: "chats/:chatId",
  getMessagesByChatId: "messages/:chatId",
  createChat: "chats",
  deleteChat: "chats/:chatId",
};

const chatApi = {
  getAllChats: async (): Promise<Chat[] | []> => {
    return await privateClient.get(chatEndpoints.getAllChats);
  },

  getChatById: async (chatId: string): Promise<Chat[] | []> => {
    return await privateClient.get(
      chatEndpoints.getChatById.replace(":chatId", chatId)
    );
  },

  getMessagesByChatId: async (chatId: string): Promise<Message[] | []> => {
    return await privateClient.get(
      chatEndpoints.getMessagesByChatId.replace(":chatId", chatId)
    );
  },

  createChat: async (chatData: {
    userId: string;
    lastMessage: string;
    type?: string;
    name?: string;
    messageType?: string;
  }): Promise<Chat> => {
    return await privateClient.post(chatEndpoints.createChat, chatData);
  },

  deleteChat: async (chatId: string): Promise<{ success: string }> => {
    return await privateClient.delete(
      chatEndpoints.deleteChat.replace(":chatId", chatId)
    );
  },
};

export default chatApi;
