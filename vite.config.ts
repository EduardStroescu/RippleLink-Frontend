import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), react(), tsconfigPaths()],
  resolve: {
    alias: {
      "simple-peer": "simple-peer/simplepeer.min.js",
      "@": path.resolve(__dirname, "src"),
    },
  },
});
