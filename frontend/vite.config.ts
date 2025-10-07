import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Direct mapping for UI barrel to avoid directory resolution issues
      {
        find: /^@\/components\/ui$/,
        replacement: fileURLToPath(
          new URL("./src/shared/components/ui", import.meta.url),
        ),
      },
      // More specific aliases first
      {
        find: /^@\/components\//,
        replacement: fileURLToPath(
          new URL("./src/shared/components/", import.meta.url),
        ),
      },
      {
        find: /^@\/hooks\//,
        replacement: fileURLToPath(
          new URL("./src/shared/hooks/", import.meta.url),
        ),
      },
      {
        find: /^@\/utils\//,
        replacement: fileURLToPath(
          new URL("./src/shared/utils/", import.meta.url),
        ),
      },
      {
        find: /^@\/types(\/|$)/,
        replacement: fileURLToPath(new URL("./src/types/", import.meta.url)),
      },
      {
        find: /^@\/features\//,
        replacement: fileURLToPath(new URL("./src/features/", import.meta.url)),
      },
      {
        find: /^@\/app\//,
        replacement: fileURLToPath(new URL("./src/app/", import.meta.url)),
      },
      // Fallback: map @/ to src/
      {
        find: /^@\//,
        replacement: fileURLToPath(new URL("./src/", import.meta.url)),
      },
    ],
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    // Target modern browsers for smaller bundles
    target: "es2015",
    // Enable minification
    minify: "terser",
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "query-vendor": ["@tanstack/react-query"],
          "ui-vendor": ["framer-motion"],
          "chart-vendor": ["recharts"],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Generate sourcemaps for debugging (set to false in production)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "framer-motion",
    ],
  },
});
