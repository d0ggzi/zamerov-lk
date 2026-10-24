/// <reference types="vitest/config" />
import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    // Слушать на всех интерфейсах (0.0.0.0), чтобы dev-сервер был доступен
    // с других устройств в локальной сети по http://<IP-этой-машины>:5173.
    // API-запросы (/api/*) проксируются этим же сервером на backend/chat,
    // поэтому другим устройствам открывать порты 8000/8090 не нужно.
    host: true,
    proxy: {
      '/api/chat': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/api': {
        // Бэкенд (uvicorn) слушает 127.0.0.1:8000. Используем явный IPv4-адрес,
        // т.к. backend биндится только на IPv4, а 'localhost' в Node может
        // зарезолвиться в IPv6 (::1) → ECONNREFUSED → прокси отдаёт 500.
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
  },
})