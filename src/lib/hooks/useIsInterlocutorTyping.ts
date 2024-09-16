import { useCallback, useEffect, useState } from "react";
import { useSocketSubscription } from "./useSocketSubscription";
import { User } from "@/types";

export function useIsInterlocutorTyping({
  interlocutors,
  params,
}: {
  interlocutors: User[] | undefined;
  params;
}) {
  const [interlocutorIsTyping, setInterlocutorIsTyping] =
    useState<boolean>(false);

  useEffect(() => {
    // State doesn't reset as Tanstack Router reuses components nested under the same route - see dynamic routes
    setInterlocutorIsTyping(false);
  }, [params.chatId]);

  const handleInterlocutorTyping = useCallback(
    ({
      content,
    }: {
      content: {
        user: { _id: User["_id"]; displayName: string };
        isTyping: boolean;
      };
    }) => {
      const isTypingUserInCurrentChat = interlocutors?.some(
        (person) => person._id === content.user._id
      );
      if (isTypingUserInCurrentChat) {
        setInterlocutorIsTyping(content.isTyping);
      }
    },
    [interlocutors]
  );
  useSocketSubscription("interlocutorIsTyping", handleInterlocutorTyping);

  return { interlocutorIsTyping };
}