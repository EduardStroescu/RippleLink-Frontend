import { User } from "./user";

export interface Status {
  _id?: string;
  userId?: User;
  online?: boolean;
  statusMessage?: string;
  lastSeen?: string;
}
