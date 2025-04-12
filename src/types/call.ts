import { Chat } from "@/types/chat";
import { PublicUser } from "@/types/user";

export type Call = {
  _id: string;
  chatId: Chat;
  participants: {
    userId: PublicUser;
    offers?: { to: PublicUser["_id"]; sdp: string; iceCandidates: string[] }[];
    answers?: { to: PublicUser["_id"]; sdp: string; iceCandidates: string[] }[];
    status: "notified" | "inCall" | "rejected";
  }[];
  status: "ongoing" | "ended";
};
