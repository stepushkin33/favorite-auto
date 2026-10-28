import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

import { createNodeGateway } from './server/node-gateway.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gateway = createNodeGateway({
    apiKey: env.FAVORIT_API_KEY,
    upstreamUrl: env.FAVORIT_API_URL,
  });

  return {
    plugins: [
      react(),
      {
        name: 'favorit-gateway',
        configureServer(server) {
          server.middlewares.use((request, response, next) => {
            if (
              new URL(request.url, 'http://localhost').pathname === '/api/parts'
            )
              return gateway(request, response);
            next();
          });
        },
      },
    ],
    define: {
      'import.meta.env.VITE_API_MODE': JSON.stringify(
        mode === 'demo' || mode === 'test'
          ? 'demo'
          : env.VITE_API_MODE || 'live'
      ),
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      restoreMocks: true,
      clearMocks: true,
    },
  };
});
