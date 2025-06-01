import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = command === 'build';
  
  return {
    // This will be the base path for all assets
    base: isProduction ? '/Weather-app/' : '/',
    
    plugins: [react()],
    
    // Development server configuration
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          // Ensure consistent file naming for better caching
          entryFileNames: 'assets/js/[name]-[hash].js',
          chunkFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // Organize assets by type
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (['png', 'jpe?g', 'svg', 'gif', 'webp'].includes(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (['woff', 'woff2', 'eot', 'ttf', 'otf'].includes(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          }
        }
      }
    },
    
    // Public directory for static assets
    publicDir: 'public',
    
    // Resolve configuration
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    
    // Environment variables
    define: {
      'process.env': { ...env, BASE_URL: JSON.stringify(env.BASE_URL || (isProduction ? '/Weather-app/' : '/')) }
    }
  };
});
