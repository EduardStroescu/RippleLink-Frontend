import { useRef } from "react";

const useNotificationSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/notification.mp3");
    }
    if (audioRef.current) {
      try {
        audioRef.current.play();
      } catch (e) {
        if (e) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      }
    }
  };

  return playSound;
};

export default useNotificationSound;
