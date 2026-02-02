const CACHE_NAME = 'nath-agenda-v2';
const assets = [
  "./",
  "./index.html",
  "./contrato.html",
  "./enviar_contrato.html",
  "./lista_contratos.html",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
];

// Instalação do Service Worker
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Ativação e limpeza de cache antigo
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Estratégia de busca (Network First) para garantir dados atualizados da agenda
self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    fetch(fetchEvent.request).catch(() => {
      return caches.match(fetchEvent.request);
    })
  );
});
