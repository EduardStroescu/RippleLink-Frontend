import { useCallback, useState } from "react";

import { useSocketSubscription } from "@/lib/hooks/useSocketSubscription";
import { PublicUser } from "@/types/user";

export function useIsInterlocutorTyping({
  interlocutors,
}: {
  interlocutors: PublicUser[] | undefined;
}) {
  const [interlocutorIsTyping, setInterlocutorIsTyping] =
    useState<boolean>(false);

  const handleInterlocutorTyping = useCallback(
    ({
      content,
    }: {
      content: {
        user: { _id: PublicUser["_id"]; displayName: string };
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
