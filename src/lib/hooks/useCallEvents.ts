import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useUserStore } from "@/stores/useUserStore";
import { useSocketSubscription } from "./useSocketSubscription";
import { useThrottle } from "./useThrottle";
import { useSetCallsCache } from "./useSetCallsCache";
import { create } from "mutative";
import { Call } from "@/types";

export function useCallEvents() {
  const user = useUserStore((state) => state.user);
  const { incomingCalls, currentCall, recentlyEndedCalls, joiningCall } =
    useCallStore(
      useShallow((state) => ({
        incomingCalls: state.incomingCalls,
        currentCall: state.currentCall,
        recentlyEndedCalls: state.recentlyEndedCalls,
        joiningCall: state.joiningCall,
      }))
    );
  const {
    setCurrentCall,
    addIncomingCall,
    removeIncomingCall,
    removeRecentlyEndedCall,
  } = useCallStoreActions();
  const setCallsCache = useSetCallsCache();

  const debouncedCallNotification = useThrottle((content: Call) => {
    addIncomingCall(content);
  }, 10000);

  const notifyUserOfIncomingCall = useCallback(
    (content: Call) => {
      if (
        content._id === currentCall?._id &&
        joiningCall === content.chatId._id
      )
        return;

      const currentCallParticipantsOfferToCurrUser =
        content.participants?.every((participant) =>
          participant.offers?.some(
            (offer) => offer.to === user?._id && offer.iceCandidates.length > 0
          )
        );
      if (
        content.chatId._id !== currentCall?.chatId._id &&
        !recentlyEndedCalls.some((call) => call._id === content._id) &&
        currentCallParticipantsOfferToCurrUser
      ) {
        debouncedCallNotification(content);
      }
    },
    [
      currentCall?._id,
      currentCall?.chatId._id,
      debouncedCallNotification,
      joiningCall,
      recentlyEndedCalls,
      user?._id,
    ]
  );

  const handleCallsUpdated = useCallback(
    ({ content }: { content: Call & { callEnded: boolean } }) => {
      if (content.callEnded !== true) {
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

        if (currentCall && content.chatId._id === currentCall.chatId._id) {
          setCurrentCall(content);
        }

        notifyUserOfIncomingCall(content);
      } else {
        setCallsCache((prev) => {
          if (!prev) return [];
          return prev.filter((call) => call._id !== content._id);
        });
        setTimeout(() => {
          removeRecentlyEndedCall(content.chatId._id);
        }, 500);

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
      removeRecentlyEndedCall,
      incomingCalls,
      removeIncomingCall,
    ]
  );

  useSocketSubscription("callsUpdated", handleCallsUpdated);
}
