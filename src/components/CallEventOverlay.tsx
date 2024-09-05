import React, { useEffect } from "react";
import { CallIcon, CloseIcon } from "./Icons";
import { AvatarCoin } from "./ui/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";
import { useCallContext } from "@/providers/CallProvider";
import { Chat } from "@/types/chat";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import { useUserStore } from "@/stores/useUserStore";
import { useRouter } from "@tanstack/react-router";
import { Call } from "@/types/call";
import { useThrottle } from "@/lib/hooks/useThrottle";
import useCallSound from "@/lib/hooks/useCallSound";

interface CallEventOverlayProps {
  chats: Chat[] | [] | undefined;
  open?: boolean;
}

export const CallEventOverlay: React.FC<CallEventOverlayProps> = ({
  chats,
  open,
}) => {
  const user = useUserStore((state) => state.user);
  const incomingCalls = useCallStore((state) => state.incomingCalls);
  const { answerCall } = useCallContext();
  const router = useRouter();
  const { removeIncomingCall, addRecentlyEndedCall } = useCallStoreActions();
  const { playSound, stopSound } = useCallSound();

  const getCurrentChatCaller = (call: Call) => {
    if (!call || !user?._id) return;
    const currentChat = chats?.find((chat) => chat._id === call.chatId._id);
    const caller = currentChat?.users?.find(
      (chatUser) => chatUser._id !== user._id
    );
    return caller;
  };

  const handleCallAnswer = (call: Call) => {
    if (call) {
      answerCall(call);
      stopSound();
      removeIncomingCall(call.chatId._id);
      router.navigate({
        to: "/chat/$chatId",
        params: { chatId: call.chatId._id },
      });
    }
  };

  const handleRejectCall = (call: Call) => {
    if (!call || !call.chatId._id) return;
    removeIncomingCall(call.chatId._id);
    stopSound();
    addRecentlyEndedCall(call);
  };

  const throttledCallNotification = useThrottle(() => {
    playSound();
  }, 1000);

  useEffect(() => {
    if (incomingCalls.length && open) {
      throttledCallNotification();
    } else {
      stopSound();
    }
  }, [incomingCalls, stopSound, throttledCallNotification, open]);

  return (
    <>
      {!!incomingCalls.length &&
        incomingCalls.map((call) => {
          const currentChatCaller = getCurrentChatCaller(call);
          return (
            <div
              key={call?.chatId?._id}
              className="bg-black/70 rounded-xl p-2 px-3 flex items-center gap-2 w-full overflow-hidden"
            >
              <div className="flex items-center gap-1 w-full">
                <AvatarCoin
                  source={currentChatCaller?.avatarUrl || placeholderAvatar}
                  width={40}
                  alt="Chat Avatar"
                />
                <p className="truncate max-w-[9rem]">
                  {currentChatCaller?.displayName}
                </p>
                <span className="text-nowrap">is calling</span>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleCallAnswer(call)}
                  className="group p-2 bg-green-950 rounded-full hover:bg-green-900"
                >
                  <CallIcon width="15px" height="15px" />
                </button>
                <button
                  onClick={() => handleRejectCall(call)}
                  className="group p-2 bg-red-950 rounded-full hover:bg-red-900"
                >
                  <CloseIcon width="15px" height="15px" />
                </button>
              </div>
            </div>
          );
        })}
    </>
  );
};
