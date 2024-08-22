import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { useAppStore, useAppStoreActions } from "@/stores/useAppStore";
import { useUserStore, useUserStoreActions } from "@/stores/useUserStore";
import { User } from "@/types/user";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export function Layout({ children }: { children: React.ReactNode }) {
  const { getItem } = useLocalStorage<User>("user");
  const { setUser } = useUserStoreActions();
  const user = useUserStore((state) => state.user);
  const { appBackground, appTint, appGlow } = useAppStore(
    useShallow((state) => ({
      appBackground: state.appBackground,
      appTint: state.appTint,
      appGlow: state.appGlow,
    }))
  );
  const { setAppBackground, setAppTint, setAppGlow, resetAppStore } =
    useAppStoreActions();
  const navigate = useNavigate();

  useEffect(() => {
    const user = getItem();
    if (user) {
      setUser(user as User);
      navigate({ to: "/chat", replace: true });
    } else {
      navigate({ to: "/", replace: true });
    }
  }, []);

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

  return (
    <div
      style={{ backgroundImage: `url(${appBackground})` }}
      className="top-0 left-0 flex flex-col h-[100dvh] bg-cover bg-center justify-center overflow-hidden"
    >
      <main
        className="md:shadow-xl w-full md:w-[90%] bg-black/40 md:shadow-cyan-500/50 h-full md:h-[90%] self-center border-slate-700 sm:border-[1px] sm:rounded backdrop-blur"
        style={{
          backgroundColor: appTint,
          boxShadow: `0 10px 15px -3px ${appGlow}, 0 4px 6px -2px ${appGlow}`,
        }}
      >
        {children}
      </main>
    </div>
  );
}
