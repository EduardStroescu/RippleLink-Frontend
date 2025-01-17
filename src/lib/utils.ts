import { useUserStore } from "@/stores/useUserStore";
import clsx, { ClassValue } from "clsx";
import { RgbaColor } from "react-colorful";
import { twMerge } from "tailwind-merge";
import { User, Chat } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAuthenticated(): boolean {
  try {
    const authData = window.localStorage.getItem("user");
    if (authData) {
      const parsedData: User = JSON.parse(authData);
      // Check if the parsed data contains the access_token property
      return (
        parsedData &&
        typeof parsedData.access_token === "string" &&
        parsedData.access_token.trim() !== ""
      );
    }
  } catch (error) {
    console.error("Error parsing localStorage item:", error);
  }
  return false;
}

export function getParsedPath(path: string) {
  if (/^\/chat$/.test(path)) {
    return "/chat";
  } else if (/^\/chat\/[a-zA-Z0-9]+$/.test(path)) {
    return "/chat/$chatId";
  } else if (/^\/chat\/[a-zA-Z0-9]+\/details$/.test(path)) {
    return "/chat/$chatId/details";
  } else {
    return "unknown_path";
  }
}

export const adaptTimezone = (date?: string, timezone?: string) => {
  if (!date) return "";
  if (!timezone) throw new Error("Timezone is required");

  const utcDate = new Date(date);
  const localDate = utcDate.toLocaleString(timezone).split(",")[1];
  return localDate;
};

export function rgbaStringToObject(rgbaString: string | undefined) {
  if (!rgbaString) return { r: 0, g: 0, b: 0, a: 1 };
  const regex = /rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),(0|1|0?\.\d+)\)/;
  const match = rgbaString.match(regex);

  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: parseFloat(match[4]),
    };
  } else {
    throw new Error(`Invalid RGBA string: ${rgbaString}`);
  }
}

export function ObjectToRgbaString(rgbaObject: RgbaColor | undefined) {
  if (!rgbaObject) return "rgba(0, 0, 0, 1)";
  return `rgba(${rgbaObject.r},${rgbaObject.g},${rgbaObject.b},${rgbaObject.a})`;
}

export const isImageUrl = (url: string) => {
  const imgUrlPattern =
    /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|tiff|svg)(?:\?.*)?$/i;
  return imgUrlPattern.test(url);
};
export const isVidUrlPattern = (url: string): boolean => {
  const vidUrlPattern =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch.*|playlist.*)|youtu\.be\/|vimeo\.com\/\d+|dailymotion\.com\/video\/\w+|facebook\.com\/[^/]+\/videos(?:\/\d+)?|twitch\.tv\/(videos\/\d+|[^/]+)|video\.twitch\.tv\/[^/]+|streamable\.com\/\w+|soundcloud\.com\/[\w-]+\/[\w-]+|soundcloud\.com\/[\w-]+\/sets\/[\w-]+)$/i;

  return vidUrlPattern.test(url);
};

export function checkIfChatExists(
  chatsData: Chat[],
  userIdsToCheckFor: string[]
) {
  const currentUser = useUserStore.getState().user;

  return chatsData?.find((chat) => {
    // Get all user IDs in the current chat, excluding the current user
    const chatUserIds = chat.users
      .filter((user) => user._id !== currentUser?._id)
      .map((user) => user._id);

    // Check if the chat users exactly match the provided user IDs
    const allUsersMatch =
      chatUserIds.length === userIdsToCheckFor.length &&
      chatUserIds.every((id) => userIdsToCheckFor.includes(id));

    return allUsersMatch;
  });
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const canEditMessage = (
  isOwnMessage: boolean,
  createdAt?: string,
  messageType?: string
): boolean => {
  if (!createdAt) return false;

  const messageCreatedAt = new Date(createdAt).getTime();
  const now = Date.now();

  // Calculate the difference in milliseconds and convert it to minutes
  const timeDifferenceInMinutes = (now - messageCreatedAt) / (1000 * 60);

  // Return true if the message is still within the allowed edit interval
  return (
    timeDifferenceInMinutes <= 15 && isOwnMessage && messageType === "text"
  );
};

export const bytesToMegabytes = (bytes: number) => {
  return Number((bytes / (1024 * 1024)).toFixed(1));
};

export const getGroupChatNamePlaceholder = (
  chatUsers: Chat["users"] | undefined
) => {
  const interlocutorsDisplayNames = chatUsers
    ?.map((user) => user?.displayName)
    ?.slice(0, 3)
    ?.join(", ");

  const placeholderChatName = `Group Chat: ${interlocutorsDisplayNames?.length ? interlocutorsDisplayNames : ""}`;

  return placeholderChatName;
};
