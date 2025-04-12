import { PublicUser } from "@/types/user";

export interface Status {
  _id?: string;
  userId?: PublicUser["_id"];
  online?: boolean;
  statusMessage?: string;
  lastSeen?: string;
}
