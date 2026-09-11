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
   * Astro tu na Vercelu porovnává hlavičku Origin s adresou, na kterou žádost
   * dorazila na serveru — a ty se tam kvůli tomu, jak Vercel žádosti předává,
   * neshodují, takže by to blokovalo i běžné přihlášení z vlastního webu.
   * Ochranu proti cizím POST požadavkům dál drží cookie `sameSite: 'lax'`
   * (viz src/lib/supabase.ts) — ta se na jinou doménu nepošle.
   */
  security: {
    checkOrigin: false,
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
