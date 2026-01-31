const CACHE_NAME = 'nath-ricco-v5'; // Incrementei para v5 para forçar a atualização

// Lista de ficheiros essenciais para o funcionamento offline
const ASSETS = [
  './',
  './index.html',
  './pacientes.html',
  './contrato.html',
  './manifest.json',
  './calendar.png', // O ícone principal deve estar aqui
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css'
];

// Instalação: Guarda os ficheiros no cache
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Força o novo SW a tornar-se ativo imediatamente
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PWA: Armazenando ficheiros essenciais no cache');
      return cache.addAll(ASSETS);
    })
  );
});

// Ativação: Limpa versões antigas do cache para não ocupar espaço
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim(); // Assume o controlo das abas abertas imediatamente
});

// Estratégia de Fetch: Tenta a rede primeiro, se falhar (offline), usa o cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
