import { defineConfig } from 'astro/config';

// Sito statico (SSG): i dati di Directus vengono letti in fase di build.
// Ad ogni deploy il sito si rigenera con i contenuti aggiornati.
// (In futuro si potrà passare a SSR/ISR con adapter Vercel per l'aggiornamento istantaneo.)
export default defineConfig({
  site: 'https://test.laperladeisibillini.it',
});
