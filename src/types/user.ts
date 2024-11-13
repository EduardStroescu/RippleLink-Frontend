import { Chat } from "./chat";
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
  refreshToken?: string;
  status?: Status;
  chats?: Chat[] | [];
  settings?: Settings;
  updatedAt?: string;
  createdAt?: string;
}

export interface PublicUser
  extends Pick<User, "_id" | "displayName" | "avatarUrl" | "status"> {}
