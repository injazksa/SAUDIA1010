/**
 * ⚡ SERVICE WORKER — SAUDIA VISA JORDAN
 * Version: 2.0.0 (Build: 2026-01-22)
 *
 * استراتيجية موحّدة ومتوافقة مع Netlify:
 * - HTML → Network First (دائماً تحديث فوري)
 * - JS/CSS → Stale-While-Revalidate (سريع + يتحدّث بالخلفية)
 * - Images/Fonts → Cache First (بدون تكرار طلب)
 * - JSON → Network First مع fallback للكاش
 *
 * هذا الملف هو SW الوحيد — تم حذف advanced-service-worker.js
 */

const VERSION = 'v2.6.0-2026-10-31';
// a page that has a saved copy is shown from it when the network has not answered within this time (weak networks);
// the network copy still arrives and replaces the saved one for the next visit
const HTML_TIMEOUT_MS = 3500;
const STATIC_CACHE = `saudia-static-${VERSION}`;
const RUNTIME_CACHE = `saudia-runtime-${VERSION}`;
const IMAGE_CACHE = `saudia-images-${VERSION}`;

// الأصول الأساسية — تُخزَّن عند التثبيت
const PRECACHE_URLS = [
 '/',
 '/index.html',
 '/styles.css',
 '/smooth-transitions.css',
 '/icons/logo-192.png',
 '/icons/logo-512.png',
 '/manifest.json',
 '/offline.html'
];

// ─── INSTALL ───
self.addEventListener('install', (event) => {
 event.waitUntil(
 caches.open(STATIC_CACHE)
 .then((cache) => cache.addAll(
 PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' }))
 ))
 .catch(() => {})
 .then(() => self.skipWaiting())
 );
});

// ─── ACTIVATE ───
// يحذف جميع الكاشات القديمة ويلغي تسجيل أي SW قديم
self.addEventListener('activate', (event) => {
 event.waitUntil(
 caches.keys()
 .then((keys) => Promise.all(
 keys
 .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE].includes(key))
 .map((key) => caches.delete(key))
 ))
 // navigation preload: the page request starts while this worker is still starting up (no extra wait)
 .then(() => (self.registration.navigationPreload ? self.registration.navigationPreload.enable().catch(() => {}) : null))
 .then(() => self.clients.claim())
 );
});

// ─── FETCH ───
self.addEventListener('fetch', (event) => {
 const { request } = event;
 const url = new URL(request.url);

 // تجاهل الطلبات غير GET
 if (request.method !== 'GET') return;

 // تجاهل chrome-extension والـ blob والـ data
 if (!url.protocol.startsWith('http')) return;

 // تجاهل النطاقات الخارجية (CDN fonts/tailwind/leaflet)
 // المتصفح سيخزنها بنفسه عبر HTTP headers
 if (url.origin !== self.location.origin) return;

 // تجاهل admin — لا تخزين مطلقاً
 if (url.pathname.startsWith('/admin')) return;
 // server functions and anything with a query that carries a form / personal data: never cached
 if (url.pathname.startsWith('/.netlify/')) return;

 // استراتيجية حسب نوع المورد
 const accept = request.headers.get('accept') || '';

 // HTML → Network First
 if (accept.includes('text/html') || url.pathname.endsWith('.html') || url.pathname === '/') {
 event.respondWith(pageFirst(event, request, RUNTIME_CACHE));
 return;
 }

 // Images + Fonts → Cache First
 if (/\.(webp|jpg|jpeg|png|gif|svg|ico|avif|woff2|woff|ttf)$/i.test(url.pathname)) {
 event.respondWith(cacheFirst(request, IMAGE_CACHE));
 return;
 }

 // JS + CSS → Stale While Revalidate
 if (/\.(js|css)$/i.test(url.pathname)) {
 event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
 return;
 }

 // JSON → Network First
 if (/\.json$/i.test(url.pathname)) {
 event.respondWith(networkFirst(request, RUNTIME_CACHE));
 return;
 }

 // الافتراضي → Network First
 event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

// ─── STRATEGIES ───

// pages (2026-10-31): the network first (always the latest page), using the preloaded response when there is one;
// on a slow network a saved copy is shown after HTML_TIMEOUT_MS and the network answer still updates the cache.
async function pageFirst(event, request, cacheName) {
 const cache = await caches.open(cacheName);
 const network = (async () => {
  const pre = event.preloadResponse ? await event.preloadResponse.catch(() => null) : null;
  const res = pre || await fetch(request);
  if (res && res.ok && res.type === 'basic') cache.put(request, res.clone()).catch(() => {});
  return res;
 })();
 event.waitUntil(network.catch(() => {}));
 const cached = await cache.match(request);
 if (!cached) {
  try { return await network; } catch { return (await caches.match('/offline.html')) || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
 }
 const slow = new Promise((r) => setTimeout(() => r(null), HTML_TIMEOUT_MS));
 try { return (await Promise.race([network, slow])) || cached; } catch { return cached; }
}

async function cacheFirst(request, cacheName) {
 const cached = await caches.match(request);
 if (cached) return cached;
 try {
 const response = await fetch(request);
 if (response && response.ok) {
 const cache = await caches.open(cacheName);
 cache.put(request, response.clone()).catch(() => {});
 }
 return response;
 } catch {
 return new Response('', { status: 503 });
 }
}

async function networkFirst(request, cacheName) {
 try {
 const response = await fetch(request);
 if (response && response.ok) {
 const cache = await caches.open(cacheName);
 cache.put(request, response.clone()).catch(() => {});
 }
 return response;
 } catch {
 const cached = await caches.match(request);
 if (cached) return cached;

 // fallback لأي HTML → offline page
 const accept = request.headers.get('accept') || '';
 if (accept.includes('text/html')) {
 const offline = await caches.match('/offline.html');
 if (offline) return offline;
 const index = await caches.match('/index.html');
 if (index) return index;
 }
 return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
 }
}

async function staleWhileRevalidate(request, cacheName) {
 const cache = await caches.open(cacheName);
 const cached = await cache.match(request);
 const networkFetch = fetch(request).then((response) => {
 if (response && response.ok) {
 cache.put(request, response.clone()).catch(() => {});
 }
 return response;
 }).catch(() => cached);
 return cached || networkFetch;
}

// ─── MESSAGE HANDLER ───
// السماح للعميل بطلب تحديث فوري
self.addEventListener('message', (event) => {
 if (event.data && event.data.type === 'SKIP_WAITING') {
 self.skipWaiting();
 }
 if (event.data && event.data.type === 'CLEAR_CACHE') {
 caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
 }
});
