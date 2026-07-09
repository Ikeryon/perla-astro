# Perla dei Sibillini — sito Astro (Fase 1, ambiente di TEST)

Frontend in **Astro** che legge i contenuti reali da **Directus** (PikaPods) e li mostra
con l'identità visiva della PWA attuale. Va pubblicato su **`test.laperladeisibillini.it`**;
il sito pubblico attuale non si tocca.

## Cosa manca da aggiungere (asset)
Copia dal sito attuale (`la-perla-dei-sibillini`) dentro la cartella **`public/`** di questo
progetto:
- l'intera cartella **`images/`** → `public/images/`
- l'intera cartella **`fonts/`** → `public/fonts/`

(Alcuni asset sono già inclusi, ma copiando quelle due cartelle hai tutto: logo, hero,
logotype, badge Grand Tour, icone PWA, font.)

## Provare in locale (facoltativo)
Serve Node 18+.
```
npm install
npm run dev      # apre http://localhost:4321
```
`npm run build` genera il sito statico in `dist/` (i dati di Directus vengono letti durante
il build).

## Pubblicare su Vercel (test)
1. Crea un **nuovo repository GitHub** (es. `perla-sibillini-test`) e caricaci questo progetto.
2. Su **Vercel** → *Add New Project* → importa quel repo. Vercel riconosce Astro da solo
   (build `astro build`, output `dist`). Deploy.
3. In **Settings → Domains** del progetto Vercel aggiungi **`test.laperladeisibillini.it`**.
4. Dal pannello DNS del dominio, crea un record **CNAME**: `test` → `cname.vercel-dns.com`
   (Vercel ti mostra il valore esatto da usare).

## Note tecniche
- Sorgente dati: `src/lib/directus.js` (URL pubblico del pod). Nessun token: usa la lettura
  Public. Si può sovrascrivere l'URL con la variabile d'ambiente `DIRECTUS_URL`.
- Bilingue IT/EN: i testi escono con attributi `data-it`/`data-en` e il pulsante IT/EN
  (in `public/js/app.js`) li scambia — stesso meccanismo del sito attuale.
- I contenuti si aggiornano ad ogni **nuovo deploy** (build statico). In seguito si può
  passare a SSR/ISR con un webhook di Directus per l'aggiornamento automatico.
- Pagine: `/` (home), `/programma` (14 appuntamenti), `/gusto` (circuiti + proposte speciali).
