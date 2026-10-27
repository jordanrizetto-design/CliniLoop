// Service worker do CliniLoop: abre sem internet. A chamada da API do Claude nunca passa por aqui.
const V = 'cliniloop-cdbf10f5';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'cliniloop-logo.svg', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const mine = u.origin === self.location.origin;
  const font = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!mine && !font) return;
  const guarda = (res) => { if (res && res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); } return res; };
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(guarda).catch(() => caches.match(r).then((m) => m || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then((m) => { const rede = fetch(r).then(guarda).catch(() => m); return m || rede; }));
});
