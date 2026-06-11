import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { youtubeSearchProxy } from './vite-youtube-proxy.js';
import { tab4uImportProxy } from './vite-tab4u-proxy.js';

export default defineConfig({
  base: '/chord-book/',
  plugins: [
    react(),
    youtubeSearchProxy(),
    tab4uImportProxy(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['chordbook-logo.png'],
      manifest: {
        name: 'ChordBook - אקורדים',
        short_name: 'ChordBook',
        description:
          'מצאו אקורדים לשירים ישראליים — ChordBook, ספר האקורדים שלכם.',
        theme_color: '#7c3aed',
        background_color: '#1a0033',
        display: 'standalone',
        lang: 'he',
        dir: 'rtl',
        start_url: '/chord-book/',
        scope: '/chord-book/',
        icons: [
          {
            src: 'chordbook-logo.png',
            sizes: '532x521',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
        navigateFallback: '/chord-book/index.html',
        navigateFallbackDenylist: [/^\/chord-book\/(import|api)\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    open: true,
  },
});
