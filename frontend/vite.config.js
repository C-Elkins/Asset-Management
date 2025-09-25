import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
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
    outDir: 'dist'
  },
  base: '/'
})
