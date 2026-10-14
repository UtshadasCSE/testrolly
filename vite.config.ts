import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { handleApiRequest } from './server/apiHandler';

// Vite Plugin for server-side /api endpoints
function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Protect private interview data from unauthorized public HTTP access
        if (req.url && (req.url.includes('/data/test.json') || req.url.endsWith('test.json'))) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'FORBIDDEN', message: 'Direct access to raw interview data is forbidden.' }));
          return;
        }

        if (req.url && req.url.startsWith('/api/')) {
          const handled = await handleApiRequest(req, res);
          if (handled) return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
