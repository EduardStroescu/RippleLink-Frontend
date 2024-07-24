import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "../components/SignUpForm";

export const Route = createFileRoute("/signup")({
  component: () => (
    <div className="w-full h-full flex flex-col justify-center items-center gap-20 text-white">
      <h1 className="text-7xl">Register</h1>
      <SignUpForm />
    </div>
  ),
});
