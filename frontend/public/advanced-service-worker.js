/**
 * ⚠️ KILL-SWITCH: Old advanced-service-worker.js
 * هذا الملف صار محول لإلغاء تسجيل نفسه تماماً.
 * السبب: كان يتعارض مع /service-worker.js الرئيسي ويسبب مشاكل تخزين.
 *
 * أي عميل قديم عنده هذا SW مسجّل — هذه النسخة ستحذف نفسها وتمسح الكاش.
 */
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // امسح كل الكاشات
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    // ألغِ التسجيل نهائياً
    await self.registration.unregister();
    // أعد تحميل كل العملاء
    const clients = await self.clients.matchAll();
    clients.forEach((c) => c.navigate(c.url));
  })());
});

// لا تتدخل في أي طلب
self.addEventListener('fetch', () => {});
