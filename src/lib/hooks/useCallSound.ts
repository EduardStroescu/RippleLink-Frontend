import { useEffect, useRef } from "react";

const useCallSound = (url: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current === null) {
      audioRef.current = new Audio(url);
    }
  }, [url]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.loop = true;
      audioRef.current.play();
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return { playSound, stopSound };
};

export default useCallSound;
