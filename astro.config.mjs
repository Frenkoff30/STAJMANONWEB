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
   * Serverové jsou jen dvě věci: redakční systém (/keystatic, /api/keystatic)
   * a rezervace jízdáren (/rezervace/*). Obojí má `prerender: false`.
   */
  adapter: vercel(),

  /**
   * Odmítne POST z cizí domény. Bez toho by šlo z podvržené stránky odeslat
   * jménem přihlášeného člena rezervaci nebo změnu údajů.
   */
  security: {
    checkOrigin: true,
  },

  integrations: [
    sitemap({
      // Do mapy webu patří kalendář, ne přihlašování a administrace.
      filter: (page) =>
        !page.includes('/keystatic') &&
        !/\/rezervace\/./.test(page),
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
