import clsx, { ClassValue } from "clsx";
import { RgbaColor } from "react-colorful";
import { twMerge } from "tailwind-merge";

import { toast } from "@/components/ui/use-toast";
import { CHUNK_SIZE } from "@/lib/const";
import { ContentPreview } from "@/lib/hooks/useCreateMessage";
import { isAuthenticatedSchema } from "@/lib/zodSchemas/isAuthenticated.schema";
import { useAppStore } from "@/stores/useAppStore";
import { useUserStore } from "@/stores/useUserStore";
import { Chat } from "@/types/chat";
import { FileMessage, Message } from "@/types/message";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAuthenticated() {
  try {
    const authData = useUserStore.getState().user;
    const user = isAuthenticatedSchema.parse(authData);
    if (user) {
      // Check if the parsed data contains the access_token and refresh_token properties
      return (
        user.access_token.trim() !== "" && user.refresh_token.trim() !== ""
      );
    }
  } catch (_) {
    /* empty */
  }
  useUserStore.getState().actions.removeUser();
  window.localStorage.removeItem("user");
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

export const getLocalDate = (date: string | undefined, timezone: string) => {
  if (!date) return { date: "", time: "" };
  if (!timezone) throw new Error("Timezone is required");

  const utcDate = new Date(date);
  const localDate = utcDate.toLocaleString(timezone);
  return {
    date: localDate.split(",")[0].trim(),
    time: localDate.split(",")[1].trim().slice(0, 5),
  };
};

export const getLastMessageDate = (
  date: string | undefined,
  timezone: string
) => {
  if (!date) return "";
  if (!timezone) throw new Error("Timezone is required");

  const currentDate = new Date();
  const localDate = new Date(date);

  // Check if the date is today
  const isToday = currentDate.toDateString() === localDate.toDateString();

  if (isToday) {
    // Return just the time (HH:mm) if it's today
    return getLocalDate(date, timezone).time;
  }

  // Check if the date is in the current week
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the current week (Sunday)

  const isSameWeek = localDate >= startOfWeek && localDate <= currentDate;

  if (isSameWeek) {
    // If it's the same week, return the day name, except for yesterday
    const daysAgo = Math.floor(
      (currentDate.getTime() - localDate.getTime()) / (1000 * 3600 * 24)
    );

    if (daysAgo === 1) {
      return "Yesterday";
    }

    // Return the day name (e.g., "Monday")
    return localDate.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Europe/Bucharest",
    });
  }

  // If it's not in the current week, return the dd/ww/yy format
  return getLocalDate(date, timezone).date;
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

  return chatsData.find((chat) => {
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
  message: Message
): boolean => {
  if (!message.createdAt) return false;

  const messageCreatedAt = new Date(message.createdAt).getTime();
  const now = Date.now();

  // Calculate the difference in milliseconds and convert it to minutes
  const timeDifferenceInMinutes = (now - messageCreatedAt) / (1000 * 60);

  const isTextMessage = message.type === "text";
  const isGif = isTextMessage && isImageUrl(message.content);

  // Return true if the message is still within the allowed edit interval
  return (
    timeDifferenceInMinutes <= 15 && isOwnMessage && isTextMessage && !isGif
  );
};

export const bytesToMegabytes = (bytes: number) => {
  return Number((bytes / (1024 * 1024)).toFixed(1));
};

export const getGroupChatNamePlaceholder = (chatUsers: Chat["users"]) => {
  const interlocutorsDisplayNames = chatUsers
    .map((user) => user.displayName)
    .slice(0, 3)
    .join(", ");

  const placeholderChatName = `Group Chat: ${interlocutorsDisplayNames?.length ? interlocutorsDisplayNames : ""}`;

  return placeholderChatName;
};

/**
 * Returns the user's media devices. Split into default devices, output devices, and input devices.
 */
export const getUserDevices = async () => {
  try {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const defaultDevices = allDevices
      .filter((device) => device.label.includes("Default"))
      .map((device) => ({
        deviceId: device.deviceId,
        kind: device.kind,
        groupId: device.groupId,
        label: device.label.replace("Default - ", ""),
      })) as MediaDeviceInfo[];

    const inputDevices = allDevices.filter(
      (device) =>
        device.kind === "audioinput" && !device.label.includes("Default")
    );
    const outputDevices = allDevices.filter(
      (device) =>
        device.kind === "audiooutput" && !device.label.includes("Default")
    );
    return { defaultDevices, outputDevices, inputDevices };
  } catch (err) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Cound not access the media devices.",
    });
  }
};

/**
 * Returns whether the message is the first message of the day. In order to display the date tag.
 */
export const getLastMessagesOfDay = (messages: Message[]) => {
  if (!messages.length) return [];
  const lastMessagesOfDay: number[] = [];
  let currMessageDate = new Date(messages[0].createdAt).toDateString();

  // Iterate over the messages and compare their dates
  for (let i = 1; i < messages.length; i++) {
    const currentMessage = messages[i];
    const previousMessage = messages[i - 1];

    currMessageDate = new Date(currentMessage.createdAt).toDateString();
    const previousMessageDate = new Date(
      previousMessage.createdAt
    ).toDateString();

    // If the current message's date is different from the previous message's date,
    // the previous message is the last message of the day
    if (currMessageDate !== previousMessageDate) {
      lastMessagesOfDay.push(i); // Store the index of the last message of the day (1-based)
    }
  }

  // The last message of the last day is always the last message in the list
  lastMessagesOfDay.push(messages.length); // Add the last message as the last one of the final day

  return lastMessagesOfDay;
};

export const lerp = (start: number, end: number, alpha: number): number => {
  return start + (end - start) * alpha;
};

/**
  Chunks files and uploads them to the server in parallel
*/
export const chunkFilesAndUpload = async (
  message: FileMessage,
  files: ContentPreview
) => {
  const socketEmit = useAppStore.getState().actions.socketEmit;

  files.forEach((file, idx) => {
    const { fileBlob, name } = file;
    const totalChunks = Math.ceil(fileBlob.size / CHUNK_SIZE);
    const fileId = message.content[idx].fileId;

    for (let index = 0; index < totalChunks; index++) {
      const chunk = fileBlob.slice(
        index * CHUNK_SIZE,
        (index + 1) * CHUNK_SIZE
      );

      socketEmit(
        "sendChunkedFile",
        {
          message,
          fileId,
          name,
          chunk,
          index,
          totalChunks,
        },
        undefined,
        { timeout: index === totalChunks - 1 ? 60 * 1000 : 1000 }
      );
    }
  });
};
