import { Chat } from "./chat";
import { PublicUser } from "./user";

export type Call = {
  _id: string;
  chatId: Chat;
  participants: {
    userId: PublicUser;
    offers?: { to: PublicUser["_id"]; sdp: string; iceCandidates: string[] }[];
    answers?: { to: PublicUser["_id"]; sdp: string; iceCandidates: string[] }[];
  }[];
};
