import { Message } from "./message";
import { User } from "./user";

type OngoingCall = {
  chatId: string;
  participants: { userId: User; signal: string }[];
} | null;

export type Chat = {
  _id: string;
  name: string;
  type: "dm" | "group";
  users: User[] | [];
  lastMessage: Message;
  ongoingCall: OngoingCall;
  createdAt: string;
  updatedAt: string;
};
