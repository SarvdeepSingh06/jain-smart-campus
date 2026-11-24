// JAIN Smart Campus — Service Worker PWA Cache Controller
const CACHE_NAME = 'smart-campus-v10';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css?v=9',
  './app.js?v=9',
  './qrcode.min.js',
  './jsqr.min.js',
  './manifest.json',
  './icon.svg',
  './images/jain-campus-panoramic.jpg',
  './images/campus-hero.jpg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install Event: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker v10] Pre-caching core application shell');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Service Worker] Pre-cache notice:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Immediately purge stale caches from previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Purging outdated cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-First for HTML navigation; Stale-While-Revalidate for cached assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isHtml = event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isHtml) {
    // Network-First for page documents to ensure instant updates
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // Stale-While-Revalidate for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
