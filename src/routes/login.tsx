import { createFileRoute, Link } from "@tanstack/react-router";
import { LoginForm, BackIcon } from "@/components";

export const Route = createFileRoute("/login")({
  component: () => (
    <div className=" w-full h-full flex flex-col justify-center items-center gap-16 text-white overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-7xl">Log In</h1>
        <Link className="text-blue-500 flex items-center group gap-2" to="/">
          <BackIcon />
          <p className="translate-y-[-1px]">Back Home</p>
        </Link>
      </div>
      <LoginForm />
    </div>
  ),
});
