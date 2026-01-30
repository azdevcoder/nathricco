const cacheName = 'nath-agenda-v10';
const assets = [
  './',
  './index.html',
  './contrato.html',
  './pacientes.html',
  './manifest.json' // Importante incluir o manifest no cache
];

self.addEventListener('install', e => {
  self.skipWaiting(); // Força o SW a ativar imediatamente
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
