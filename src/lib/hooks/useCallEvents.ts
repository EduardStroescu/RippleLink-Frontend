import { useSocketContext } from "@/providers/SocketProvider";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import { Call } from "@/types/call";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export function useCallEvents(calls: Call[] | [] | undefined) {
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();
  const { incomingCalls, currentCall, answeredCall, recentlyEndedCalls } =
    useCallStore(
      useShallow((state) => ({
        incomingCalls: state.incomingCalls,
        currentCall: state.currentCall,
        answeredCall: state.answeredCall,
        recentlyEndedCalls: state.recentlyEndedCalls,
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

  useEffect(() => {
    if (!socket) return;

    const callsUpdatedHandler = ({
      content,
    }: {
      content: Call & { callEnded: boolean };
    }) => {
      if (content.callEnded !== true) {
        setCalls((prev) => {
          if (!prev) return [content];
          const index = prev?.findIndex(
            (item) => item.chatId._id === content.chatId._id
          );
          if (index === -1) return [...prev, content];
          prev[index] = content;
          return [...prev];
        });
        removeRecentlyEndedCall(content.chatId._id);

        if (
          answeredCall &&
          currentCall &&
          content.chatId._id === currentCall.chatId._id
        ) {
          setCurrentCall(content);
        }

        if (
          content.chatId._id !== currentCall?.chatId._id &&
          !recentlyEndedCalls.some((call) => call._id === content._id)
        ) {
          addIncomingCall(content);
        }
      } else {
        setCalls((prev) => {
          if (!prev) return [];
          const newCalls = prev.filter((call) => call._id !== content._id);
          return [...newCalls];
        });

        if (
          incomingCalls.some(
            (call) => call && call.chatId._id === content.chatId._id
          )
        ) {
          removeIncomingCall(content.chatId._id);
        }
      }
    };

    socket.on("callsUpdated", callsUpdatedHandler);

    return () => {
      socket.off("callsUpdated");
    };
  }, [answeredCall, currentCall, incomingCalls, socket]);
}
