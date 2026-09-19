import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import os from 'node:os';

const PORT = 5173;

/**
 * IP LAN để QR quét bằng điện thoại trỏ đúng máy dev.
 * ponytail: ưu tiên dải 192.168.* vì máy này còn có adapter ảo/VPN (10.x) mà điện thoại không tới được.
 * Mạng công ty dùng 10.x thật -> set VITE_PUBLIC_URL trong .env.
 */
const lanIp = () => {
  const ips = Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i!.address);
  return ips.find((a) => a.startsWith('192.168.')) || ips[0];
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  // ponytail: chốt IP lúc start server; đổi mạng thì restart. Khi có domain -> set VITE_PUBLIC_URL trong .env
  process.env.VITE_PUBLIC_URL =
    env.VITE_PUBLIC_URL || (lanIp() ? `http://${lanIp()}:${PORT}` : '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    server: {
      port: PORT,
      // ponytail: bind mọi interface -> Vite in cả http://localhost:5173 và các dòng Network (IPv4 LAN cho QR).
      host: true,
      // Đổi cổng BE bằng VITE_API_PROXY trong .env, không phải sửa file này
      proxy: { '/api': env.VITE_API_PROXY || 'http://localhost:3001' },
    },
  };
});
