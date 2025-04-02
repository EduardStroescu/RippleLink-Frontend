import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { CallNotification } from "@/components/call/CallNotification";
import { useAppStore, useAppStoreActions } from "@/stores/useAppStore";
import { useUserStore } from "@/stores/useUserStore";

export function Layout({ children }: { children: React.ReactNode }) {
  const user = useUserStore((state) => state.user);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const { appBackground, appTint, appGlow } = useAppStore(
    useShallow((state) => ({
      appBackground: state.appBackground,
      appTint: state.appTint,
      appGlow: state.appGlow,
    }))
  );
  const { setAppBackground, setAppTint, setAppGlow, resetAppStore } =
    useAppStoreActions();

  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Auth middleware to redirect to login page if the user is not authenticated
  useEffect(() => {
    if (pathname === "/" || pathname === "/login" || pathname === "/register") {
      return;
    }

    if (!user) {
      navigate({ to: "/", replace: true });
    }
  }, [navigate, user, pathname]);

  // Sync app colors with user settings
  useEffect(() => {
    if (user?.settings) {
      user.settings?.backgroundImage &&
        setAppBackground(user?.settings?.backgroundImage);
      user.settings?.tintColor && setAppTint(user?.settings?.tintColor);
      user.settings?.glowColor && setAppGlow(user?.settings?.glowColor);
    } else if (!user?.settings) {
      resetAppStore();
    }
  }, [resetAppStore, setAppBackground, setAppGlow, setAppTint, user?.settings]);

  // Load the background image and trigger fade effect after it's loaded
  useEffect(() => {
    if (!appBackground) return;

    const img = new Image();
    img.src = appBackground;
    img.onload = () => {
      setBackgroundLoaded(true);
    };
  }, [appBackground]);

  return (
    <div
      style={{ backgroundImage: `url(${appBackground})` }}
      className="relative flex flex-col h-[100dvh] bg-cover bg-center justify-center overflow-hidden"
    >
      <div
        className={`${backgroundLoaded && appBackground !== "/background.jpg" ? "opacity-0" : "opacity-100"} transition-opacity duration-1000
          bg-[url('/background.jpg')] bg-cover bg-center absolute inset-0 z-1`}
      />
      <main
        className="md:shadow-xl w-full md:w-[90%] bg-black/40 md:shadow-cyan-500/50 h-full md:h-[90%] self-center border-slate-700 sm:border-[1px] sm:rounded backdrop-blur"
        style={{
          backgroundColor: appTint,
          boxShadow: `0 10px 15px -3px ${appGlow}, 0 4px 6px -2px ${appGlow}`,
        }}
      >
        {children}
      </main>
      <CallNotification />
    </div>
  );
}
