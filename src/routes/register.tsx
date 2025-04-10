import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { RegisterForm } from "@/components/forms/RegisterForm";
import { BackIcon } from "@/components/Icons";
import { useUserStore } from "@/stores/useUserStore";

export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    const user = useUserStore.getState().user;
    if (user) {
      throw redirect({
        to: "/chat",
        replace: true,
      });
    }
  },
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="w-full h-full flex flex-col justify-normal md:justify-evenly items-center text-white overflow-y-auto overflow-x-hidden py-10 px-4">
      <div className="flex flex-col gap-5 items-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-7xl text-wrap text-center">Register</h1>
          <Link className="text-blue-500 flex items-center group gap-2" to="/">
            <BackIcon />
            <span className="-translate-y-0.5">Back Home</span>
          </Link>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
