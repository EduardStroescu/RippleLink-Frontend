import { createFileRoute, Link } from "@tanstack/react-router";
import { RegisterForm, BackIcon } from "@/components";

export const Route = createFileRoute("/register")({
  component: () => (
    <div className="w-full h-full flex flex-col justify-normal md:justify-evenly items-center text-white overflow-y-auto overflow-x-hidden py-10 px-4">
      <div className="flex flex-col gap-5 items-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-7xl text-wrap text-center">Register</h1>
          <Link className="text-blue-500 flex items-center group gap-2" to="/">
            <BackIcon />
            <p className="translate-y-[-1px]">Back Home</p>
          </Link>
        </div>
        <RegisterForm />
      </div>
    </div>
  ),
});
