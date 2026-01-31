const CACHE_NAME = "nathalli-pwa-v1";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./contrato.html",
  "./lista_contratos.html",
  "./enviar_contrato.html",
  "./calendar.png",
  "./manifest.json"
];

// Instala
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Ativa
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
