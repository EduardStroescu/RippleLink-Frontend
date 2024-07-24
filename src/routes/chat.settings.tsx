import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chat/settings")({
  component: () => <div>Hello /settings!</div>,
});
