import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Sito statico (SSG): i dati di Directus vengono letti in fase di build.
// Ad ogni deploy il sito si rigenera con i contenuti aggiornati.
// (In futuro si potrà passare a SSR/ISR con adapter Vercel per l'aggiornamento istantaneo.)

// Sostituisce __BUILD__ in sw.js con un timbro univoco ad ogni build:
// così la cache del service worker cambia versione ad ogni release e i client
// installati (PWA) si aggiornano al primo accesso.
function swVersion() {
  return {
    name: 'sw-version',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const sw = fileURLToPath(new URL('./sw.js', dir));
        const stamp = Date.now().toString(36);
        writeFileSync(sw, readFileSync(sw, 'utf8').replaceAll('__BUILD__', stamp));
        logger.info(`sw.js -> cache perla-astro-${stamp} (${sw})`);
      },
    },
  };
}

export default defineConfig({
  // NB: al cutover del dominio va portato a 'https://www.laperladeisibillini.it'
  // (guida canonical, og:url, sitemap e robots.txt).
  site: 'https://test.laperladeisibillini.it',
  integrations: [sitemap(), swVersion()],
});
