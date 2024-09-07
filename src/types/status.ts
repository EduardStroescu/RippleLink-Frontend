import { User } from "./user";

export interface Status {
  _id?: string;
  userId?: User["_id"];
  online?: boolean;
  statusMessage?: string;
  lastSeen?: string;
}
