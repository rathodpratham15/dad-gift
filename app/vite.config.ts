import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-144x144.png',
        'screenshot1.png',
        'screenshot2.png',
        'robots.txt'
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(?:localhost|.*\.onrender\.com)\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}`;
              }
            }
          }
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        exclude: [
          // Exclude development files from precaching
          /^.*\?.*$/,  // Files with query parameters (like HMR)
          /^\/@.*$/,   // Vite development files
          /^.*\.map$/,  // Source maps
          /^.*hot-update.*$/,  // HMR files
        ]
      },
      manifest: {
        name: 'Dad Refined',
        short_name: 'DadRefined',
        description: 'A refined platform for real estate listings and management.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: 'screenshot1.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshot2.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      devOptions: {
        enabled: false, // Disable PWA in development to avoid workbox errors
      }
    })
  ]
});
