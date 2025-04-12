import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { DemoAccountLoginPanel } from "@/components/DemoAccountLoginPanel";
import { LoginForm } from "@/components/forms/LoginForm";
import { BackIcon } from "@/components/Icons";
import { useUserStore } from "@/stores/useUserStore";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const user = useUserStore.getState().user;
    if (user) {
      throw redirect({
        to: "/chat",
        replace: true,
      });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="w-full h-full flex flex-col justify-evenly items-center text-white overflow-y-auto overflow-x-hidden py-10 px-4">
      <div className="flex flex-col gap-8 items-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-7xl text-wrap text-center">Log In</h1>
          <Link className="text-blue-500 flex items-center group gap-2" to="/">
            <BackIcon />
            <span className="-translate-y-0.5">Back Home</span>
          </Link>
        </div>
        <LoginForm />
        <DemoAccountLoginPanel />
      </div>
    </div>
  );
}
