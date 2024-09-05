import { useRef } from "react";

const useCallSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/call.mp3");
      audioRef.current.volume = 1;
      audioRef.current.loop = true;
    }

    if (audioRef.current) {
      try {
        // Create a user gesture
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Audio is playing
            })
            .catch((error) => {
              // Handle error
              console.error("Playback failed:", error);
              audioRef.current?.pause();
              audioRef.current = null;
            });
        }
      } catch (e) {
        console.error("Error playing sound:", e);
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset playback position
    }
  };

  return { playSound, stopSound };
};

export default useCallSound;
