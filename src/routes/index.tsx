import { useEffect } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useUserStore } from "@/stores/useUserStore";
import { DemoAccountLoginPanel } from "@/components";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.history.push("/chat");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id="index"
      className="flex flex-col justify-center items-center gap-6 sm:gap-10 h-full text-white p-4 overflow-hidden overflow-y-auto"
    >
      <div className="w-full flex flex-col gap-4 sm:gap-10">
        <img
          src="/rippleLink.png"
          alt="RippleLink logo"
          className="max-w-[300px] sm:max-w-[400px] self-center object-cover bg-center"
        />
        <div className="flex flex-row gap-10 justify-center items-center">
          <Link
            to="/login"
            className="text-center min-w-[120px] shadow-lg shadow-cyan-500/50 text-neutral-300 hover:text-white bg-neutral-950 hover:bg-black rounded px-6 py-2 text-xl"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="text-center min-w-[120px] shadow-lg shadow-cyan-500/50 text-neutral-300 hover:text-white bg-neutral-950 hover:bg-black rounded px-6 py-2 text-xl"
          >
            Register
          </Link>
        </div>
      </div>
      <DemoAccountLoginPanel />
    </div>
  );
}
