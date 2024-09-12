import { User } from "./user";

export type Message = {
  _id: string;
  chatId: string;
  senderId: User;
  content: string;
  type: "text" | "image" | "file" | "video" | "audio";
  read: boolean;
  readAt?: string;
  createdAt?: string;
  updatedAt?: string;
};
