import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { useAppStore, useAppStoreActions } from "@/stores/useAppStore";
import { useUserStoreActions } from "@/stores/useUserStore";
import { User } from "@/types/user";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export function Layout({ children }: { children: React.ReactNode }) {
  const { getItem } = useLocalStorage<User>("user");
  const { setUser } = useUserStoreActions();
  const { appBackground, appTint, appGlow } = useAppStore(
    useShallow((state) => ({
      appBackground: state.appBackground,
      appTint: state.appTint,
      appGlow: state.appGlow,
    }))
  );
  const { setAppBackground, setAppTint, setAppGlow } = useAppStoreActions();
  const navigate = useNavigate();

  useEffect(() => {
    const user = getItem();
    if (user) {
      setUser(user as User);
      !!user?.settings?.backgroundUrl &&
        setAppBackground(user?.settings?.backgroundUrl);
      !!user?.settings?.tintColor && setAppTint(user?.settings?.tintColor);
      !!user?.settings?.glowColor && setAppGlow(user?.settings?.glowColor);
      navigate({ to: "/chat", replace: true });
    } else {
      navigate({ to: "/", replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        style={{ backgroundImage: `url(${appBackground})` }}
        className="top-0 left-0 flex flex-col h-screen bg-cover bg-center justify-center overflow-hidden"
      >
        <main
          className="sm:shadow-xl w-full sm:w-[90%] bg-black/40 sm:shadow-cyan-500/50 h-full sm:h-[90%] self-center border-slate-700 border-[1px] rounded backdrop-blur"
          style={{
            backgroundColor: appTint,
            boxShadow: `0 10px 15px -3px ${appGlow}, 0 4px 6px -2px ${appGlow}`,
          }}
        >
          {children}
        </main>
      </div>
    </>
  );
}
