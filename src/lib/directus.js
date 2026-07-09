// Client minimale per l'API pubblica di Directus (lettura in fase di build).
const API = import.meta.env.DIRECTUS_URL || 'https://opalescent-hoatzin.pikapod.net';

async function dGet(path) {
  const res = await fetch(API + path);
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

// PROPOSTE speciali (con circuito e luogo)
export function getProposals() {
  return dGet(
    `/items/initiatives?filter[edition][_eq]=${ED}` +
    `&filter[circuit][_nnull]=true&filter[status][_eq]=published&sort=sort&limit=-1` +
    `&fields=id,title_it,title_en,subtitle_it,subtitle_en,abstract_it,abstract_en,` +
    `description_it,description_en,booking_url,` +
    `circuit.id,circuit.name_it,circuit.name_en,circuit.slug,circuit.sort,` +
    `place.name,place.city,place.google_maps_url`
  );
}

// Circuiti (le categorie del gusto)
export function getCircuits() {
  return dGet(
    `/items/circuits?filter[edition][_eq]=${ED}&filter[status][_eq]=published&sort=sort` +
    `&fields=id,name_it,name_en,description_it,description_en,slug`
  );
}
