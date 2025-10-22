const CACHE_NAME = 'smartedu-cache-v2';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.webmanifest',
  '/banners/hero.svg',
  '/src/app.js',
  '/src/db.js',
  '/src/disease.js',
  '/src/i18n.js',
  '/src/voice.js',
  '/src/summarizer.js',
  '/src/chatbot.js',
  '/src/gamification.js',
  '/src/p2p.js',
  '/src/translate.js',
  '/src/adaptive.js',
  '/src/dashboards.js',
  '/src/live.js',
  '/src/library.js',
  '/src/forum.js',
  '/src/admin.js',
  '/src/notifications.js',
  '/src/certificates.js',
  '/src/voice-nav.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;

  // Network-first for dynamic, cache-first for core
  if (CORE_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  } else {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

