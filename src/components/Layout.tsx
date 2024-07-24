import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { useUserStore, useUserStoreActions } from "@/stores/useUserStore";
import { User } from "@/types/interfaces";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { getItem } = useLocalStorage("user");
  const { setUser } = useUserStoreActions();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const user = getItem();
    if (user) {
      setUser(user as User);
    }
  }, []);

  const background = user?.background ? user.background : "/background.png";
  return (
    <>
      <nav className="px-6 w-full bg-black text-white h-[40px] flex flex-row justify-between items-center">
        {[
          ["/", "Home"],
          ["/chat", "Chat"],
          ["/chat/settings", "Settings"],
        ].map(([to, label]) => {
          return (
            <Link key={to as string} to={to}>
              {label}
            </Link>
          );
        })}
      </nav>
      <div
        style={{ backgroundImage: `url(${background})` }}
        className="flex flex-col h-[calc(100vh-40px)] bg-cover bg-center justify-center"
      >
        <main className="w-[90%] h-[90%] self-center border-slate-700 border-[1px] rounded bg-black/40 backdrop-blur">
          {children}
        </main>
      </div>
    </>
  );
}
