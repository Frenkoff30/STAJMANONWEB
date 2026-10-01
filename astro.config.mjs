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
   *
   * Výjimka je režim „připravujeme" (proměnná UDRZBA=1). Předgenerované
   * stránky obchází middleware — servírují se rovnou ze souborů —, takže by
   * se přes ně dalo projít i při zavřeném webu. Po dobu údržby proto necháme
   * všechno vykreslovat server a middleware má poslední slovo. Po vypnutí se
   * web vrátí ke statickému buildu.
   */
  output: process.env.UDRZBA === '1' ? 'server' : 'static',

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

    /**
     * Domény, kterým Astro na serveru věří. Bez nich ignoruje hlavičku Host
     * od Vercelu a adresa žádosti vyjde jako `https://localhost/…` — redakce
     * pak posílá GitHubu špatnou zpětnou adresu a přihlášení skončí chybou
     * „redirect_uri is not associated with this application".
     */
    allowedDomains: [
      { hostname: 'www.stajmanon.cz', protocol: 'https' },
      { hostname: 'stajmanon.cz', protocol: 'https' },
      { hostname: 'stajmanonweb.vercel.app', protocol: 'https' },
    ],
  },

  integrations: [
    sitemap({
      // Do mapy webu patří kalendář, ne přihlašování a administrace.
      filter: (page) =>
        !page.includes('/keystatic') &&
        !page.endsWith('/sprava/') && !page.endsWith('/sprava') &&
        !/\/rezervace\/./.test(page),
    }),
    react(),
    keystatic(),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      /**
       * Administrace je React aplikace, kterou Astro načítá až v prohlížeči
       * (`client:only`). Vite proto React při startu nenajde — objeví ho až
       * s prvním požadavkem na /keystatic, přebalí závislosti za běhu a tím
       * zneplatní adresy, které si stránka už stáhla. Výsledek je prázdná
       * bílá stránka a v konzoli „504 Outdated Optimize Dep".
       *
       * Vyjmenováním se React předbalí hned při startu serveru, takže se
       * za běhu nic nepřebaluje a administrace najede napoprvé.
       */
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],

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
