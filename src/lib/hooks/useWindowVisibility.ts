import { useEffect, useState } from "react";

export function useWindowVisibility() {
  const [isWindowActive, setIsWindowActive] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsWindowActive(!document.hidden); // Whether tab is hidden
    };

    const handleWindowFocus = () => {
      setIsWindowActive(true); // Window is focused
    };

    const handleWindowBlur = () => {
      setIsWindowActive(false); // Window is blurred
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  return isWindowActive;
}
