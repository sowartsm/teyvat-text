import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: [
      '038f-2409-40e5-118-6223-14ec-7015-af18-b95f.ngrok-free.app' // 👈 your ngrok URL
    ],
  },
});