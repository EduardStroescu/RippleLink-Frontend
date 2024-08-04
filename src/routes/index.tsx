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
      className="flex flex-col justify-center items-center gap-20 h-full text-white p-4"
    >
      <h3 className="text-7xl">Welcome to RippleLink!</h3>
      <div className="flex flex-row gap-10 justify-center items-center">
        <Link
          to="/login"
          className="shadow-lg shadow-cyan-500/50 text-neutral-300 hover:text-white bg-neutral-950 hover:bg-black rounded px-6 py-2 text-xl"
        >
          Log In
        </Link>
        <Link
          to="/register"
          className="shadow-lg shadow-cyan-500/50 text-neutral-300 hover:text-white bg-neutral-950 hover:bg-black rounded px-6 py-2 text-xl"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
