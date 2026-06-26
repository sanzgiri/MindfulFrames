import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Two test projects: client (React/jsdom) and server (Express/node).
// Kept separate from vite.config.ts because that config sets root=client/,
// which doesn't suit the server tests.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [react()],
        test: {
          name: "client",
          environment: "jsdom",
          globals: true,
          root: path.resolve(import.meta.dirname, "client"),
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
          setupFiles: ["./src/test/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "server",
          environment: "node",
          globals: true,
          include: ["server/**/*.{test,spec}.ts"],
        },
      },
    ],
  },
});
