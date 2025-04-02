import { PublicUser, User } from "@/types/user";

type BaseMessage = {
  _id: string;
  chatId: string;
  senderId: PublicUser;
  readBy: {
    userId: { _id: User["_id"]; displayName: User["displayName"] };
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type TextMessage = BaseMessage & {
  content: string;
  type: "text" | "event";
};

export type FileMessage = BaseMessage & {
  content: {
    type: "image" | "file" | "video" | "audio";
    fileId: string;
    content: string;
  }[];
  type: "file";
};

export type Message = TextMessage | FileMessage;
export type PartialMessage = Partial<TextMessage> | Partial<FileMessage>;
