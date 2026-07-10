// Service Worker for PWA - Saudi Visa Website
// v2: Updated cache with all pages + network-first strategy
const CACHE_NAME = 'saudia-visa-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/corporate.html',
  '/professions.html',
  '/blog.html',
  '/calculator.html',
  '/about.html',
  '/certificates.html',
  '/professional.html',
  '/work-visa.html',
  '/styles.css',
  '/script.js',
  '/professions.json',
  '/icons/logo-192.png',
  '/icons/logo-512.png'
];

// Install - cache all pages
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate - delete old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Network First strategy (always try network, fallback to cache)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
