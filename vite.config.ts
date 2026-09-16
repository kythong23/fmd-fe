import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    port: 5173,
    host: true,
    // Đổi cổng BE bằng VITE_API_PROXY trong .env, không phải sửa file này
    proxy: { '/api': loadEnv(mode, __dirname, '').VITE_API_PROXY || 'http://localhost:3001' },
  },
}));
