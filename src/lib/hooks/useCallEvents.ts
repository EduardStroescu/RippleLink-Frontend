import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import { Call } from "@/types/call";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useUserStore } from "@/stores/useUserStore";
import { useSocketSubscription } from "./useSocketSubscription";
import { useThrottle } from "./useThrottle";

export function useCallEvents(calls: Call[] | [] | undefined) {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const {
    incomingCalls,
    currentCall,
    answeredCall,
    recentlyEndedCalls,
    joiningCall,
  } = useCallStore(
    useShallow((state) => ({
      incomingCalls: state.incomingCalls,
      currentCall: state.currentCall,
      answeredCall: state.answeredCall,
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

  const setCalls = useCallback(
    (updateFunction: (prevcalls: typeof calls) => typeof calls) => {
      queryClient.setQueryData(["calls"], (prevCalls: typeof calls) => {
        return updateFunction(prevCalls);
      });
    },
    [queryClient]
  );

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
        setCalls((prev) => {
          if (!prev) return [content]; // Initialize with new content if prev is null/undefined

          // Find the index of the item to be updated or removed
          const index = prev.findIndex(
            (item) => item.chatId._id === content.chatId._id
          );

          if (index === -1) {
            // Item not found, add it to the list
            return [...prev, content];
          }

          // Replace the old call with the updated content
          return prev.map((item) =>
            item.chatId._id === content.chatId._id ? { ...content } : item
          );
        });

        if (
          answeredCall &&
          currentCall &&
          content.chatId._id === currentCall.chatId._id
        ) {
          setCurrentCall(content);
        }

        notifyUserOfIncomingCall(content);
      } else {
        setCalls((prev) => {
          if (!prev) return [];
          return prev.filter((call) => call._id !== content._id);
        });
        removeRecentlyEndedCall(content.chatId._id);

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
      setCalls,
      answeredCall,
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
