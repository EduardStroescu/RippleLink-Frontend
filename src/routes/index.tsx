import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

import { useUserStore } from "@/stores/useUserStore";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const user = useUserStore((state) => state.user);

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="flex flex-col justify-normal md:justify-evenly items-center h-full text-white py-10 px-4 overflow-hidden overflow-y-auto">
      <div className="flex flex-col gap-6 sm:gap-10">
        <div className="w-full flex flex-col gap-10">
          <img
            src="/rippleLink.png"
            alt="RippleLink logo"
            width={400}
            className="w-full max-w-[300px] lg:max-w-[400px] self-center object-contain object-center"
          />
          <div className="flex flex-row justify-evenly items-center">
            <Link
              to="/login"
              className="text-center min-w-[120px] shadow-lg shadow-cyan-500/50 text-neutral-300 hover:text-white bg-cyan-800 hover:bg-cyan-600 hover:shadow-cyan-400/50 transition-colors ease-in-out duration-700 rounded px-6 py-2 text-xl"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="text-center min-w-[120px] shadow-lg shadow-cyan-500/50 text-neutral-300 hover:text-white bg-cyan-800 hover:bg-cyan-600 hover:shadow-cyan-400/50 transition-colors ease-in-out duration-700 rounded px-6 py-2 text-xl"
            >
              Register
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-4 max-w-[500px]">
          <h1 className="text-2xl font-bold text-cyan-400 text-center">
            Welcome to RippleLink!🌟
          </h1>
          <p className="text-justify hyphens-auto leading-relaxed">
            Connect with friends, share unforgettable moments, and stay in the
            loop — all in one sleek, and customizable chat space. Whether you're
            dropping a quick message, sharing files, hopping on a group call, or
            enjoying rich media previews from your favorite platforms, we've got
            you covered. Dive into smooth, real-time conversations with
            lightning-fast sync, personalized themes, and a vibrant community.
          </p>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-300">
              Ready to chat your way? 🚀
            </p>
            <p className="text-lg font-medium text-cyan-400">
              Join now and experience messaging as it should be!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
