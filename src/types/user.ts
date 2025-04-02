import { Settings } from "./settings";
import { Status } from "./status";

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  access_token?: string;
  refresh_token?: string;
  status?: Status;
  chats?: string[] | [];
  settings?: Settings;
  updatedAt?: string;
  createdAt?: string;
}

export interface PublicUser
  extends Pick<User, "_id" | "displayName" | "avatarUrl" | "status"> {}
