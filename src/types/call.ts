import { Chat } from "./chat";
import { User } from "./user";

export type Call = {
  _id: string;
  chatId: Chat;
  participants: {
    userId: User;
    offers?: { to: User["_id"]; sdp: string; iceCandidates: string[] }[];
    answers?: { to: User["_id"]; sdp: string; iceCandidates: string[] }[];
  }[];
};
