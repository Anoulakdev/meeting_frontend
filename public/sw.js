const CACHE_NAME = 'meeting-notice-v1.0.0';

// Relative assets to cache during installation
const PRECACHE_ASSETS = [
  './offline.html',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST, PUT, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // Skip browser extensions, chrome-extension, ws
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Never cache webpack HMR files
  if (url.pathname.includes('webpack') || url.pathname.includes('hot-update')) {
    return;
  }

  // Never cache API or auth endpoints (always network-only)
  if (
    url.pathname.includes('/api/') ||
    url.port === '8000' ||
    url.pathname.endsWith('/signin') ||
    url.pathname.endsWith('/signup')
  ) {
    return;
  }

  // HTML Page Navigation requests: Network-First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedOffline = await cache.match('./offline.html');
          if (cachedOffline) {
            return cachedOffline;
          }
          // If relative match fails, search by basename
          const allCached = await cache.match(new URL('./offline.html', self.location).href);
          return allCached || Response.error();
        })
    );
    return;
  }

  // Static Assets (Next.js static assets, fonts, icons, images): Stale-While-Revalidate or Cache-First
  const isStaticAsset =
    url.pathname.includes('/_next/static/') ||
    url.pathname.includes('/fonts/') ||
    url.pathname.includes('/icons/') ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image';

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});

// Allow clients to trigger skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
