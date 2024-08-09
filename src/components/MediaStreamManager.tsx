// components/MediaStreamManager.js
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import { useUserStore } from "@/stores/useUserStore";
import { useEffect } from "react";

const MediaStreamManager = ({ children }: { children: React.ReactNode }) => {
  const user = useUserStore((state) => state.user);
  const currentCall = useCallStore((state) => state.currentCall);
  const { addStream } = useCallStoreActions();

  useEffect(() => {
    const startLocalStream = async () => {
      if (!user?._id) return;
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: {
            autoGainControl: false,
            channelCount: 2,
            echoCancellation: false,
            noiseSuppression: false,
            sampleRate: 48000,
            sampleSize: 16,
          },
        });
        addStream(user._id, stream);
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };

    if (currentCall) {
      startLocalStream();
    }
  }, [currentCall]);

  return <>{children}</>;
};

export default MediaStreamManager;
