import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'healthcheck',
      configureServer(server) {
        server.middlewares.use('/healthz', (req, res, next) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('ok');
        });
      }
    }
  ],
  server: {
    port: 3000,
    host: true,
    open: false,
    strictPort: true,
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
