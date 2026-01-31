const CACHE_NAME = 'nath-ricco-v11'; // Sempre mude a versão ao atualizar
const ASSETS = [
  './',
  'index.html',
  'pacientes.html',
  'contrato.html',
  'lista_contratos.html',
  'enviar_contrato.html',
  'calendar.png',
  'manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css'
];

// Instalação
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PWA: Cacheando arquivos criticos');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação (Limpa caches antigos)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptador de busca (Necessário para o botão de instalar aparecer)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).catch(() => {
          if (e.request.mode === 'navigate') {
              return caches.match('./index.html');
          }
      });
    })
  );
});
