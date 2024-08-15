import { Message } from "./message";
import { User } from "./user";

export type Chat = {
  _id: string;
  name: string;
  type: "dm" | "group";
  users: User[] | [];
  lastMessage: Message;
  createdAt: string;
  updatedAt: string;
};
