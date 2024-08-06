import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chat/$chatId/details")({
  component: () => <div>Hello /details!</div>,
});
