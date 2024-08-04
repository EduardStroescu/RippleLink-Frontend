import { User } from "@/types/user";
import { useEffect } from "react";

export function useMessageFilters(
  interlocutor: User | undefined,
  setIsInterlocutorOnline: React.Dispatch<React.SetStateAction<boolean>>
) {
  // useEffect(() => {
  //   if (interlocutor?.status)
  //     setIsInterlocutorOnline(interlocutor?.status?.online);
  // }, []);
}
