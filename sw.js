const CACHE = 'sticky-v12';

const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ネットワーク優先、失敗時はキャッシュを返す
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE)
            .then(cache => cache.put(event.request, clone))
            .catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
