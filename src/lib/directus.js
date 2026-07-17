// Client minimale per Directus (lettura in fase di build).
// Se nelle env c'è DIRECTUS_TOKEN (Secrets di Vercel), le chiamate sono autenticate
// col token read-only del build-bot: così l'API pubblica anonima può essere spenta.
// Senza token si ricade sulla chiamata anonima (utile finché la lettura Public è attiva).
// NB: le env impostate su Vercel arrivano in process.env (import.meta.env copre
// solo i file .env locali) → si leggono entrambe.
const API =
  import.meta.env.DIRECTUS_URL || process.env.DIRECTUS_URL || 'https://opalescent-hoatzin.pikapod.net';
const TOKEN = import.meta.env.DIRECTUS_TOKEN || process.env.DIRECTUS_TOKEN;

if (!TOKEN) {
  console.warn('[directus] Nessun DIRECTUS_TOKEN nelle env: chiamate anonime (ok solo se la lettura Public è attiva).');
}

async function dGet(path) {
  const headers = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
  const res = await fetch(API + path, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Directus ${res.status} su ${path} — token ${TOKEN ? 'PRESENTE' : 'ASSENTE'} — ${body.slice(0, 300)}`
    );
  }
  const json = await res.json();
  return json.data;
}

const ED = 1; // edizione "Le Guaite del Gusto 2026"

// Edizione (hero della home / programma)
export function getEdition() {
  return dGet(
    `/items/editions/${ED}?fields=id,title_it,title_en,subtitle_it,subtitle_en,` +
    `abstract_it,abstract_en,start_date,end_date`
  );
}

// Iniziative del PROGRAMMA (senza circuito) — gli appuntamenti "a orario"
export function getProgramme() {
  return dGet(
    `/items/initiatives?filter[edition][_eq]=${ED}` +
    `&filter[circuit][_null]=true&filter[status][_eq]=published&sort=sort` +
    `&fields=id,title_it,title_en,abstract_it,abstract_en,description_it,description_en,` +
    `price_info,booking_url,is_featured`
  );
}

// PROPOSTE speciali (con circuito e luogo) — overlay a tempo sui POI
export function getProposals() {
  return dGet(
    `/items/initiatives?filter[edition][_eq]=${ED}` +
    `&filter[circuit][_nnull]=true&filter[status][_eq]=published&sort=sort&limit=-1` +
    `&fields=id,title_it,title_en,subtitle_it,subtitle_en,abstract_it,abstract_en,` +
    `description_it,description_en,booking_url,` +
    `circuit.id,circuit.name_it,circuit.name_en,circuit.slug,circuit.sort,` +
    `place.id,place.name,place.city,place.google_maps_url`
  );
}

// POI / LUOGHI — tutti i punti fissi del territorio (anche senza proposta)
export function getPlaces() {
  return dGet(
    `/items/places?filter[status][_eq]=published&sort=sort&limit=-1` +
    `&fields=id,name,city,place_type,google_maps_url,description_it,description_en,phone`
  );
}

// Circuiti (le categorie del gusto)
export function getCircuits() {
  return dGet(
    `/items/circuits?filter[edition][_eq]=${ED}&filter[status][_eq]=published&sort=sort` +
    `&fields=id,name_it,name_en,description_it,description_en,slug`
  );
}

// URL di un asset (immagine) di Directus a partire dall'id file
export const assetUrl = (id) => (id ? `${API}/assets/${id}` : '');

// Versione OTTIMIZZATA (webp + ridimensionata) servita da Directus: riduce ~10x
// il peso e quindi la banda del PikaPods free. width = larghezza max in px.
export const assetImg = (id, width = 1000) =>
  id ? `${API}/assets/${id}?width=${width}&format=webp&quality=80` : '';

// Riscrive le immagini dentro il corpo HTML della news aggiungendo la
// trasformazione Directus (webp + resize). Gli URL salvati sono "puliti" (niente query).
const ASSET_RE = /(https:\/\/opalescent-hoatzin\.pikapod\.net\/assets\/[a-f0-9-]+)(?!\?)/gi;
export function optimizeBodyImages(html, width = 1000) {
  if (!html) return html;
  return html.replace(ASSET_RE, `$1?width=${width}&format=webp&quality=80`);
}

// NEWS — articoli pubblicati destinati a QUESTO sito (Perla).
// Una news è "di Perla" se il sito principale (home_site) è Perla OPPURE
// se Perla è tra i target_sites ("esce anche qui"). Filtro per slug del sito.
const PERLA_SLUG = 'la-perla-dei-sibillini';

export function getArticles() {
  return dGet(
    `/items/articles?filter[status][_eq]=published` +
    `&filter[_or][0][home_site][slug][_eq]=${PERLA_SLUG}` +
    `&filter[_or][1][target_sites][sites_id][slug][_eq]=${PERLA_SLUG}` +
    // legacy: news senza sito assegnato = di Perla (era l'unico sito con le news)
    `&filter[_or][2][home_site][_null]=true` +
    `&sort=-publish_at,-date_created&limit=-1` +
    `&fields=id,title_it,title_en,slug,abstract_it,abstract_en,date_created,publish_at,` +
    `cover_image,category.name_it,category.name_en`
  );
}

export async function getArticle(slug) {
  const rows = await dGet(
    `/items/articles?filter[slug][_eq]=${encodeURIComponent(slug)}` +
    `&filter[status][_eq]=published&limit=1` +
    `&fields=id,title_it,title_en,slug,abstract_it,abstract_en,body_it,body_en,date_created,publish_at,` +
    `cover_image,category.name_it,category.name_en,author.name`
  );
  return (rows && rows[0]) || null;
}
