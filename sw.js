const cacheName = 'nath-agenda-v35';
const assets = ['./index.html', './contrato.html', './pacientes.html', './lista_contratos.html', './manifest.json', './calendar.png'];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(cacheName).then(c => c.addAll(assets)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== cacheName).map(k => caches.delete(k)))));
});
self.addEventListener('fetch', e => e.respondWith(fetch(e.request).catch(() => caches.match(e.request))));
