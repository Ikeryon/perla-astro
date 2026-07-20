// Service worker minimale: rete-prima, cache come riserva offline.
// __BUILD__ viene sostituito ad ogni build (integrazione sw-version in astro.config.mjs):
// la versione cache cambia ad ogni release e i client installati (compresa la vecchia
// PWA "guaite-del-gusto-*", stesso scope /) si aggiornano al primo accesso.
const CACHE = 'perla-astro-__BUILD__';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') return; // le navigazioni le gestisce il browser
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});

// ---- Notifiche push ----
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  const title = data.title || 'La Perla dei Sibillini';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: '/images/icon-192.png',
    badge: '/images/icon-192.png',
    lang: data.lang || 'it',
    data: { url: data.url || '/' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if (c.url === url && 'focus' in c) return c.focus(); }
      return self.clients.openWindow ? self.clients.openWindow(url) : null;
    })
  );
});
