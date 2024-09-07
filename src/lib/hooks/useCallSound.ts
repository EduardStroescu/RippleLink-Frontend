import { useRef } from "react";

export const useCallSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/call.mp3");
    }
    if (audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.loop = true;
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

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return { playSound, stopSound };
};
