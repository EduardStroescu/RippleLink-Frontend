import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  component: () => {
    return (
      <section className="flex h-full w-full flex-col items-center justify-center gap-24">
        <h2 className="text-center text-7xl text-red-500">
          Oops! This page is unavailable!
        </h2>
        <Link
          to="/chat"
          className="rounded-xl bg-cyan-500 p-3 text-xl hover:bg-cyan-600"
        >
          Return Home
        </Link>
      </section>
    );
  },
});
