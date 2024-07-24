import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";
import { Layout } from "../components/Layout";

export const Route = createRootRouteWithContext()({
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
