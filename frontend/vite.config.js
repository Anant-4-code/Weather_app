import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  
  return {
    base: isProduction ? '/Weather-app/' : '/',
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: './index.html'
        }
      }
    },
    publicDir: 'public'
  };
});
