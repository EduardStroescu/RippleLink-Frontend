import { DemoAccountLoginPanel } from "@/components/DemoAccountLoginPanel";
import { useUserStore } from "@/stores/useUserStore";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

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
  });

  return (
    <div
      id="index"
      className="flex flex-col justify-center items-center gap-10 h-full text-white p-4 overflow-hidden"
    >
      <div className="flex flex-col gap-10 -translate-y-8">
        <img
          src="/rippleLink.png"
          alt="RippleLink logo"
          className="min-w-[300px] max-w-[400px] object-cover bg-center"
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
