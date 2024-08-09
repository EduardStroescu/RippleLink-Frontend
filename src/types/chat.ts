import { SignalData } from "simple-peer";
import { Message } from "./message";
import { User } from "./user";

type OngoingCall = {
  participants: { userId: User; signal: SignalData }[];
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
