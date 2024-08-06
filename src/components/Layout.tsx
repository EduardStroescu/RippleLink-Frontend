import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { useUserStore, useUserStoreActions } from "@/stores/useUserStore";
import { User } from "@/types/user";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { getItem } = useLocalStorage("user");
  const { setUser } = useUserStoreActions();
  const user = useUserStore((state) => state.user);
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

  const background = user?.settings?.backgroundUrl
    ? user.settings.backgroundUrl
    : "https://r4.wallpaperflare.com/wallpaper/175/524/956/digital-digital-art-artwork-fantasy-art-drawing-hd-wallpaper-d8562dc820d0acd8506c415eb8e2a49a.jpg";
  return (
    <>
      <div
        style={{ backgroundImage: `url(${background})` }}
        className="flex flex-col h-screen bg-cover bg-center justify-center"
      >
        <main className="w-full sm:w-[90%] h-full sm:h-[90%] self-center border-slate-700 border-[1px] rounded bg-black/40 backdrop-blur">
          {children}
        </main>
      </div>
    </>
  );
}
