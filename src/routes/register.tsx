import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "../components/RegisterForm";

export const Route = createFileRoute("/register")({
  component: () => (
    <div className="w-full h-full flex flex-col justify-center items-center gap-4 text-white overflow-y-auto overflow-x-hidden">
      <h1 className="text-7xl">Register</h1>
      <RegisterForm />
    </div>
  ),
});
