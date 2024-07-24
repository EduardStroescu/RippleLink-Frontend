import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col justify-center items-center gap-10 h-full text-white p-4">
      <h3 className="text-5xl">Welcome to ChatApp!</h3>
      <div className="flex flex-row gap-4 justify-center items-center">
        <Link
          to="/login"
          className="text-neutral-300 hover:text-white bg-neutral-950 hover:bg-black rounded px-6 py-2"
        >
          Log In
        </Link>
        <Link
          to="/signup"
          className="text-neutral-300 hover:text-white bg-neutral-950 hover:bg-black rounded px-6 py-2"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
