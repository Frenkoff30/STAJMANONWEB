// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.stajmanon.cz',
  trailingSlash: 'ignore',

  /**
   * Web zůstává statický — všechny stránky se předgenerují při buildu.
   * Adaptér je tu jen kvůli redakčnímu systému: /keystatic a /api/keystatic
   * jsou jediné dvě serverové cesty (mají `prerender: false`).
   */
  adapter: vercel(),

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/keystatic'),
    }),
    react(),
    keystatic(),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // Virtuální moduly Astra a Keystaticu esbuild při předbalování neumí
      // rozklíčovat — vyřeší se až za běhu přes pluginy.
      exclude: ['virtual:keystatic-config', 'astro:env/server'],
    },
  },
  image: {
    // Fotky ze staré galerie jsou velké — Sharp je při buildu převede na WebP.
    responsiveStyles: true,
  },
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
