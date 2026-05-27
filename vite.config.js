import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { youtubeSearchProxy } from './vite-youtube-proxy.js';

export default defineConfig({
  base: '/chord-book/',
  plugins: [react(), youtubeSearchProxy()],
  server: {
    port: 5173,
    open: true,
  },
});
