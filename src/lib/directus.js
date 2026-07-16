// Client minimale per Directus (lettura in fase di build).
// Se nelle env c'è DIRECTUS_TOKEN (Secrets di Vercel), le chiamate sono autenticate
// col token read-only del build-bot: così l'API pubblica anonima può essere spenta.
// Senza token si ricade sulla chiamata anonima (utile finché la lettura Public è attiva).
const API = import.meta.env.DIRECTUS_URL || 'https://opalescent-hoatzin.pikapod.net';
const TOKEN = import.meta.env.DIRECTUS_TOKEN;

async function dGet(path) {
  const headers = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
  const res = await fetch(API + path, { headers });
  if (!res.ok) {
    throw new Error(`Directus ${res.status} su ${path}`);
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

// NEWS — articoli pubblicati (i più recenti prima).
// Nota: relazioni (home_site, category, author, target_sites) verranno aggiunte in un secondo momento;
// per ora si mostrano tutti gli articoli pubblicati. Le pagine gestiscono già l'assenza di categoria.
export function getArticles() {
  return dGet(
    `/items/articles?filter[status][_eq]=published` +
    `&sort=-date_created&limit=-1` +
    `&fields=id,title_it,title_en,slug,abstract_it,abstract_en,date_created`
  );
}

export async function getArticle(slug) {
  const rows = await dGet(
    `/items/articles?filter[slug][_eq]=${encodeURIComponent(slug)}` +
    `&filter[status][_eq]=published&limit=1` +
    `&fields=id,title_it,title_en,slug,abstract_it,abstract_en,body_it,body_en,date_created`
  );
  return (rows && rows[0]) || null;
}
