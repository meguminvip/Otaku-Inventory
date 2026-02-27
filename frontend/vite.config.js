import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Author: A.R.O.N.A
 */

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['megumin.vip', 'api.megumin.vip'],
    proxy: {
      '/api': {
        target: 'http://localhost:3012',
        changeOrigin: true
      }
    }
  }
});
