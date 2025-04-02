import { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";

import { Layout } from "@/components/Layout";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <Layout>
      <Outlet />
      {/* Only enable in dev mode to inspect router state */}
      {/* <TanStackRouterDevtools /> */}
      <ScrollRestoration />
    </Layout>
  );
}
