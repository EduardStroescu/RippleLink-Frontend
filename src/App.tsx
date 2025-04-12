import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { ErrorComponent } from "@/components/ErrorComponent.tsx";
import { Toaster } from "@/components/ui/Toaster.tsx";

import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: false,
  defaultErrorComponent: () => <ErrorComponent />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      {/* Only enable in dev mode to inspect query state */}
      {/* <ReactQueryDevtools /> */}
    </QueryClientProvider>
  );
}
