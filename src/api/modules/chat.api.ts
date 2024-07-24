import privateClient from "../privateClient";

const chatEndpoints = {
  getAllChats: "chats/all",
  getChatById: "chats/:chatId",
  getMessagesByChatId: "messages/chatId",
  createChat: "chats",
  deleteChat: "chats",
};

const chatApi = {
  getAllChats: async () => {
    try {
      const response = await privateClient.get(chatEndpoints.getAllChats);
      return response;
    } catch (error) {
      return { error };
    }
  },

  getChatById: async (chatId: string) => {
    try {
      const response = await privateClient.get(
        chatEndpoints.getChatById.replace(":chatId", chatId)
      );
      return response;
    } catch (error) {
      return { error };
    }
  },

  getMessagesByChatId: async (chatId: string) => {
    try {
      const response = await privateClient.get(
        chatEndpoints.getMessagesByChatId.replace("chatId", chatId)
      );
      return response;
    } catch (error) {
      return { error };
    }
  },
};

export default chatApi;
