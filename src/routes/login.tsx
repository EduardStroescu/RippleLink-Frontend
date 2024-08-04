import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/LoginForm";

export const Route = createFileRoute("/login")({
  component: () => (
    <div className=" w-full h-full flex flex-col justify-center items-center gap-20 text-white">
      <h1 className="text-7xl">Log In</h1>
      <LoginForm />
    </div>
  ),
});
