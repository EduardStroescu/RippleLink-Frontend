import { useQuery } from "@tanstack/react-query";
import { create } from "mutative";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useSetTanstackCache } from "@/lib/hooks/useSetTanstackCache";
import { useSocketSubscription } from "@/lib/hooks/useSocketSubscription";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import { useUserStore } from "@/stores/useUserStore";
import { Call } from "@/types/call";

export function useCallEvents(callsQuery: {
  queryKey: string[];
  queryFn: () => Promise<Call[]>;
  placeholderData: never[];
  enabled: boolean;
}) {
  const user = useUserStore((state) => state.user);
  const { data: calls } = useQuery(callsQuery);
  const { incomingCalls, currentCall, joiningCall } = useCallStore(
    useShallow((state) => ({
      incomingCalls: state.incomingCalls,
      currentCall: state.currentCall,
      joiningCall: state.joiningCall,
    }))
  );
  const { setCurrentCall, addIncomingCall, removeIncomingCall } =
    useCallStoreActions();
  const setCallsCache = useSetTanstackCache<Call[]>(["calls", user?._id]);

  // Set up call notifications if users got online after the call started and also for after access_token refreshes, time in which the user stops receiving socket events
  useEffect(() => {
    if (!calls || !user?._id) return;
    calls.forEach((call) => {
      if (
        useCallStore
          .getState()
          .incomingCalls.some(
            (incomingCall) => incomingCall.chatId._id === call.chatId._id
          ) ||
        call.participants.find(
          (participant) => participant.userId._id === user?._id
        )?.status !== "notified"
      )
        return;
      addIncomingCall(call);
    });
  }, [addIncomingCall, calls, user?._id]);

  const notifyUserOfIncomingCall = useCallback(
    (content: Call) => {
      const currentUser = content.participants.find(
        (participant) => participant.userId._id === user?._id
      );

      if (
        joiningCall === content.chatId._id ||
        currentUser?.status !== "notified"
      )
        return;

      addIncomingCall(content);
    },
    [addIncomingCall, joiningCall, user?._id]
  );

  const handleCallsUpdated = useCallback(
    ({ content }: { content: Call }) => {
      if (content.status === "ongoing") {
        setCallsCache((prev) => {
          if (!prev) return [content]; // Initialize with new content if prev is null/undefined

          return create(prev, (draft) => {
            const index = draft.findIndex(
              (item) => item.chatId._id === content.chatId._id
            );

            if (index === -1) {
              draft.push(content);
            } else {
              draft[index] = content;
            }
          });
        });

        if (content.chatId._id === currentCall?.chatId._id) {
          setCurrentCall(content);
        } else {
          notifyUserOfIncomingCall(content);
        }
      } else {
        setCallsCache((prev) => {
          if (!prev) return [];
          return prev.filter((call) => call._id !== content._id);
        });

        if (
          incomingCalls.some(
            (call) => call && call.chatId._id === content.chatId._id
          )
        ) {
          removeIncomingCall(content.chatId._id);
        }
      }
    },
    [
      setCallsCache,
      currentCall,
      setCurrentCall,
      notifyUserOfIncomingCall,
      incomingCalls,
      removeIncomingCall,
    ]
  );

  useSocketSubscription("callsUpdated", handleCallsUpdated);
}
