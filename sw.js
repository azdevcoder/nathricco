// sw.js
const CACHE_NAME = 'nath-ricco-v16'; 

// Isso é apenas uma lista de endereços, não uma pasta física.
const ASSETS = [
  './',
  './index.html',
  './pacientes.html',
  './contrato.html',
  './lista_contratos.html',
  './enviar_contrato.html',
  './calendar.png',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // O navegador lê a lista acima e baixa um por um
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); })
    ))
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
