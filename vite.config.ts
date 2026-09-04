import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      includeAssets: ['favicon.svg', 'pwa.svg'],
      manifest: {
        name: 'KuchniaPlan',
        short_name: 'KuchniaPlan',
        description:
          'Planowanie produkcji gastronomicznej dla hoteli, cateringu eventowego i dietetycznego.',
        theme_color: '#087f8c',
        background_color: '#f6f8f8',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    pool: 'threads',
    setupFiles: './src/test/setup.ts',
  },
})
