import { Message } from "@/types/message";
import { PublicUser } from "@/types/user";

export type Chat = {
  _id: string;
  name: string;
  type: "dm" | "group";
  users: PublicUser[];
  lastMessage: Message;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
};
