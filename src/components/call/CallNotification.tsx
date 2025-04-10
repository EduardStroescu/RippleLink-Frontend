import { useRouter } from "@tanstack/react-router";
import { memo, useEffect } from "react";

import { CallIcon, CloseIcon } from "@/components/Icons";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/Toast";
import { groupAvatar, placeholderAvatar } from "@/lib/const";
import { useCallSound } from "@/lib/hooks/useCallSound";
import { useThrottle } from "@/lib/hooks/useThrottle";
import { getGroupChatNamePlaceholder } from "@/lib/utils";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import { useUserStore } from "@/stores/useUserStore";
import { Call } from "@/types/call";

export const CallNotification = memo(function CallNotification() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const incomingCalls = useCallStore((state) => state.incomingCalls);
  const { answerCall, rejectCall } = useCallStoreActions();
  const { playSound, stopSound } = useCallSound();

  const getCurrentChatCaller = (call: Call) => {
    if (!call || !user?._id) return;
    const chatType = call.chatId.type;
    if (chatType === "group") {
      const placeholderChatName = getGroupChatNamePlaceholder(
        call.chatId.users
      );

      return {
        avatarUrl: groupAvatar,
        displayName:
          call.chatId.name.trim().length > 0
            ? call.chatId.name
            : placeholderChatName,
      };
    } else {
      const caller = call.chatId.users.find(
        (chatUser) => chatUser._id !== user._id
      );
      return caller;
    }
  };

  const handleCallAnswer = (call: Call) => {
    if (!call) return;
    answerCall(call);
    stopSound();
    router.navigate({
      to: "/chat/$chatId",
      params: { chatId: call.chatId._id },
    });
  };

  const handleRejectCall = (call: Call) => {
    if (!call || !call.chatId._id) return;
    rejectCall(call);
    stopSound();
  };

  const throttledCallNotification = useThrottle(() => {
    playSound();
  }, 1000);

  useEffect(() => {
    if (incomingCalls.length) {
      throttledCallNotification();
    } else {
      stopSound();
    }
  }, [incomingCalls.length, stopSound, throttledCallNotification]);

  const handleOpenChange = (call: Call) => {
    handleRejectCall(call);
    stopSound();
  };

  return (
    <ToastProvider duration={Infinity}>
      {incomingCalls.map((call: (typeof incomingCalls)[number]) => {
        const currentChatCaller = getCurrentChatCaller(call);
        return (
          <Toast
            key={call.chatId._id}
            onOpenChange={() => handleOpenChange(call)}
            className="bg-black/70 rounded-xl p-2 px-3 flex items-center gap-2 overflow-hidden
            data-[state=open]:sm:slide-in-from-top-full
            "
          >
            <div className="flex items-center gap-1 w-full">
              <AvatarCoin
                source={currentChatCaller?.avatarUrl || placeholderAvatar}
                width={40}
                alt="Chat Avatar"
                className="pointer-events-none"
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
                title="Reject Call"
                aria-label="Reject Call"
                className="group p-2 bg-red-950 rounded-full hover:bg-red-900"
              >
                <CloseIcon className="w-[15px] h-[15px]" />
              </button>
            </div>
          </Toast>
        );
      })}
      <ToastViewport className="sm:bottom-auto sm:right-[calc(50/100*100vw)] sm:translate-x-1/2 sm:top-0 sm:flex-col-reverse md:max-w-[420px]" />
    </ToastProvider>
  );
});
