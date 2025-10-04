import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Explicitly configure for React 19
      jsxRuntime: 'automatic',
      babel: {
        plugins: []
      }
    }),
    {
      name: 'healthcheck',
      configureServer(server) {
        server.middlewares.use('/healthz', (_req, res) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('ok');
        });
      }
    }
  ],
  server: {
    // Move dev server to 3005 to avoid clashes with other local apps & relax strictPort
    port: 3005,
    host: true,
    open: false,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8080/api/v1',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // React core in its own chunk
          react: ['react', 'react-dom'],
          // Router separated
          router: ['react-router-dom'],
          // Animation libs
          motion: ['framer-motion'],
          // Data / state libs
          state: ['zustand', '@tanstack/react-query'],
          // Utilities
          utils: ['axios', 'uuid', 'clsx', 'date-fns', 'zod'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  base: '/'
})
