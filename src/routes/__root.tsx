import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";
import { Layout } from "../components/Layout";
import { QueryClient } from "@tanstack/react-query";

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
      {/* <TanStackRouterDevtools /> */}
      <ScrollRestoration />
    </Layout>
  );
}
