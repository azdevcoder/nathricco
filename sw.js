const cacheName = 'nath-agenda-v30';
const assets = [
  './',
  './index.html',
  './contrato.html',
  './pacientes.html',
  './lista_contratos.html',
  './enviar_contrato.html',
  './manifest.json',
  './calendar.png'
];

// Instalação e Cache
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Limpeza de cache antigo
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
});

// Resposta offline
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
