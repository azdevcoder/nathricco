const cacheName = 'nath-agenda-v1';
const assets = [
  './',
  './index.html',
  './pacientes.html',
  './contrato.html',
  './lista_contratos.html',
  './enviar_contrato.html',
  './calendar.png',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
