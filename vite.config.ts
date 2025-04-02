import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      autoCodeSplitting: true,
    }),
    react(),
    tsconfigPaths(),
  ],
  base: "/",
  resolve: {
    alias: {
      "simple-peer": "simple-peer/simplepeer.min.js",
      "@": path.resolve(__dirname, "src"),
    },
  },
});
