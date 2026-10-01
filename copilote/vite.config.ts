/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Copilote',
        short_name: 'Copilote',
        description: 'Le quiz oral à deux pour la route.',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F7F1E5',
        theme_color: '#F7F1E5',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // Contenu, polices et code précachés : l'app doit tourner sans réseau en voiture.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        navigateFallback: '/index.html',
        // Seuls les sous-ensembles latins des polices sont utiles (français) : inutile de précacher le reste.
        globIgnores: ['**/*-cyrillic*', '**/*-greek*', '**/*-vietnamese*'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/engine/**/*.ts'],
      exclude: ['src/engine/**/*.test.ts', 'src/engine/**/index.ts'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});
