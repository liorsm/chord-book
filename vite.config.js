import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { youtubeSearchProxy } from './vite-youtube-proxy.js';
import { tab4uImportProxy } from './vite-tab4u-proxy.js';

export default defineConfig({
  base: '/chord-book/',
  plugins: [react(), youtubeSearchProxy(), tab4uImportProxy()],
  server: {
    port: 5173,
    open: true,
  },
});
