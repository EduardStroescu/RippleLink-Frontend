import { createFileRoute, Link } from "@tanstack/react-router";
import { LoginForm, BackIcon, DemoAccountLoginPanel } from "@/components";

export const Route = createFileRoute("/login")({
  component: () => (
    <div className="w-full h-full flex flex-col justify-evenly items-center text-white overflow-y-auto overflow-x-hidden py-10 px-4">
      <div className="flex flex-col gap-8 items-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-7xl text-wrap text-center">Log In</h1>
          <Link className="text-blue-500 flex items-center group gap-2" to="/">
            <BackIcon />
            <p className="translate-y-[-1px]">Back Home</p>
          </Link>
        </div>
        <LoginForm />
        <DemoAccountLoginPanel />
      </div>
    </div>
  ),
});
