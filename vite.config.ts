import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['mapbox-gl'],
    esbuildOptions: {
      mainFields: ['module', 'main']
    }
  },
  define: {
    global: 'globalThis',
  }
});
// gomma 
