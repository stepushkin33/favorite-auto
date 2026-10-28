import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: env.API_PROXY_TARGET
        ? { '/api': { target: env.API_PROXY_TARGET, changeOrigin: true } }
        : undefined,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      restoreMocks: true,
      clearMocks: true,
    },
  };
});
