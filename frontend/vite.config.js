import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react({
      // Explicitly configure for React 19
      jsxRuntime: "automatic",
      babel: {
        plugins: [],
      },
    }),
    {
      name: "healthcheck",
      configureServer(server) {
        server.middlewares.use("/healthz", (_req, res) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/plain");
          res.end("ok");
        });
      },
    },
  ],
  resolve: {
    alias: [
      // Map UI barrel import used across the app
      {
        find: /^@\/components\/ui$/,
        replacement: path.resolve(
          __dirname,
          "src/shared/components/ui/index.ts",
        ),
      },
      // Fallback: map @/ to src/
      { find: /^@\//, replacement: path.resolve(__dirname, "src/") },
    ],
  },
  server: {
    // Move dev server to 3005 to avoid clashes with other local apps & relax strictPort
    port: 3005,
    host: true,
    open: false,
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          // React core in its own chunk
          react: ["react", "react-dom"],
          // Router separated
          router: ["react-router-dom"],
          // Animation libs
          motion: ["framer-motion"],
          // Data / state libs
          state: ["zustand", "@tanstack/react-query"],
          // Utilities
          utils: ["axios", "uuid", "clsx", "date-fns", "zod"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  base: "/",
});
