import { useEffect, useRef } from "react";

const useNotificationSound = (url: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current === null) {
      audioRef.current = new Audio(url);
    }
  }, [url]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return playSound;
};

export default useNotificationSound;
