/**
 * ⚡ CORE.JS — ملف موحّد يستبدل:
 * - speed-optimization.js
 * - performance-optimization.js
 * - performance-optimizer.js
 * - pages-optimizer.js
 * - instant-navigation.js
 * - back-button.js
 *
 * الهدف: ملف واحد خفيف بدلاً من 6 ملفات متكررة.
 * Version: 2.0.0
 */

/* Floating-button icons (owner 2026-10-27): inline SVG, so every button shows its symbol even where the Font Awesome
 * stylesheet is not loaded (the redesigned pages do not load it). One style for all: 24px line icons, currentColor. */
window.SD_ICON = window.SD_ICON || (function () {
 var s = function (p, fill) { return '<svg viewBox="0 0 24 24" width="22" height="22" fill="' + (fill ? 'currentColor' : 'none') + '" stroke="' + (fill ? 'none' : 'currentColor') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>'; };
 return {
  whatsapp: s('<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zM8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.39 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48z"/>', true),
  phone: s('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
  up: s('<path d="M12 19V5M5 12l7-7 7 7"/>'),
  back: s('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  share: s('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>'),
  facebook: s('<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>'),
  x: s('<path d="M4 4l16 16M20 4 4 20"/>'),
  telegram: s('<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 12-9"/>'),
  link: s('<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>'),
  check: s('<path d="m5 12 5 5 9-10"/>')
 };
})();

(function () {
 'use strict';
 var ICON = window.SD_ICON;

 // ─── 1. LAZY LOADING للصور ───
 function initLazyImages() {
 if (!('IntersectionObserver' in window)) return;
 const imgs = document.querySelectorAll('img:not([loading])');
 // above-the-fold: eager, below-the-fold: lazy. (2026-10-31, speed) The position comes from IntersectionObserver, after the
 // browser's own layout — reading getBoundingClientRect() here forced a full extra layout of the page at load (1 s on the
 // home page on a mid-range phone, measured in a trace). Same result, no forced layout.
 const seen = new IntersectionObserver((entries) => {
 entries.forEach((entry) => {
 const img = entry.target;
 if (!img.hasAttribute('loading')) img.setAttribute('loading', entry.boundingClientRect.top > window.innerHeight ? 'lazy' : 'eager');
 seen.unobserve(img);
 });
 });
 imgs.forEach((img) => {
 if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
 seen.observe(img);
 });

 // data-src legacy support
 const dataSrcImgs = document.querySelectorAll('img[data-src]');
 if (dataSrcImgs.length) {
 const io = new IntersectionObserver((entries) => {
 entries.forEach((entry) => {
 if (entry.isIntersecting) {
 const img = entry.target;
 if (img.dataset.src) img.src = img.dataset.src;
 if (img.dataset.srcset) img.srcset = img.dataset.srcset;
 img.removeAttribute('data-src');
 img.removeAttribute('data-srcset');
 io.unobserve(img);
 }
 });
 }, { rootMargin: '100px' });
 dataSrcImgs.forEach((img) => io.observe(img));
 }
 }

 // ─── 2. RESOURCE HINTS ───
 function setupResourceHints() {
 const hints = [
 { rel: 'dns-prefetch', href: 'https://cdnjs.cloudflare.com' },
 { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
 { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' }
 ];
 hints.forEach((h) => {
 if (document.querySelector(`link[rel="${h.rel}"][href="${h.href}"]`)) return;
 // (2026-10-31) fonts and icons are served from the site itself now: a hint only for a host this page still uses
 if (!document.querySelector(`link[href^="${h.href}"],script[src^="${h.href}"]`)) return;
 const link = document.createElement('link');
 link.rel = h.rel;
 link.href = h.href;
 document.head.appendChild(link);
 });
 }

 // ─── 3. BACK BUTTON — يُحقَن تلقائياً في كل الصفحات (ما عدا الرئيسية) ───
 function initBackButton() {
 // profession pages get a body class for their wide-screen layout (css/sd-bridge.css)
 if (/^\/p\//.test(location.pathname)) document.body.classList.add('sd-prof-page');
 // إذا كنا في الصفحة الرئيسية، لا نضيف زر رجوع
 const path = location.pathname;
 if (path === '/' || path === '/index.html' || path.endsWith('/index.html')) return;
 if (document.getElementById('global-back-btn') || document.getElementById('sd-crumb-back')) return; // موجود مسبقاً

 // owner 2026-10-27: the back control sits IN the page flow (never fixed over a heading or content).
 // «رجوع» goes to the previous page only when it was a page of this site; otherwise (Google, a shared link) it opens
 // the page's logical parent, so the visitor never leaves the site by surprise.
 const isBlogPost = /\/blog\/[^/]+\.html/.test(path);
 const isProfession = /^\/p\//.test(path) || /\/p\/[^/]+\.html$/.test(path);
 const parent = isBlogPost ? ['/blog.html', 'المدونة'] : isProfession ? ['/professions.html', 'قائمة المهن'] : ['/', 'الرئيسية'];
 let sameSite = false;
 try { sameSite = Boolean(document.referrer) && new URL(document.referrer).host === location.host && window.history.length > 1; } catch (e) { sameSite = false; }
 const label = sameSite ? 'رجوع' : 'رجوع إلى ' + parent[1];
 const make = (cls) => {
 const a = document.createElement('a');
 a.href = parent[0]; a.className = cls; a.setAttribute('data-testid', 'global-back-btn');
 a.innerHTML = ICON.back + '<span>' + label + '</span>';
 a.addEventListener('click', (e) => { if (sameSite) { e.preventDefault(); window.history.back(); } });
 return a;
 };
 if (!document.getElementById('global-back-btn-css')) {
 const style = document.createElement('style');
 style.id = 'global-back-btn-css';
 style.textContent =
 '.sd-backbar{max-width:1200px;margin:10px auto 0;padding:0 16px;display:flex;flex-wrap:wrap;gap:8px;direction:rtl}' +
 '.sd-back-link{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:6px 14px;border-radius:999px;border:1px solid #DDE3EC;background:#fff;color:#1B2A41!important;font:600 14px/1.4 "Noto Kufi Arabic",Tahoma,sans-serif;text-decoration:none!important}' +
 '.sd-back-link:hover{border-color:#C9A35E}.sd-back-link:focus-visible{outline:3px solid #C9A35E;outline-offset:2px}' +
 '.sd-back-link svg{width:16px;height:16px;flex:none}' +
 '.sd-crumb-back{display:flex;width:fit-content;align-items:center;gap:6px;min-height:32px;margin:0 0 4px;color:inherit!important;text-decoration:none!important;font-family:var(--sd-kufi,Tahoma,sans-serif);font-size:14px;font-weight:600}' +
 '.sd-crumb-back:hover{text-decoration:underline!important}.sd-crumb-back svg{width:14px;height:14px}' +
 '@media print{.sd-backbar,.sd-crumb-back{display:none!important}}';
 document.head.appendChild(style);
 }
 // new pages: next to the breadcrumb (the breadcrumb already links «الرئيسية»)
 const crumbs = document.querySelector('ol.sd-crumbs');
 if (crumbs) { const a = make('sd-crumb-back'); a.id = 'sd-crumb-back'; a.setAttribute('aria-label', label); crumbs.parentNode.insertBefore(a, crumbs); return; }
 // older pages: a small bar right under the site header — «رجوع» and, when the page has no home link of its own, «الرئيسية»
 const bar = document.createElement('nav');
 bar.className = 'sd-backbar'; bar.setAttribute('aria-label', 'التنقل');
 const back = make('sd-back-link'); back.id = 'global-back-btn'; bar.appendChild(back);
 const top = document.getElementById('uh-header');
 const hasHome = [].some.call(document.querySelectorAll('main a[href="/"], body > header a[href="/"], nav.flex a[href="/"]'), (x) => x.offsetParent !== null && !/uh-/.test(x.className));
 if (parent[0] !== '/' && !hasHome) { const h = document.createElement('a'); h.href = '/'; h.className = 'sd-back-link'; h.textContent = 'الرئيسية'; bar.appendChild(h); }
 if (top && top.parentNode) top.after(bar); else document.body.insertBefore(bar, document.body.firstChild);
 }

 // ─── 3.5 SCROLL-TO-TOP BUTTON — زر صعود سريع ───
 function initScrollTop() {
 if (document.getElementById('scroll-to-top-btn')) return;
 // reading progress bar init (auto-detect if article page)
 initReadingProgress();

 const btn = document.createElement('button');
 btn.id = 'scroll-to-top-btn';
 btn.type = 'button';
 btn.setAttribute('data-testid', 'scroll-to-top-btn');
 btn.setAttribute('aria-label', 'العودة لأعلى الصفحة');
 btn.className = 'scroll-to-top-btn';
 btn.innerHTML = ICON.up;
 btn.title = 'العودة لأعلى الصفحة';
 btn.addEventListener('click', () => {
 window.scrollTo({ top: 0, behavior: 'smooth' });
 });
 document.body.appendChild(btn);

 // إظهار عند التمرير > 300px
 const onScroll = () => {
 if (window.scrollY > 300) btn.classList.add('visible');
 else btn.classList.remove('visible');
 };
 window.addEventListener('scroll', onScroll, { passive: true });
 onScroll();

 // CSS موحّد — bottom-right (على عكس WhatsApp/Call اللي بالـ bottom-left)
 if (!document.getElementById('scroll-to-top-btn-css')) {
 const style = document.createElement('style');
 style.id = 'scroll-to-top-btn-css';
 style.textContent = `
 .scroll-to-top-btn {
 position: fixed;
 bottom: 24px;
 right: 24px;
 z-index: 45;
 width: 52px;
 height: 52px;
 border-radius: 50%;
 background: #C9A35E;
 color: #fff;
 border: none;
 cursor: pointer;
 opacity: 0;
 visibility: hidden;
 transform: translateY(20px);
 transition: all 0.3s ease;
 box-shadow: 0 6px 20px rgba(201,163,94,0.4);
 font-size: 18px;
 }
 .scroll-to-top-btn.visible {
 opacity: 1;
 visibility: visible;
 transform: translateY(0);
 }
 .scroll-to-top-btn:hover {
 background: #1B2A41;
 color: #C9A35E;
 transform: translateY(-4px);
 box-shadow: 0 10px 26px rgba(27,42,65,0.45);
 }
 @media (max-width: 640px) {
 .scroll-to-top-btn {
 width: 46px;
 height: 46px;
 bottom: 20px;
 right: 20px;
 font-size: 16px;
 }
 }
 @media print {
 .scroll-to-top-btn { display: none !important; }
 }
 `;
 document.head.appendChild(style);
 }
 }

 // ─── 4. SMOOTH ANCHOR SCROLL ───
 function initSmoothAnchors() {
 document.addEventListener('click', (e) => {
 const a = e.target.closest('a[href^="#"]');
 if (!a) return;
 const id = a.getAttribute('href');
 if (id === '#' || id.length < 2) return;
 const smooth = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'smooth' : 'auto';
 // 2026-11-07: #home / #top = أعلى الصفحة (لم يكن هناك عنصر بهذا الاسم فلم يحدث شيء)
 if (id === '#home' || id === '#top') {
  if (document.querySelector(id)) { /* عنصر حقيقي: يكمل كالعادة */ }
  else { e.preventDefault(); window.scrollTo({ top: 0, behavior: smooth }); return; }
 }
 let target = null;
 try { target = document.querySelector(id); } catch (_) { return; }
 if (!target) return;
 e.preventDefault();
 scrollBelowHeader(target, smooth);
 if (history.replaceState) { try { history.replaceState(null, '', id); } catch (_) {} }
 });
 // 2026-11-07: فتح قسم من صفحة أخرى (/#services من صفحة داخلية): المتصفح يقفز وحده عند التحميل فيقع العنوان تحت
 // الشريط الثابت، والصور التي تُحمَّل بعده تزيحه. بعد اكتمال التحميل نضعه تحت الشريط (لا عند الرجوع للخلف).
 const h = location.hash;
 if (h && h.length > 1) {
  let nav = '';
  try { nav = (performance.getEntriesByType('navigation')[0] || {}).type || ''; } catch (_) {}
  if (nav !== 'back_forward') {
   const fix = () => { let t = null; try { t = document.getElementById(decodeURIComponent(h.slice(1))); } catch (_) {} if (t) scrollBelowHeader(t, 'auto'); };
   if (document.readyState === 'complete') setTimeout(fix, 0); else window.addEventListener('load', () => setTimeout(fix, 0), { once: true });
  }
 }
 }
 // 2026-11-07: انزل تحت الشريط العلوي الثابت، لا خلفه (كان العنوان يختفي تحت الشريط)
 function scrollBelowHeader(target, behavior) {
 const bar = document.querySelector('#uh-header, .sd-header, body > header');
 let offset = 0;
 if (bar) {
  const p = getComputedStyle(bar).position;
  if (p === 'sticky' || p === 'fixed') offset = bar.offsetHeight;
 }
 const own = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
 const top = target.getBoundingClientRect().top + window.pageYOffset - Math.max(offset + 8, own);
 window.scrollTo({ top: Math.max(0, top), behavior: behavior });
 }

 // ─── Shared helper: هل الصفحة الحالية مقال؟ (يعمل على أي مقال حالي ومستقبلي) ───
 // (2026-10-31, speed) textContent, not innerText: innerText forces a style + layout pass of the whole page (measured on
 // every page in a trace); the length test is the same. Computed once (two features ask).
 let articleCached = null;
 function isArticlePage() {
 if (articleCached !== null) return articleCached;
 const path = location.pathname;
 const isBlogPath = /\/blog\/[^/]+\.html?(\?|$)/.test(path) || /\/post(-[^/]+)?\.html?(\?|$)/.test(path);
 if (isBlogPath) return (articleCached = true);
 const art = document.querySelector('article');
 if (art) {
 const txt = (art.textContent || '').replace(/\s+/g, ' ').trim();
 if (txt.length > 1500) return (articleCached = true);
 }
 return (articleCached = false);
 }

 // ─── 4.5 READING PROGRESS BAR — خط تقدم قراءة المقال (ذكي/تلقائي) ───
 function initReadingProgress() {
 if (document.getElementById('reading-progress-bar')) return;
 if (!isArticlePage()) return;

 // إنشاء شريط التقدم
 const bar = document.createElement('div');
 bar.id = 'reading-progress-bar';
 bar.setAttribute('role', 'progressbar');
 bar.setAttribute('aria-label', 'تقدم قراءة المقال');
 bar.setAttribute('aria-valuemin', '0');
 bar.setAttribute('aria-valuemax', '100');
 bar.setAttribute('aria-valuenow', '0');
 bar.setAttribute('data-testid', 'reading-progress-bar');
 document.body.appendChild(bar);

 // CSS مضمّن
 if (!document.getElementById('reading-progress-css')) {
 const style = document.createElement('style');
 style.id = 'reading-progress-css';
 style.textContent = `
 #reading-progress-bar {
 position: fixed;
 top: 0; left: 0;
 width: 0%;
 height: 3px;
 background: linear-gradient(90deg, #C9A35E 0%, #D4AF73 100%);
 z-index: 1000;
 transition: width 0.08s ease-out;
 box-shadow: 0 0 8px rgba(201,163,94,0.5);
 will-change: width;
 }
 @media print { #reading-progress-bar { display: none !important; } }
 @media (prefers-reduced-motion: reduce) {
 #reading-progress-bar { transition: none; }
 }
 `;
 document.head.appendChild(style);
 }

 // اختر عنصر القياس: إذا في <article> نحسب نسبة قراءته فقط، وإلا نستخدم كامل الصفحة
 function getProgress() {
 const article = document.querySelector('article');
 if (article) {
 const rect = article.getBoundingClientRect();
 const vh = window.innerHeight || document.documentElement.clientHeight;
 const articleTop = rect.top + window.scrollY;
 const articleHeight = article.offsetHeight;
 // البداية: عندما يصل أعلى المقال لأعلى الشاشة
 // النهاية: عندما يصل أسفل المقال لأسفل الشاشة
 const scrolled = window.scrollY - articleTop + vh;
 const total = articleHeight; // ما نطرح vh — نعدّ القراءة منذ أول ما يبان أعلى المقال
 if (total <= 0) return 0;
 return Math.min(100, Math.max(0, (scrolled / total) * 100));
 }
 // fallback: كامل الصفحة
 const doc = document.documentElement;
 const total = (doc.scrollHeight || 0) - (window.innerHeight || 0);
 if (total <= 0) return 0;
 return Math.min(100, Math.max(0, (window.scrollY / total) * 100));
 }

 let ticking = false;
 function update() {
 const p = getProgress();
 bar.style.width = p.toFixed(2) + '%';
 bar.setAttribute('aria-valuenow', Math.round(p));
 ticking = false;
 }
 function onScrollOrResize() {
 if (!ticking) {
 requestAnimationFrame(update);
 ticking = true;
 }
 }
 window.addEventListener('scroll', onScrollOrResize, { passive: true });
 window.addEventListener('resize', onScrollOrResize, { passive: true });
 // set initial
 update();
 }

 // ─── 5. MOBILE MENU TOGGLE (idempotent — لا يتكرر إذا كان script.js نفّذه) ───
 function initMobileMenu() {
 const btn = document.getElementById('mobile-menu-btn');
 const menu = document.getElementById('mobile-menu');
 if (!btn || !menu) return;
 // إذا كان عنده handler من script.js (أو حُقن سابقاً) → لا تُضِف ثاني
 if (btn.dataset.menuInit === '1') return;
 btn.dataset.menuInit = '1';
 btn.addEventListener('click', (e) => {
 e.stopPropagation();
 menu.classList.toggle('hidden');
 });
 // إغلاق عند الضغط على أي رابط داخل القائمة
 menu.querySelectorAll('a').forEach((a) => {
 a.addEventListener('click', () => menu.classList.add('hidden'));
 });
 }

 // ─── 6. SERVICE WORKER REGISTRATION (واحد فقط) ───
 function registerServiceWorker() {
 if (!('serviceWorker' in navigator)) return;
 // فقط في production (domains حقيقية) — تجنب مشاكل التطوير
 const isProd = location.protocol === 'https:' || location.hostname === 'localhost';
 if (!isProd) return;

 // ألغِ أي SW قديم اسمه advanced-service-worker.js
 navigator.serviceWorker.getRegistrations().then((regs) => {
 regs.forEach((reg) => {
 if (reg.active && reg.active.scriptURL.includes('advanced-service-worker')) {
 reg.unregister();
 }
 });
 });

 navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
 .then((reg) => {
 // افحص تحديثات كل 30 دقيقة
 setInterval(() => reg.update(), 1800000);
 })
 .catch(() => {});
 }

 // ─── 7. QUOTE SHARE — مشاركة الاقتباس (حدِّد نصاً واختَر وسيلة المشاركة) ───
 // يعمل تلقائياً على أي مقال حالي أو مستقبلي (نفس منطق isArticlePage)
 function initQuoteShare() {
 if (!isArticlePage()) return;
 if (document.getElementById('quote-share-popup')) return;

 const art = document.querySelector('article');
 const scopeEl = art || document.body;

 // أنشئ الـ popup مسبقاً (hidden)
 const popup = document.createElement('div');
 popup.id = 'quote-share-popup';
 popup.setAttribute('role', 'dialog');
 popup.setAttribute('aria-label', 'مشاركة الاقتباس');
 popup.setAttribute('data-testid', 'quote-share-popup');
 popup.setAttribute('aria-hidden', 'true');
 popup.innerHTML = `
 <div class="quote-share-inner">
 <div class="quote-share-title">
 <i class="fas fa-quote-right" aria-hidden="true"></i>
 <span>شارك هذا الاقتباس</span>
 </div>
 <div class="quote-share-buttons">
 <button type="button" data-qs="whatsapp" aria-label="مشاركة عبر واتساب" data-testid="quote-share-whatsapp-btn"><i class="fab fa-whatsapp" aria-hidden="true"></i></button>
 <button type="button" data-qs="facebook" aria-label="مشاركة عبر فيسبوك" data-testid="quote-share-facebook-btn"><i class="fab fa-facebook-f" aria-hidden="true"></i></button>
 <button type="button" data-qs="x" aria-label="مشاركة عبر X" data-testid="quote-share-x-btn"><i class="fab fa-x-twitter" aria-hidden="true"></i></button>
 <button type="button" data-qs="telegram" aria-label="مشاركة عبر تيليجرام" data-testid="quote-share-telegram-btn"><i class="fab fa-telegram" aria-hidden="true"></i></button>
 <button type="button" data-qs="copy" aria-label="نسخ الاقتباس" data-testid="quote-share-copy-btn"><i class="fas fa-copy" aria-hidden="true"></i></button>
 </div>
 </div>
 <div class="quote-share-arrow" aria-hidden="true"></div>
 `;
 document.body.appendChild(popup);

 // CSS مضمّن — متسق مع هوية الموقع (Navy + Gold)
 if (!document.getElementById('quote-share-css')) {
 const style = document.createElement('style');
 style.id = 'quote-share-css';
 style.textContent = `
 #quote-share-popup {
 position: absolute;
 z-index: 60;
 opacity: 0;
 visibility: hidden;
 transform: translateY(6px);
 transition: opacity .18s ease, transform .18s ease, visibility 0s linear .18s;
 pointer-events: none;
 font-family: 'Alexandria', 'Tajawal', sans-serif;
 }
 #quote-share-popup.visible {
 opacity: 1;
 visibility: visible;
 transform: translateY(0);
 pointer-events: auto;
 transition: opacity .18s ease, transform .18s ease;
 }
 #quote-share-popup .quote-share-inner {
 background: #1B2A41;
 color: #fff;
 border: 1px solid #C9A35E;
 border-radius: 14px;
 padding: 10px 12px;
 box-shadow: 0 12px 32px rgba(27,42,65,.35);
 min-width: 260px;
 }
 #quote-share-popup .quote-share-title {
 display: flex; align-items: center; gap: 8px;
 color: #C9A35E; font-weight: 700; font-size: 12px;
 margin-bottom: 8px; padding-bottom: 8px;
 border-bottom: 1px dashed rgba(201,163,94,.25);
 }
 #quote-share-popup .quote-share-buttons {
 display: flex; gap: 6px; justify-content: space-between;
 }
 #quote-share-popup .quote-share-buttons button {
 flex: 1; background: rgba(255,255,255,.07); color: #fff;
 border: 1px solid rgba(201,163,94,.25); border-radius: 10px;
 width: 40px; height: 40px; cursor: pointer;
 display: inline-flex; align-items: center; justify-content: center;
 transition: all .18s ease; font-size: 15px;
 }
 #quote-share-popup .quote-share-buttons button:hover {
 background: #C9A35E; color: #1B2A41; transform: translateY(-2px);
 }
 #quote-share-popup .quote-share-arrow {
 position: absolute; bottom: -6px; right: 30px;
 width: 12px; height: 12px;
 background: #1B2A41;
 border-right: 1px solid #C9A35E;
 border-bottom: 1px solid #C9A35E;
 transform: rotate(45deg);
 }
 @media (max-width: 640px) {
 #quote-share-popup .quote-share-inner { min-width: 220px; }
 #quote-share-popup .quote-share-buttons button { width: 36px; height: 36px; }
 }
 @media print { #quote-share-popup { display: none !important; } }
 `;
 document.head.appendChild(style);
 }

 function hide() {
 popup.classList.remove('visible');
 popup.setAttribute('aria-hidden', 'true');
 }

 function show(rect) {
 const pageUrl = window.location.href;
 popup.dataset.url = pageUrl;
 // حدّد موضع الـ popup فوق التحديد
 const scrollY = window.scrollY || document.documentElement.scrollTop;
 const scrollX = window.scrollX || document.documentElement.scrollLeft;
 const top = rect.top + scrollY - popup.offsetHeight - 12;
 let left = rect.left + scrollX + (rect.width / 2) - (popup.offsetWidth / 2);
 // clamp بين حدود الشاشة
 const maxLeft = document.documentElement.scrollWidth - popup.offsetWidth - 8;
 if (left < 8) left = 8;
 if (left > maxLeft) left = maxLeft;
 popup.style.top = Math.max(scrollY + 8, top) + 'px';
 popup.style.left = left + 'px';
 popup.classList.add('visible');
 popup.setAttribute('aria-hidden', 'false');
 }

 function getSelectionData() {
 const sel = window.getSelection();
 if (!sel || sel.isCollapsed) return null;
 const text = sel.toString().trim();
 // اقل 10 أحرف عشان نتجنب popup على تحديد عرضي
 if (text.length < 10 || text.length > 400) return null;
 // تأكد إن التحديد داخل المقال
 const range = sel.getRangeAt(0);
 if (!scopeEl.contains(range.commonAncestorContainer)) return null;
 return { text, rect: range.getBoundingClientRect() };
 }

 // أحداث الحساسة للتحديد (mouse + touch)
 let selectionTimer;
 function onSelectionChange() {
 clearTimeout(selectionTimer);
 selectionTimer = setTimeout(() => {
 const data = getSelectionData();
 if (data) show(data.rect); else hide();
 }, 150);
 }

 document.addEventListener('mouseup', onSelectionChange);
 document.addEventListener('touchend', onSelectionChange);
 document.addEventListener('selectionchange', () => {
 // إخفاء الفوري إذا التحديد اختفى
 const sel = window.getSelection();
 if (!sel || sel.isCollapsed) hide();
 });
 // إخفاء عند scroll/resize لتفادي popup معلق
 window.addEventListener('scroll', hide, { passive: true });
 window.addEventListener('resize', hide);

 // زر "نسخ" + أزرار المشاركة (آمنة من XSS: encodeURIComponent دائماً)
 popup.addEventListener('click', async (e) => {
 const btn = e.target.closest('[data-qs]');
 if (!btn) return;
 const sel = window.getSelection();
 const text = sel ? sel.toString().trim() : '';
 if (!text) return hide();
 const quote = '"' + text + '"';
 const url = window.location.href;
 const enc = (s) => encodeURIComponent(s);
 const action = btn.dataset.qs;
 let openUrl = null;

 if (action === 'whatsapp') {
 openUrl = `https://wa.me/?text=${enc(quote + '\n\n' + url)}`;
 } else if (action === 'facebook') {
 openUrl = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(quote)}`;
 } else if (action === 'x') {
 openUrl = `https://twitter.com/intent/tweet?text=${enc(quote)}&url=${enc(url)}`;
 } else if (action === 'telegram') {
 openUrl = `https://t.me/share/url?url=${enc(url)}&text=${enc(quote)}`;
 } else if (action === 'copy') {
 try {
 await navigator.clipboard.writeText(quote + '\n' + url);
 const originalHTML = btn.innerHTML;
 btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>';
 setTimeout(() => { btn.innerHTML = originalHTML; hide(); }, 1200);
 } catch (_) { hide(); }
 return;
 }

 if (openUrl) {
 window.open(openUrl, '_blank', 'noopener,noreferrer');
 hide();
 }
 });
 }

 // ─── 8. DYNAMIC WHATSAPP — رسالة ذكية تتبدل حسب الصفحة ───
 // ترسم رسالة مسبقة سياقية لأي رابط wa.me/962789881009 لم يحدّد ?text=
 function initDynamicWhatsApp() {
 const PHONE = '962789881009';
 const DEFAULT_MSG = 'مرحبًا، لدي استفسار حول خدمات مكتب تأشيرات السعودية في الأردن. يرجى التواصل معي.';

 // جدول مطابقة المسار → رسالة مخصصة
 const MAP = [
 { match: (p) => p === '/' || p === '/index.html' || p.endsWith('/index.html'),
 msg: 'مرحبًا، لدي استفسار حول خدمات مكتب تأشيرات السعودية في الأردن. يرجى التواصل معي.' },
 { match: (p) => p.endsWith('/certificates.html'),
 msg: 'مرحبًا، لدي استفسار حول تصديق الشهادات والوثائق من السفارة السعودية. أرجو إفادتي بالتفاصيل والتكلفة.' },
 { match: (p) => p.endsWith('/saudi-qvp-professional-accreditation/'),
 msg: 'مرحبًا، لدي استفسار حول التحقق المهني (QVP) والفحص المهني (SVP) للمملكة العربية السعودية. أرجو إفادتي بالمتطلبات.' },
 { match: (p) => p.endsWith('/saudi-labor-exam-jordan.html'),
 msg: 'مرحبًا، أرغب بحجز موعد للفحص المهني للعمالة (SVP) ضمن خدمة مكتبكم. أرجو إفادتي بالتفاصيل.' },
 { match: (p) => p.endsWith('/professions.html'),
 msg: 'مرحبًا، لدي استفسار حول المهن المعتمدة والأوراق المطلوبة للتأشيرة السعودية.' },
 { match: (p) => p.endsWith('/work-visa.html'),
 msg: 'مرحبًا، أرغب في الاستفسار عن تأشيرة العمل في المملكة العربية السعودية والإجراءات المطلوبة.' },
 { match: (p) => p.endsWith('/calculator.html'),
 msg: 'مرحبًا، لدي استفسار حول حساب رسوم التأشيرة السعودية. أرجو إفادتي بالتفاصيل.' },
 { match: (p) => p.endsWith('/other-services.html'),
 msg: 'مرحبًا، لدي استفسار حول الخدمات الإضافية (تصديق السفارة الإماراتية / خدمة الاستلام والتسليم / إرسال أرامكس). أرجو إفادتي بالتفاصيل.' },
 { match: (p) => p.endsWith('/corporate.html'),
 msg: 'مرحبًا، لدي استفسار حول خدمات الشركات والتأشيرات الجماعية للمملكة العربية السعودية.' },
 { match: (p) => p.endsWith('/about.html'),
 msg: 'مرحبًا، لدي استفسار حول مكتب تأشيرات السعودية في الأردن. يرجى التواصل معي.' },
 { match: (p) => p.endsWith('/faq.html'),
 msg: 'مرحبًا، لدي سؤال حول خدمات مكتب تأشيرات السعودية. أرجو الإجابة من فضلكم.' },
 // مقالات المدونة
 { match: (p) => /\/blog\/umrah-visa-guide-2026\.html$/.test(p),
 msg: 'مرحبًا، قرأت دليل تأشيرة العمرة 2026 وأرغب في الاستفسار حول إجراءات التقديم والتكلفة.' },
 { match: (p) => /\/blog\/work-visa-comprehensive-2026\.html$/.test(p),
 msg: 'مرحبًا، قرأت دليل تأشيرة العمل الشامل 2026 وأرغب في الاستفسار حول إجراءات التقديم.' },
 { match: (p) => /\/blog\/family-sponsorship-guide\.html$/.test(p),
 msg: 'مرحبًا، قرأت دليل كفالة العائلة وأرغب في الاستفسار حول إجراءات استقدام العائلة للسعودية.' },
 { match: (p) => /\/blog\/tourist-visa-guide\.html$/.test(p),
 msg: 'مرحبًا، قرأت دليل التأشيرة السياحية للسعودية وأرغب في الاستفسار حول إجراءات التقديم.' },
 { match: (p) => p.endsWith('/blog.html') || /\/blog\/?$/.test(p) || /\/blog\/.+\.html$/.test(p),
 msg: 'مرحبًا، لدي استفسار بعد قراءة المدونة. أرجو إفادتي بالتفاصيل.' },
 { match: (p) => p.endsWith('/disclaimer.html') || p.endsWith('/privacy.html') || p.endsWith('/terms.html'),
 msg: 'مرحبًا، لدي استفسار عام حول خدمات مكتب تأشيرات السعودية في الأردن.' }
 ];

 function pickMessage() {
 const p = (location.pathname || '/').toLowerCase();
 for (const rule of MAP) {
 try { if (rule.match(p)) return rule.msg; } catch (_) { /* ignore */ }
 }
 return DEFAULT_MSG;
 }

 const message = pickMessage();
 const encoded = encodeURIComponent(message);

 // 1) طبّق على كل روابط wa.me الخاصة بالمكتب
 // نُحدّث النص دائماً (حتى لو فيه ?text= قديم) — الهدف رسالة ذكية سياقية.
 // الاستثناء الوحيد: data-wa-keep (لو أحد أراد الإبقاء على نص مخصص).
 const links = document.querySelectorAll('a[href*="wa.me/' + PHONE + '"]');
 links.forEach((a) => {
 if (a.hasAttribute('data-wa-keep')) return;
 const href = a.getAttribute('href') || '';
 const base = href.split('?')[0];
 a.setAttribute('href', base + '?text=' + encoded);
 });

 // 2) طبّق على روابط api.whatsapp.com أيضاً إن وُجدت
 const apiLinks = document.querySelectorAll('a[href*="api.whatsapp.com/send"][href*="phone=' + PHONE + '"]');
 apiLinks.forEach((a) => {
 if (a.hasAttribute('data-wa-keep')) return;
 try {
 const url = new URL(a.href, location.origin);
 url.searchParams.set('text', message);
 a.setAttribute('href', url.toString());
 } catch (_) { /* ignore */ }
 });
 }

 // ─── 9. UNIFIED HEADER — هيدر موحّد مع قائمة جانبية (Drawer) على كل الصفحات ───
 function initUnifiedHeader() {
 // منع التكرار
 if (document.getElementById('uh-header')) return;

 // قائمة الروابط الموحّدة — عربية في الصفحات العربية وإنجليزية في صفحات English Services
 const isEnglishPage = /^\/en(?:\/|$)/i.test(location.pathname) || (document.documentElement.lang || '').toLowerCase().startsWith('en');
 const NAV_ITEMS = isEnglishPage ? [
 { href: '/en/index.html', label: 'English Services', icon: 'fa-globe' },
 { href: '/en/about.html', label: 'About Us', icon: 'fa-building' },
 { href: '/en/saudi-visa-processing-partner-jordan.html', label: 'For Companies & Partners', icon: 'fa-city' },
 { href: '/saudi-work-visa-eligibility.html', label: 'Eligibility Checker', icon: 'fa-list-check' },
 { href: '/saudi-document-attestation-jordan.html', label: 'Document Attestation', icon: 'fa-file-signature' },
 { href: '/professions.html', label: 'Professions & Documents', icon: 'fa-list-check' }
 ] : [
 { href: '/index.html', label: 'الرئيسية', icon: 'fa-home' },
 { href: '/about.html', label: 'من نحن', icon: 'fa-building' },
 { href: '/index.html#services', label: 'خدماتنا', icon: 'fa-briefcase' },
 { href: '/corporate.html', label: 'خدمات الشركات', icon: 'fa-city' },
 { href: '/professions.html', label: 'المهن والأوراق', icon: 'fa-list-check' },
 { href: '/saudi-qvp-professional-accreditation/', label: 'الاعتماد المهني', icon: 'fa-user-check' }, // owner 2026-10-26: never «الاعتماد المهني (QVP)»
 { href: '/saudi-labor-exam-jordan.html', label: 'الفحص المهني للعمالة', icon: 'fa-certificate' },
 { href: '/certificates.html', label: 'تصديق الشهادات', icon: 'fa-certificate' },
 { href: '/saudi-consular-services-jordan/', label: 'الخدمات القنصلية السعودية', icon: 'fa-landmark' }, // 2026-11-07
 { href: '/work-visa.html', label: 'تأشيرة العمل', icon: 'fa-passport' },
 { href: '/calculator.html', label: 'حاسبة الرسوم', icon: 'fa-calculator' },
 { href: '/remote-document-services-jordan/', label: 'إنجاز المعاملات والوثائق من الأردن عن بُعد', icon: 'fa-concierge-bell' },
 { href: '/blog.html', label: 'المدونة', icon: 'fa-newspaper' },
 { href: '/faq.html', label: 'الأسئلة الشائعة', icon: 'fa-circle-question' }
 ];
 const DESKTOP_NAV_ITEMS = isEnglishPage ? [
 { href: '/en/index.html', label: 'English Services' },
 { href: '/en/about.html', label: 'About Us' },
 { href: '/en/saudi-visa-processing-partner-jordan.html', label: 'B2B Services' },
 { href: '/saudi-work-visa-eligibility.html', label: 'Eligibility' },
 { href: '/saudi-document-attestation-jordan.html', label: 'Attestation' },
 { href: '/professions.html', label: 'Professions' }
 ] : [
 { href: '/index.html', label: 'الرئيسية' },
 { href: '/professions.html', label: 'المهن والأوراق' },
 { href: '/work-visa.html', label: 'تأشيرة العمل' },
 { href: '/saudi-document-attestation-jordan.html', label: 'دليل التصديق' },
 { href: '/calculator.html', label: 'حاسبة الرسوم' },
 { href: '/en/index.html', label: 'English Services' }
 ];

 // أزل: الهيدر/الناف الموجود مسبقاً (القديم) + فتات الخبز (breadcrumb)
 // الهدف: أي <header> أو <nav> في بداية الـ body يمثّل الشريط العلوي
 const body = document.body;
 // إزالة breadcrumbs (كما طلب المستخدم) — بكل أشكاله
 // 1) عنصر <nav aria-label="breadcrumb">
 document.querySelectorAll('nav[aria-label="breadcrumb"]').forEach(n => n.remove());
 // 2) أي <nav> يحتوي روابط "الرئيسية / المدونة" (breadcrumb غير موسوم)
 document.querySelectorAll('nav, ol').forEach(n => {
 if (n.closest('#uh-drawer')) return; // لا تلمس قائمة الـ drawer
 const links = n.querySelectorAll('a');
 if (links.length < 2 || links.length > 4) return;
 const texts = Array.from(links).map(a => (a.textContent || '').trim());
 const hasHome = texts.includes('الرئيسية');
 const hasBlog = texts.includes('المدونة') || texts.some(t => /مقال|المقالات/.test(t));
 // breadcrumb نموذجي: يبدأ بـ "الرئيسية" ويتبعه روابط قسم ≤ 3
 if (hasHome && hasBlog && texts[0] === 'الرئيسية') {
 // إذا كان ضمن <nav> أزل الـ nav، أما ol فأزل أقرب nav/container
 const wrapper = n.closest('nav') || n;
 wrapper.remove();
 }
 });

 // احذف أول <header> أو <nav.sticky> موجود في الجسم (الهيدر القديم)
 const oldHeader = document.querySelector('body > header, body > nav');
 if (oldHeader) oldHeader.remove();
 // قد يكون الهيدر مغلّف بـ div — نبحث أيضاً عن header أو nav sticky داخل أول طفل
 const nestedOldSticky = document.querySelector('header.sticky, nav.sticky.top-0, nav.bg-white.shadow-md.sticky');
 if (nestedOldSticky) nestedOldSticky.remove();

 // ابنِ الهيدر الجديد
 const header = document.createElement('header');
 header.id = 'uh-header';
 header.setAttribute('data-testid', 'unified-header');
 header.innerHTML = `
 <div class="uh-bar">
 <a href="${isEnglishPage ? '/en/index.html' : '/'}" class="uh-brand" data-testid="uh-brand">
 <img src="/icons/logo-192.png" alt="${isEnglishPage ? 'Saudi Visa Services in Jordan' : 'مكتب تأشيرات السعودية في الأردن'}" class="uh-logo">
 <span class="uh-title">${isEnglishPage ? 'Saudi Visa Services' : 'مكتب تأشيرات السعودية'}<span class="uh-title-sub">${isEnglishPage ? ' in Jordan' : ' في الأردن'}</span></span>
 </a>
 <nav class="uh-desktop-nav" aria-label="${isEnglishPage ? 'Main navigation' : 'التنقل الرئيسي'}">
 ${DESKTOP_NAV_ITEMS.map(it => `<a href="${it.href}">${it.label}</a>`).join('')}
 <a class="uh-desktop-cta" href="${isEnglishPage ? '/en/index.html#contact' : '/index.html#contact'}">${isEnglishPage ? 'Contact us' : 'تواصل معنا'}</a>
 </nav>
 <button type="button" id="uh-toggle" class="uh-toggle" aria-label="${isEnglishPage ? 'Open menu' : 'فتح القائمة'}" aria-expanded="false" aria-controls="uh-drawer" data-testid="uh-menu-toggle">
 <span class="uh-bars"><span></span><span></span><span></span></span>
 </button>
 </div>
 `;

 // ابنِ الـ Drawer + الخلفية
 const backdrop = document.createElement('div');
 backdrop.id = 'uh-backdrop';
 backdrop.setAttribute('data-testid', 'uh-backdrop');

 const drawer = document.createElement('aside');
 drawer.id = 'uh-drawer';
 drawer.setAttribute('role', 'dialog');
 drawer.setAttribute('aria-modal', 'true');
 drawer.setAttribute('aria-label', 'القائمة الرئيسية');
 drawer.setAttribute('data-testid', 'uh-drawer');
 drawer.innerHTML = `
 <div class="uh-drawer-head">
 <span class="uh-drawer-title"><i class="fas fa-compass" aria-hidden="true"></i> التنقل في الموقع</span>
 <button type="button" id="uh-close" class="uh-close" aria-label="إغلاق القائمة" data-testid="uh-menu-close">
 <i class="fas fa-xmark" aria-hidden="true"></i>
 </button>
 </div>
 <nav class="uh-nav" aria-label="القائمة الرئيسية">
 <ul>
 ${NAV_ITEMS.map(it => `
 <li><a href="${it.href}" data-testid="uh-link-${it.href.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')}">
 <i class="fas ${it.icon}" aria-hidden="true"></i>
 <span>${it.label}</span>
 <i class="fas fa-chevron-left uh-chevron" aria-hidden="true"></i>
 </a></li>`).join('')}
 </ul>
 </nav>
 <div class="uh-drawer-cta">
 <a href="tel:+962789881009" class="uh-cta-call" data-testid="uh-cta-call"><i class="fas fa-phone" aria-hidden="true"></i> اتصل بنا</a>
 <a href="https://wa.me/962789881009" class="uh-cta-wa" data-testid="uh-cta-whatsapp"><i class="fab fa-whatsapp" aria-hidden="true"></i> واتساب</a>
 </div>
 `;

 // حقن الهيدر في بداية الجسم، والـ drawer/backdrop آخر الجسم
 body.insertBefore(header, body.firstChild);
 body.appendChild(backdrop);
 body.appendChild(drawer);

 // ضع الرابط الحالي نشطاً
 const currentPath = location.pathname.replace(/\/+$/, '') || '/';
 header.querySelectorAll('.uh-desktop-nav a').forEach(a => {
 const hrefPath = (new URL(a.getAttribute('href'), location.origin)).pathname.replace(/\/+$/, '') || '/';
 if (!a.classList.contains('uh-desktop-cta') && hrefPath === currentPath) {
  a.classList.add('is-active');
  a.setAttribute('aria-current', 'page');
 }
 });
 drawer.querySelectorAll('.uh-nav a').forEach(a => {
 const hrefPath = (new URL(a.getAttribute('href'), location.origin)).pathname.replace(/\/+$/, '') || '/';
 if (hrefPath === currentPath) a.classList.add('is-active');
 });

 // السلوك: فتح/إغلاق
 const toggleBtn = header.querySelector('#uh-toggle');
 const closeBtn = drawer.querySelector('#uh-close');
 function open() {
 drawer.classList.add('is-open');
 backdrop.classList.add('is-open');
 toggleBtn.setAttribute('aria-expanded', 'true');
 toggleBtn.classList.add('is-open');
 document.documentElement.style.overflow = 'hidden';
 }
 function close() {
 drawer.classList.remove('is-open');
 backdrop.classList.remove('is-open');
 toggleBtn.setAttribute('aria-expanded', 'false');
 toggleBtn.classList.remove('is-open');
 document.documentElement.style.overflow = '';
 }
 toggleBtn.addEventListener('click', () => {
 drawer.classList.contains('is-open') ? close() : open();
 });
 closeBtn.addEventListener('click', close);
 backdrop.addEventListener('click', close);
 document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) close(); });
 // أغلق عند الضغط على أي رابط
 // 2026-11-07: كل روابط القائمة (ومنها اتصل/واتساب أسفلها) تغلقها، لا روابط .uh-nav وحدها
 drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close()));

 // CSS مُضمّن — تصميم Navy/Gold موحّد
 if (!document.getElementById('uh-css')) {
 const style = document.createElement('style');
 style.id = 'uh-css';
 style.textContent = `
 #uh-header {
 position: sticky; top: 0; z-index: 50;
 background: rgba(255,255,255,0.88);
 backdrop-filter: saturate(1.2) blur(14px);
 -webkit-backdrop-filter: saturate(1.2) blur(14px);
 border-bottom: 1px solid rgba(27,42,65,0.08);
 box-shadow: 0 1px 0 rgba(27,42,65,0.03), 0 6px 18px rgba(27,42,65,0.04);
 font-family: 'Alexandria','Tajawal',sans-serif;
 }
 #uh-header .uh-bar {
 max-width: 1200px; margin: 0 auto; padding: 10px 16px;
 display: flex; align-items: center; justify-content: space-between; gap: 12px;
 min-height: 60px;
 }
 #uh-header .uh-brand {
 display: inline-flex; align-items: center; gap: 10px;
 text-decoration: none; color: #1B2A41;
 flex: 0 0 auto; min-width: 0;
 }
 #uh-header .uh-logo { height: 38px; width: auto; display: block; }
 #uh-header .uh-desktop-nav {
 display: flex; align-items: center; justify-content: flex-end; gap: 16px;
 flex: 1 1 auto; min-width: 0; flex-wrap: wrap;
 }
 #uh-header .uh-desktop-nav a {
 color: #1B2A41; text-decoration: none; font-size: 12.5px; font-weight: 700;
 white-space: nowrap; transition: color .2s ease, transform .2s ease;
 }
 #uh-header .uh-desktop-nav a:hover,
 #uh-header .uh-desktop-nav a:focus-visible,
 #uh-header .uh-desktop-nav a.is-active { color: #C9A35E; }
 #uh-header .uh-desktop-nav .uh-desktop-cta {
 background: #C9A35E; color: #fff; border-radius: 9px; padding: 9px 12px;
 }
 #uh-header .uh-desktop-nav .uh-desktop-cta:hover,
 #uh-header .uh-desktop-nav .uh-desktop-cta:focus-visible { color: #fff; background: #B7893D; transform: translateY(-1px); }
 #uh-header .uh-title { font-weight: 800; font-size: 13px; line-height: 1.25; color: #1B2A41; letter-spacing: -.2px; }
 #uh-header .uh-title-sub { color: #8A5A0A; font-weight: 700; } /* dark gold: readable on the white header (WCAG 4.5:1) */
 @media (min-width: 640px) { #uh-header .uh-title { font-size: 15px; } #uh-header .uh-logo { height: 42px; } }

 #uh-header .uh-toggle {
 width: 44px; height: 44px; border-radius: 12px;
 background: #1B2A41; color: #fff;
 display: none; align-items: center; justify-content: center;
 border: 1px solid transparent; cursor: pointer;
 transition: background .2s ease, transform .2s ease, box-shadow .2s ease;
 box-shadow: 0 6px 14px rgba(27,42,65,.18);
 }
 #uh-header .uh-toggle:hover { background: #C9A35E; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(201,163,94,.35); }
 #uh-header .uh-toggle:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(201,163,94,.45); }
 #uh-header .uh-bars { position: relative; width: 20px; height: 14px; display: inline-block; }
 #uh-header .uh-bars span {
 position: absolute; left: 0; right: 0; height: 2px; background: currentColor; border-radius: 2px;
 transition: transform .25s ease, top .25s ease, opacity .2s ease;
 }
 #uh-header .uh-bars span:nth-child(1) { top: 0; }
 #uh-header .uh-bars span:nth-child(2) { top: 6px; }
 #uh-header .uh-bars span:nth-child(3) { top: 12px; }
 #uh-header .uh-toggle.is-open .uh-bars span:nth-child(1) { top: 6px; transform: rotate(45deg); }
 #uh-header .uh-toggle.is-open .uh-bars span:nth-child(2) { opacity: 0; }
 #uh-header .uh-toggle.is-open .uh-bars span:nth-child(3) { top: 6px; transform: rotate(-45deg); }

 #uh-backdrop {
 position: fixed; inset: 0; z-index: 60;
 background: rgba(15,25,34,.55);
 backdrop-filter: blur(3px);
 opacity: 0; visibility: hidden;
 transition: opacity .25s ease, visibility 0s linear .25s;
 }
 #uh-backdrop.is-open { opacity: 1; visibility: visible; transition: opacity .25s ease; }

 #uh-drawer {
 position: fixed; top: 0; right: 0; bottom: 0;
 width: min(340px, 86vw); z-index: 61;
 background: linear-gradient(180deg, #1B2A41 0%, #0F1922 100%);
 color: #fff; font-family: 'Alexandria','Tajawal',sans-serif;
 transform: translateX(100%);
 transition: transform .32s cubic-bezier(.2,.8,.2,1);
 box-shadow: -16px 0 40px rgba(15,25,34,.28);
 display: flex; flex-direction: column;
 }
 #uh-drawer.is-open { transform: translateX(0); }
 #uh-drawer .uh-drawer-head {
 display: flex; align-items: center; justify-content: space-between;
 padding: 16px 18px;
 border-bottom: 1px solid rgba(201,163,94,.18);
 }
 #uh-drawer .uh-drawer-title { color: #C9A35E; font-weight: 700; font-size: 13px; letter-spacing: .3px; }
 #uh-drawer .uh-drawer-title i { margin-left: 6px; }
 #uh-drawer .uh-close {
 width: 36px; height: 36px; border-radius: 10px;
 background: rgba(255,255,255,.06); color: #C9A35E; border: 1px solid rgba(201,163,94,.25);
 cursor: pointer; transition: all .2s ease;
 }
 #uh-drawer .uh-close:hover { background: #C9A35E; color: #1B2A41; }
 #uh-drawer .uh-nav { flex: 1; overflow-y: auto; padding: 8px 0; }
 #uh-drawer .uh-nav ul { list-style: none; margin: 0; padding: 0; }
 #uh-drawer .uh-nav a {
 display: flex; align-items: center; gap: 14px;
 padding: 13px 20px; color: #E8EEF5; text-decoration: none;
 font-size: 14.5px; font-weight: 500; position: relative;
 border-right: 3px solid transparent;
 transition: background .2s ease, color .2s ease, border-color .2s ease, padding .2s ease;
 }
 #uh-drawer .uh-nav a i:first-child { width: 22px; color: #C9A35E; font-size: 14px; text-align: center; }
 #uh-drawer .uh-nav a .uh-chevron { margin-right: auto; opacity: 0; color: #C9A35E; font-size: 11px; transform: translateX(6px); transition: all .25s ease; }
 #uh-drawer .uh-nav a:hover {
 background: rgba(201,163,94,.09);
 color: #fff; border-right-color: #C9A35E; padding-right: 24px;
 }
 #uh-drawer .uh-nav a:hover .uh-chevron { opacity: 1; transform: translateX(0); }
 #uh-drawer .uh-nav a.is-active {
 background: rgba(201,163,94,.14);
 color: #C9A35E; border-right-color: #C9A35E; font-weight: 700;
 }
 #uh-drawer .uh-nav a.is-active .uh-chevron { opacity: 1; transform: translateX(0); }

 #uh-drawer .uh-drawer-cta {
 display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
 padding: 12px 16px 18px;
 border-top: 1px solid rgba(201,163,94,.18);
 }
 #uh-drawer .uh-drawer-cta a {
 display: inline-flex; align-items: center; justify-content: center; gap: 8px;
 padding: 11px 10px; border-radius: 10px; font-weight: 700; font-size: 13.5px;
 text-decoration: none; transition: all .2s ease;
 }
 #uh-drawer .uh-cta-call { background: #C9A35E; color: #1B2A41; }
 #uh-drawer .uh-cta-call:hover { background: #D4AF73; transform: translateY(-1px); }
 #uh-drawer .uh-cta-wa { background: #25D366; color: #fff; }
 #uh-drawer .uh-cta-wa:hover { background: #1DB954; transform: translateY(-1px); }

 @media (max-width: 1050px) {
 #uh-header .uh-desktop-nav { display: none; }
 #uh-header .uh-bar { width: 100%; box-sizing: border-box; }
 #uh-header .uh-brand { flex: 1 1 auto; min-width: 0; }
 #uh-header .uh-title { min-width: 0; overflow-wrap: anywhere; }
 #uh-header .uh-toggle { display: inline-flex; flex: 0 0 44px; }
 }
 @media (prefers-reduced-motion: reduce) {
 #uh-drawer, #uh-backdrop, #uh-header .uh-toggle, #uh-drawer .uh-nav a { transition: none !important; }
 }
 @media print {
 #uh-header, #uh-drawer, #uh-backdrop { display: none !important; }
 }
 `;
 document.head.appendChild(style);
 }
 }

 // ─── 10. READ-MORE ENHANCEMENT — يحوّل روابط "اقرأ المزيد" لكبسولة ذهبية تفاعلية ───
 function initReadMoreButtons() {
 // استهدف أي <a> يحتوي نص "اقرأ المزيد" أو "اعرف المزيد" (المدونة + الصفحة الرئيسية)
 const TARGET_REGEX = /(اقرأ\s*المزيد|اعرف\s*المزيد|اقرا\s*المزيد)/;
 const candidates = document.querySelectorAll('a:not(.rm-btn)');
 candidates.forEach((a) => {
 if (a.closest('#uh-drawer, #uh-header')) return;
 const raw = (a.textContent || '').trim();
 if (!TARGET_REGEX.test(raw)) return;
 // حدّد نص الزر (النص بدون الأيقونة)
 const label = raw.replace(/\s+/g, ' ').replace(/\u00a0/g,' ').trim();
 // بعض المكاتب لها <i> سهم — نحذفها لإعادة بنائها بشكل موحّد
 const oldIcon = a.querySelector('i.fa-arrow-left, i.fa-arrow-right, i.fa-chevron-left');
 if (oldIcon) oldIcon.remove();
 // نظّف النص ثم أعد بناء البنية الموحّدة
 a.classList.add('rm-btn');
 a.setAttribute('data-testid', a.getAttribute('data-testid') || 'read-more-btn');
 a.innerHTML = `
 <span class="rm-btn-label">${label}</span>
 <span class="rm-btn-arrow" aria-hidden="true">
 <i class="fas fa-arrow-left"></i>
 </span>
 `;
 });

 // CSS مُضمّن
 if (!document.getElementById('rm-btn-css')) {
 const style = document.createElement('style');
 style.id = 'rm-btn-css';
 style.textContent = `
 .rm-btn {
 --rm-navy: #1B2A41;
 --rm-gold: #C9A35E;
 --rm-gold-dark: #B48A3E;
 position: relative;
 display: inline-flex;
 align-items: center;
 gap: 10px;
 padding: 9px 18px 9px 14px;
 font-size: 13.5px; font-weight: 700;
 color: var(--rm-navy);
 background: linear-gradient(180deg, #FBF4E3 0%, #F6E9C9 100%);
 border: 1.5px solid rgba(201,163,94,.55);
 border-radius: 999px;
 text-decoration: none;
 line-height: 1;
 box-shadow: 0 2px 6px rgba(27,42,65,.06), inset 0 1px 0 rgba(255,255,255,.6);
 transition: color .25s ease, background .25s ease, border-color .25s ease, transform .25s ease, box-shadow .25s ease, padding .25s ease;
 overflow: hidden;
 isolation: isolate;
 z-index: 0;
 }
 .rm-btn::before {
 content: "";
 position: absolute; inset: 0;
 background: linear-gradient(180deg, var(--rm-gold) 0%, var(--rm-gold-dark) 100%);
 transform: translateX(100%);
 transition: transform .38s cubic-bezier(.2,.8,.2,1);
 z-index: -1;
 }
 .rm-btn:hover { color: #fff; border-color: var(--rm-gold); transform: translateY(-1px); box-shadow: 0 8px 18px rgba(201,163,94,.35); padding-right: 18px; }
 .rm-btn:hover::before { transform: translateX(0); }
 .rm-btn:hover .rm-btn-arrow { color: #fff; transform: translateX(-4px); }
 .rm-btn:active { transform: translateY(0) scale(.98); }
 .rm-btn .rm-btn-arrow {
 display: inline-flex; align-items: center; justify-content: center;
 width: 22px; height: 22px; border-radius: 50%;
 background: rgba(27,42,65,.08); color: var(--rm-navy);
 font-size: 10px;
 transition: transform .25s ease, background .25s ease, color .25s ease;
 }
 .rm-btn:hover .rm-btn-arrow { background: rgba(255,255,255,.2); }

 /* on dark surfaces invert */
 .bg-navy .rm-btn, .from-navy .rm-btn, [class*="bg-navy"] .rm-btn {
 background: rgba(201,163,94,.12);
 color: #F6E9C9;
 border-color: rgba(201,163,94,.45);
 }
 .bg-navy .rm-btn .rm-btn-arrow, [class*="bg-navy"] .rm-btn .rm-btn-arrow {
 background: rgba(201,163,94,.2); color: #F6E9C9;
 }
 `;
 document.head.appendChild(style);
 }
 }

 // ─── 11. CLICK STAMP / WAX-SEAL RIPPLE — تفاعل ذهبي أنيق عند الضغط ───
 function initClickStamp() {
 // التطبيق: كل زر/رابط/بطاقة قابلة للضغط — ماعدا ما هو opt-out
 const selector = [
 'a:not([data-no-stamp])',
 'button:not([data-no-stamp])',
 '[role="button"]:not([data-no-stamp])',
 '.uh-nav a', // روابط الـ drawer
 '.rm-btn', // أزرار اقرأ المزيد
 '[data-stamp]' // أي عنصر يريد تفعيلها صراحةً
 ].join(',');

 document.addEventListener('pointerdown', (e) => {
 const target = e.target.closest(selector);
 if (!target) return;
 // ماعدا الروابط داخل iframe/external/ثقيلة
 if (target.matches('#uh-backdrop, #uh-close')) return;
 spawnStamp(target, e);
 }, { passive: true });

 // 2026-11-07 (mobile bug): the effect used to set position/overflow on the tapped element and append a child to it at
 // pointerdown. That changed the element's size between the finger going down and up, the links below moved, and the
 // browser sent the tap to the NEXT link (menu items opened the wrong page). The effect is now drawn in a separate
 // fixed overlay over the element, clipped to its shape: the element itself is never touched, nothing moves.
 function spawnStamp(el, event) {
 const rect = el.getBoundingClientRect();
 if (!rect.width || !rect.height) return;
 const x = (event.clientX != null ? event.clientX : (rect.left + rect.width/2)) - rect.left;
 const y = (event.clientY != null ? event.clientY : (rect.top + rect.height/2)) - rect.top;
 const maxDim = Math.max(rect.width, rect.height);
 const size = Math.max(maxDim * 1.6, 80);

 const clip = document.createElement('span');
 clip.className = 'stamp-fx-clip';
 clip.style.left = rect.left + 'px'; clip.style.top = rect.top + 'px';
 clip.style.width = rect.width + 'px'; clip.style.height = rect.height + 'px';
 clip.style.borderRadius = getComputedStyle(el).borderRadius;
 const stamp = document.createElement('span');
 stamp.className = 'stamp-fx' + (el.closest('.bg-white, .bg-gray-50, [class*="bg-white"], article, .rm-btn') ? ' stamp-fx--light' : '');
 stamp.style.setProperty('--x', x + 'px');
 stamp.style.setProperty('--y', y + 'px');
 stamp.style.setProperty('--size', size + 'px');
 clip.appendChild(stamp);
 document.body.appendChild(clip);
 // cleanup بعد انتهاء الأنيميشن
 setTimeout(() => clip.remove(), 640);
 }

 if (!document.getElementById('stamp-fx-css')) {
 const style = document.createElement('style');
 style.id = 'stamp-fx-css';
 style.textContent = `
 .stamp-fx-clip {
 position: fixed; overflow: hidden; pointer-events: none; z-index: 2147483000;
 }
 .stamp-fx {
 position: absolute;
 left: var(--x); top: var(--y);
 width: var(--size); height: var(--size);
 margin-left: calc(var(--size) * -0.5);
 margin-top: calc(var(--size) * -0.5);
 border-radius: 50%;
 pointer-events: none;
 background: radial-gradient(closest-side,
 rgba(201,163,94,.55) 0%,
 rgba(201,163,94,.35) 38%,
 rgba(201,163,94,0) 72%);
 transform: scale(.25);
 opacity: 0;
 animation: stampFx .55s cubic-bezier(.2,.75,.2,1) forwards;
 z-index: 2;
 mix-blend-mode: screen;
 }
 @keyframes stampFx {
 0% { transform: scale(.25); opacity: .0; }
 18% { opacity: .95; }
 100% { transform: scale(1); opacity: 0; }
 }
 /* نسخة على الخلفيات الفاتحة — اجعل المزج normal حتى يبدو الذهب واضحاً */
 .stamp-fx--light,
 .bg-white .stamp-fx, .bg-gray-50 .stamp-fx, [class*="bg-white"] .stamp-fx,
 article .stamp-fx, .rm-btn .stamp-fx {
 mix-blend-mode: normal;
 background: radial-gradient(closest-side,
 rgba(201,163,94,.35) 0%,
 rgba(201,163,94,.18) 45%,
 rgba(201,163,94,0) 75%);
 }
 @media (prefers-reduced-motion: reduce) {
 .stamp-fx { display: none !important; }
 }
 @media print {
 .stamp-fx, .stamp-fx-clip { display: none !important; }
 }
 `;
 document.head.appendChild(style);
 }
 }


 // ─── 15. AUTO INTERNAL LINKS — "روابط ذات صلة" أسفل صفحات الخدمات ───
 function initInternalLinks() {
 const p = location.pathname;
 // 2026-11-07: related links chosen by topic for each page (before: the first 6 of one fixed list, including an old address)
 const PAGES = {
 '/about.html': { name: 'من نحن', icon: 'fa-building' },
 '/work-visa.html': { name: 'تأشيرة العمل السعودية', icon: 'fa-passport' },
 '/saudi-work-visa-authorization.html': { name: 'تفويض تأشيرة العمل', icon: 'fa-file-signature' },
 '/certificates.html': { name: 'تصديق الشهادات والوثائق', icon: 'fa-certificate' },
 '/saudi-university-certificate-attestation/': { name: 'تصديق الشهادات الجامعية', icon: 'fa-graduation-cap' },
 '/saudi-document-attestation-jordan.html': { name: 'دليل تصديق الأوراق', icon: 'fa-stamp' },
 '/saudi-consular-services-jordan/': { name: 'الخدمات القنصلية السعودية', icon: 'fa-landmark' },
 '/saudi-qvp-professional-accreditation/': { name: 'الاعتماد المهني', icon: 'fa-user-check' },
 '/saudi-labor-exam-jordan.html': { name: 'الفحص المهني للعمالة', icon: 'fa-certificate' },
 '/pillar-mumaris-plus.html': { name: 'دليل ممارس بلس', icon: 'fa-user-doctor' },
 '/professions.html': { name: 'المهن والأوراق', icon: 'fa-list-check' },
 '/calculator.html': { name: 'حاسبة الرسوم', icon: 'fa-calculator' },
 '/corporate.html': { name: 'خدمات الشركات', icon: 'fa-city' },
 '/remote-document-services-jordan/':{ name: 'إنجاز المعاملات والوثائق من الأردن عن بُعد', icon: 'fa-concierge-bell' },
 '/faq.html': { name: 'الأسئلة الشائعة', icon: 'fa-circle-question' }
 };
 const RELATED = {
 '/about.html': ['/saudi-consular-services-jordan/', '/work-visa.html', '/saudi-work-visa-authorization.html', '/certificates.html', '/saudi-university-certificate-attestation/', '/faq.html'],
 '/work-visa.html': ['/saudi-work-visa-authorization.html', '/professions.html', '/saudi-qvp-professional-accreditation/', '/certificates.html', '/calculator.html', '/saudi-consular-services-jordan/'],
 '/certificates.html': ['/saudi-university-certificate-attestation/', '/saudi-document-attestation-jordan.html', '/saudi-consular-services-jordan/', '/remote-document-services-jordan/', '/work-visa.html', '/about.html'],
 '/saudi-qvp-professional-accreditation/': ['/saudi-labor-exam-jordan.html', '/pillar-mumaris-plus.html', '/professions.html', '/work-visa.html', '/saudi-university-certificate-attestation/', '/saudi-consular-services-jordan/'],
 '/saudi-labor-exam-jordan.html': ['/saudi-qvp-professional-accreditation/', '/professions.html', '/work-visa.html', '/saudi-work-visa-authorization.html', '/calculator.html', '/saudi-consular-services-jordan/'],
 '/professions.html': ['/work-visa.html', '/saudi-work-visa-authorization.html', '/saudi-qvp-professional-accreditation/', '/calculator.html', '/certificates.html', '/saudi-consular-services-jordan/'],
 '/calculator.html': ['/work-visa.html', '/professions.html', '/saudi-work-visa-authorization.html', '/certificates.html', '/saudi-consular-services-jordan/', '/about.html'],
 '/corporate.html': ['/work-visa.html', '/saudi-work-visa-authorization.html', '/professions.html', '/saudi-consular-services-jordan/', '/calculator.html', '/about.html'],
 '/faq.html': ['/saudi-consular-services-jordan/', '/work-visa.html', '/certificates.html', '/saudi-work-visa-authorization.html', '/calculator.html', '/about.html']
 };
 const TARGETS = Object.keys(RELATED);
 if (!TARGETS.some(t => p.endsWith(t))) return;
 if (document.getElementById('related-links-sec')) return;

 const currentKey = TARGETS.find(k => p.endsWith(k));
 const related = RELATED[currentKey].filter((k) => PAGES[k]).map((k) => [k, PAGES[k]]);

 const sec = document.createElement('section');
 sec.id = 'related-links-sec';
 sec.setAttribute('aria-label', 'روابط ذات صلة');
 sec.innerHTML = `
 <div class="rl-inner">
 <div class="rl-head">
 <span class="rl-tag">اكتشف المزيد</span>
 <h2 class="rl-title">خدمات مرتبطة من <strong>السعودية فيزا</strong></h2>
 </div>
 <div class="rl-grid">
 ${related.map(([href, v]) => `
 <a href="${href}" class="rl-card" data-testid="related-link-${href.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')}">
 <span class="rl-icon"><i class="fas ${v.icon}" aria-hidden="true"></i></span>
 <span class="rl-name">${v.name}</span>
 <span class="rl-arrow"><i class="fas fa-arrow-left" aria-hidden="true"></i></span>
 </a>`).join('')}
 </div>
 </div>
 `;

 const footer = document.querySelector('footer');
 if (footer) footer.parentNode.insertBefore(sec, footer);
 else document.body.appendChild(sec);

 if (!document.getElementById('related-links-css')) {
 const style = document.createElement('style');
 style.id = 'related-links-css';
 style.textContent = `
 #related-links-sec {
 padding: 56px 16px;
 background: linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%);
 border-top: 1px solid rgba(201,163,94,.15);
 font-family: 'Alexandria','Tajawal',sans-serif;
 }
 #related-links-sec .rl-inner { max-width: 1100px; margin: 0 auto; }
 #related-links-sec .rl-head { text-align: center; margin-bottom: 28px; }
 #related-links-sec .rl-tag {
 display: inline-block; color: #C9A35E;
 font-size: 11px; font-weight: 700; letter-spacing: 2px;
 text-transform: uppercase; margin-bottom: 8px;
 }
 #related-links-sec .rl-title {
 color: #1B2A41; font-size: 22px; font-weight: 700; margin: 0;
 }
 #related-links-sec .rl-title strong { color: #8A5A0A; }
 @media (min-width: 768px) { #related-links-sec .rl-title { font-size: 26px; } }
 #related-links-sec .rl-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
 @media (min-width: 640px) { #related-links-sec .rl-grid { grid-template-columns: repeat(3, 1fr); } }
 @media (min-width: 1024px) { #related-links-sec .rl-grid { grid-template-columns: repeat(6, 1fr); } }
 #related-links-sec .rl-card {
 display: flex; flex-direction: column; align-items: center; gap: 8px;
 padding: 18px 12px; text-decoration: none;
 background: #fff; border: 1px solid rgba(27,42,65,.08);
 border-radius: 14px; color: #1B2A41;
 transition: all .25s ease; position: relative;
 }
 #related-links-sec .rl-card:hover {
 border-color: #C9A35E; transform: translateY(-3px);
 box-shadow: 0 12px 24px rgba(27,42,65,.08);
 }
 #related-links-sec .rl-icon {
 width: 44px; height: 44px; border-radius: 12px;
 background: rgba(201,163,94,.08); color: #C9A35E;
 display: inline-flex; align-items: center; justify-content: center;
 font-size: 16px; transition: all .25s ease;
 }
 #related-links-sec .rl-card:hover .rl-icon {
 background: #C9A35E; color: #fff; transform: scale(1.08);
 }
 #related-links-sec .rl-name {
 font-size: 13px; font-weight: 700; text-align: center; line-height: 1.3;
 }
 #related-links-sec .rl-arrow {
 color: #C9A35E; font-size: 10px; opacity: 0; transform: translateX(4px);
 transition: all .25s ease;
 }
 #related-links-sec .rl-card:hover .rl-arrow { opacity: 1; transform: translateX(0); }
 @media print { #related-links-sec { display: none !important; } }
 `;
 document.head.appendChild(style);
 }
 }


 // ─── 16. BREADCRUMB SCHEMA — حقن تلقائي لـ JSON-LD BreadcrumbList ───
 function initBreadcrumbSchema() {
 const p = location.pathname;
 if (p === '/' || p === '/index.html' || /\/admin-/.test(p)) return;
 const existing = document.querySelectorAll('script[type="application/ld+json"]');
 for (const s of existing) {
 if (s.textContent.includes('"BreadcrumbList"')) return;
 }

 const PAGE_NAMES = {
 '/about.html': 'من نحن',
 '/work-visa.html': 'تأشيرة العمل',
 '/certificates.html': 'تصديق الشهادات',
 '/saudi-qvp-professional-accreditation/': 'الاعتماد المهني',
 '/saudi-labor-exam-jordan.html': 'الفحص المهني للعمالة',
 '/professions.html': 'المهن والأوراق',
 '/calculator.html': 'حاسبة الرسوم',
 '/corporate.html': 'خدمات الشركات',
 '/remote-document-services-jordan/': 'إنجاز المعاملات والوثائق من الأردن عن بُعد',
 '/blog.html': 'المدونة',
 '/faq.html': 'الأسئلة الشائعة',
 '/post.html': 'مقال',
 '/blog-post.html': 'مقال'
 };

 const PARENTS = {
 '/saudi-labor-exam-jordan.html': '/saudi-qvp-professional-accreditation/'
 };

 const pageKey = Object.keys(PAGE_NAMES).find(k => p.endsWith(k));
 if (!pageKey) return;

 const origin = location.origin;
 const items = [
 { '@type': 'ListItem', 'position': 1, 'name': 'الرئيسية', 'item': origin + '/' }
 ];
 let pos = 2;
 const parent = PARENTS[pageKey];
 if (parent && PAGE_NAMES[parent]) {
 items.push({ '@type': 'ListItem', 'position': pos++, 'name': PAGE_NAMES[parent], 'item': origin + parent });
 }
 items.push({ '@type': 'ListItem', 'position': pos, 'name': PAGE_NAMES[pageKey], 'item': origin + pageKey });

 const schema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': items };
 const tag = document.createElement('script');
 tag.type = 'application/ld+json';
 tag.textContent = JSON.stringify(schema);
 document.head.appendChild(tag);
 }


 // ─── 12. OPEN STATUS BADGE — مفتوح الآن / مغلق (حسب الوقت الحالي في عمّان) ───
 function initOpenStatus() {
 // أهداف الحقن: أي عنصر فيه data-open-status OR class="js-open-status"
 const slots = document.querySelectorAll('[data-open-status], .js-open-status');
 if (!slots.length) return;

 // جدول الدوام: الأحد–الخميس 09:00 – 16:00، الجمعة والسبت مغلق
 // أيام JavaScript: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
 function isOpenNow(d) {
 const day = d.getDay();
 if (day === 5 || day === 6) return { open: false, reason: 'weekend' };
 const h = d.getHours();
 const m = d.getMinutes();
 const mins = h * 60 + m;
 if (mins < 9 * 60) return { open: false, reason: 'before' };
 if (mins >= 16 * 60) return { open: false, reason: 'after' };
 return { open: true };
 }

 function render() {
 // استخدم توقيت عمّان UTC+3 (لمن يزور من منطقة أخرى)
 const now = new Date(Date.now() + ((new Date().getTimezoneOffset() + 180) * 60000));
 const status = isOpenNow(now);
 const html = status.open
 ? `<span class="os-dot os-open"></span><span class="os-label">مفتوح الآن</span><span class="os-sub">حتى 4:00 مساءً</span>`
 : `<span class="os-dot os-closed"></span><span class="os-label">مغلق حالياً</span><span class="os-sub">نفتح الأحد–الخميس 9ص–4م</span>`;
 slots.forEach((el) => {
 el.classList.add('open-status');
 el.setAttribute('data-testid', el.getAttribute('data-testid') || 'open-status');
 el.innerHTML = html;
 });
 }
 render();
 // أعد التقييم كل دقيقة (خفيف جداً)
 setInterval(render, 60000);

 if (!document.getElementById('open-status-css')) {
 const style = document.createElement('style');
 style.id = 'open-status-css';
 style.textContent = `
 .open-status {
 display: inline-flex; align-items: center; gap: 8px;
 font-family: 'Alexandria','Tajawal',sans-serif;
 font-size: 13px; font-weight: 600;
 padding: 6px 12px; border-radius: 999px;
 background: rgba(255,255,255,.08);
 border: 1px solid rgba(201,163,94,.25);
 color: #E8EEF5;
 }
 .open-status .os-dot {
 width: 9px; height: 9px; border-radius: 50%;
 display: inline-block; box-shadow: 0 0 0 0 currentColor;
 }
 .open-status .os-dot.os-open {
 background: #22C55E;
 animation: os-pulse 1.8s cubic-bezier(.4,0,.6,1) infinite;
 }
 .open-status .os-dot.os-closed { background: #EF4444; }
 .open-status .os-label { font-weight: 700; }
 .open-status .os-sub { opacity: .75; font-size: 11.5px; margin-right: 4px; }
 @keyframes os-pulse {
 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.5); }
 50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
 }
 `;
 document.head.appendChild(style);
 }
 }

 // ─── 13. PAGE SHARE BUTTON — زر مشاركة الصفحة على صفحات الخدمات ───
 function initPageShare() {
 // لا نضيف الزر على الصفحات القانونية/الأدمن
 const path = location.pathname;
 const SKIP = ['/privacy.html','/terms.html','/disclaimer.html','/404.html','/offline.html'];
 if (SKIP.some(s => path.endsWith(s))) return;
 // بدون تكرار
 if (document.getElementById('page-share-fab')) return;

 const btn = document.createElement('button');
 btn.id = 'page-share-fab';
 btn.type = 'button';
 btn.setAttribute('aria-label', 'شارك الصفحة');
 btn.setAttribute('data-testid', 'page-share-fab');
 btn.innerHTML = ICON.share;
 btn.title = 'شارك الصفحة';
 document.body.appendChild(btn);

 const menu = document.createElement('div');
 menu.id = 'page-share-menu';
 menu.setAttribute('role', 'menu');
 menu.innerHTML = `
 <div class="psm-title">${ICON.share}<span>شارك هذه الصفحة</span></div>
 <div class="psm-grid">
 <button type="button" data-ps="whatsapp" aria-label="واتساب" data-testid="ps-whatsapp">${ICON.whatsapp}<span>واتساب</span></button>
 <button type="button" data-ps="facebook" aria-label="فيسبوك" data-testid="ps-facebook">${ICON.facebook}<span>فيسبوك</span></button>
 <button type="button" data-ps="x" aria-label="إكس" data-testid="ps-x">${ICON.x}<span>X</span></button>
 <button type="button" data-ps="telegram" aria-label="تيليجرام" data-testid="ps-telegram">${ICON.telegram}<span>تيليجرام</span></button>
 <button type="button" data-ps="copy" aria-label="نسخ الرابط" data-testid="ps-copy">${ICON.link}<span>نسخ الرابط</span></button>
 </div>
 `;
 document.body.appendChild(menu);

 function openMenu() { menu.classList.add('visible'); btn.classList.add('active'); }
 function closeMenu() { menu.classList.remove('visible'); btn.classList.remove('active'); }
 btn.addEventListener('click', (e) => {
 e.stopPropagation();
 // Native share API إن وُجد على الجوال
 if (navigator.share && window.matchMedia('(pointer:coarse)').matches) {
 navigator.share({
 title: document.title,
 text: ((document.querySelector('meta[name="description"]') || {}).content || '').trim(),
 url: location.href
 }).catch(() => { /* user cancelled */ });
 return;
 }
 menu.classList.contains('visible') ? closeMenu() : openMenu();
 });
 document.addEventListener('click', (e) => {
 if (!menu.contains(e.target) && e.target !== btn) closeMenu();
 });

 menu.addEventListener('click', async (e) => {
 const t = e.target.closest('button[data-ps]');
 if (!t) return;
 const action = t.dataset.ps;
 const url = location.href;
 const title = document.title;
 const enc = encodeURIComponent;
 let openUrl = '';
 if (action === 'whatsapp') openUrl = `https://wa.me/?text=${enc(title + '\n' + url)}`;
 else if (action === 'facebook') openUrl = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
 else if (action === 'x') openUrl = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`;
 else if (action === 'telegram') openUrl = `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`;
 else if (action === 'copy') {
 try {
 await navigator.clipboard.writeText(url);
 const orig = t.innerHTML;
 t.innerHTML = ICON.check + '<span>نُسخ!</span>';
 setTimeout(() => { t.innerHTML = orig; closeMenu(); }, 1100);
 } catch (_) { closeMenu(); }
 return;
 }
 if (openUrl) { window.open(openUrl, '_blank', 'noopener,noreferrer'); closeMenu(); }
 });

 if (!document.getElementById('page-share-css')) {
 const style = document.createElement('style');
 style.id = 'page-share-css';
 style.textContent = `
 #page-share-fab {
 position: fixed; bottom: 88px; right: 24px;
 width: 48px; height: 48px; border-radius: 50%;
 background: #1B2A41; color: #C9A35E;
 border: 1.5px solid #C9A35E;
 box-shadow: 0 8px 20px rgba(27,42,65,.25);
 cursor: pointer; z-index: 46;
 transition: all .25s ease; font-size: 16px;
 }
 #page-share-fab:hover { background: #C9A35E; color: #fff; transform: translateY(-2px); }
 #page-share-fab.active { background: #C9A35E; color: #fff; }
 @media (max-width: 640px) {
 #page-share-fab { width: 44px; height: 44px; bottom: 80px; right: 20px; font-size: 15px; }
 }
 #page-share-menu {
 position: fixed; bottom: 144px; right: 24px;
 background: #1B2A41; color: #fff;
 border: 1px solid rgba(201,163,94,.4);
 border-radius: 14px; padding: 12px;
 box-shadow: 0 14px 36px rgba(27,42,65,.35);
 z-index: 47; min-width: 240px;
 opacity: 0; visibility: hidden; transform: translateY(8px);
 transition: opacity .2s ease, transform .2s ease, visibility 0s linear .2s;
 font-family: 'Alexandria','Tajawal',sans-serif;
 }
 #page-share-menu.visible { opacity: 1; visibility: visible; transform: translateY(0);
 transition: opacity .2s ease, transform .2s ease; }
 #page-share-menu .psm-title {
 display: flex; align-items: center; gap: 8px;
 font-weight: 700; color: #C9A35E; font-size: 12px;
 padding-bottom: 8px; margin-bottom: 8px;
 border-bottom: 1px dashed rgba(201,163,94,.25);
 }
 #page-share-menu .psm-grid {
 display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;
 }
 #page-share-menu button {
 display: flex; flex-direction: column; align-items: center; gap: 4px;
 background: rgba(255,255,255,.06); color: #fff;
 border: 1px solid rgba(201,163,94,.2); border-radius: 10px;
 padding: 8px 4px; cursor: pointer; font-size: 10.5px; font-weight: 600;
 font-family: inherit;
 transition: all .2s ease;
 }
 #page-share-menu button i { font-size: 16px; color: #C9A35E; }
 #page-share-menu button:hover { background: #C9A35E; color: #1B2A41; border-color: #C9A35E; transform: translateY(-2px); }
 #page-share-menu button:hover i { color: #1B2A41; }
 @media (max-width: 640px) {
 #page-share-menu { right: 20px; bottom: 136px; min-width: 220px; }
 }
 @media print { #page-share-fab, #page-share-menu { display: none !important; } }
 `;
 document.head.appendChild(style);
 }
 }

 // ─── 14. SAVE PROFESSION — حفظ المهن المفضلة (صفحة professions فقط) ───
 function initSaveProfession() {
 if (!/\/professions\.html?$/.test(location.pathname)) return;
 const KEY = 'savedProfessions_v1';
 const read = () => {
 try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(_) { return []; }
 };
 const write = (arr) => { try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch(_){} };

 // أضف زر "حفظ" داخل كل بطاقة مهنة
 function decorate() {
 const cards = document.querySelectorAll('.profession-card, [data-profession-id]');
 cards.forEach((card) => {
 if (card.querySelector('.sp-save')) return;
 const id = card.getAttribute('data-profession-id') || (card.querySelector('[data-profession-id]') ? card.querySelector('[data-profession-id]').getAttribute('data-profession-id') : '') || (card.querySelector('h3, h4') ? (card.querySelector('h3, h4').textContent || '').trim() : '');
 if (!id) return;
 const btn = document.createElement('button');
 btn.type = 'button';
 btn.className = 'sp-save';
 btn.setAttribute('data-testid', 'save-profession-btn');
 btn.setAttribute('aria-label', 'احفظ المهنة');
 btn.innerHTML = '<i class="far fa-star"></i>';
 btn.addEventListener('click', (e) => {
 e.stopPropagation(); e.preventDefault();
 const saved = read();
 const i = saved.indexOf(id);
 if (i >= 0) { saved.splice(i, 1); btn.classList.remove('saved'); btn.innerHTML = '<i class="far fa-star"></i>'; }
 else { saved.push(id); btn.classList.add('saved'); btn.innerHTML = '<i class="fas fa-star"></i>'; }
 write(saved);
 refreshCounter();
 });
 if (read().includes(id)) { btn.classList.add('saved'); btn.innerHTML = '<i class="fas fa-star"></i>'; }
 // ضعه في زاوية البطاقة
 if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
 card.appendChild(btn);
 });
 }

 // عداد عائم: كم مهنة حفظت
 let counter;
 function refreshCounter() {
 const n = read().length;
 if (!counter) return;
 counter.style.display = n > 0 ? 'inline-flex' : 'none';
 counter.querySelector('.spc-num').textContent = n;
 }
 function addCounter() {
 if (document.getElementById('saved-prof-counter')) return;
 counter = document.createElement('div');
 counter.id = 'saved-prof-counter';
 counter.setAttribute('data-testid', 'saved-professions-counter');
 counter.innerHTML = `
 <i class="fas fa-star"></i>
 <span><span class="spc-num">0</span> مهنة محفوظة</span>
 <button type="button" class="spc-clear" aria-label="مسح القائمة"><i class="fas fa-xmark"></i></button>
 `;
 counter.style.display = 'none';
 document.body.appendChild(counter);
 counter.querySelector('.spc-clear').addEventListener('click', () => {
 write([]);
 document.querySelectorAll('.sp-save.saved').forEach(b => { b.classList.remove('saved'); b.innerHTML = '<i class="far fa-star"></i>'; });
 refreshCounter();
 });
 refreshCounter();
 }

 addCounter();
 decorate();
 // راقب الإضافات (قائمة المهن تُحمَّل بـ JS)
 const mo = new MutationObserver(() => decorate());
 mo.observe(document.body, { childList: true, subtree: true });

 if (!document.getElementById('save-prof-css')) {
 const style = document.createElement('style');
 style.id = 'save-prof-css';
 style.textContent = `
 .sp-save {
 position: absolute; top: 8px; left: 8px;
 width: 32px; height: 32px; border-radius: 50%;
 background: rgba(255,255,255,.92); color: #C9A35E;
 border: 1px solid rgba(201,163,94,.4);
 cursor: pointer; font-size: 13px;
 display: inline-flex; align-items: center; justify-content: center;
 transition: all .2s ease; z-index: 3;
 box-shadow: 0 2px 6px rgba(27,42,65,.12);
 }
 .sp-save:hover { background: #C9A35E; color: #fff; transform: scale(1.08); }
 .sp-save.saved { background: #C9A35E; color: #fff; box-shadow: 0 4px 12px rgba(201,163,94,.45); }
 #saved-prof-counter {
 position: fixed; bottom: 88px; left: 24px; z-index: 46;
 background: #1B2A41; color: #fff;
 border: 1px solid rgba(201,163,94,.4);
 border-radius: 999px;
 padding: 8px 12px 8px 16px; gap: 10px;
 align-items: center;
 font-family: 'Alexandria','Tajawal',sans-serif;
 font-size: 13px; font-weight: 700;
 box-shadow: 0 8px 20px rgba(27,42,65,.28);
 }
 #saved-prof-counter i.fa-star { color: #C9A35E; font-size: 14px; }
 #saved-prof-counter .spc-clear {
 width: 22px; height: 22px; border-radius: 50%;
 background: rgba(201,163,94,.18); color: #C9A35E;
 border: none; cursor: pointer; font-size: 11px;
 }
 #saved-prof-counter .spc-clear:hover { background: #C9A35E; color: #1B2A41; }
 @media (max-width: 640px) {
 #saved-prof-counter { bottom: 80px; left: 20px; font-size: 12px; padding: 6px 10px 6px 12px; }
 }
 @media print { .sp-save, #saved-prof-counter { display: none !important; } }
 `;
 document.head.appendChild(style);
 }
 }


 // ─── INIT ───
 function init() {
 initLazyImages();
 setupResourceHints();
 initUnifiedHeader();
 try { initBackButton(); } finally {
 // the space kept free for the «رجوع» bar before this script ran (css/sd-bridge.css, css/saudia-ds.css) is released
 // in the same frame the bar appears, so nothing moves and no empty gap stays behind
 document.body.classList.add('sd-bb-done');
 }
 initScrollTop();
 initSmoothAnchors();
 initMobileMenu();
 initQuoteShare();
 initDynamicWhatsApp();
 initReadMoreButtons();
 initClickStamp();
 initOpenStatus();
 initPageShare();
 initSaveProfession();
 initInternalLinks();
 initBreadcrumbSchema();
 // أجّل SW حتى load الكامل لتفادي التأثير على FCP
 if (document.readyState === 'complete') {
 registerServiceWorker();
 } else {
 window.addEventListener('load', registerServiceWorker, { once: true });
 }
 }

 if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', init);
 } else {
 init();
 }
})();

/* ════════════════════════════════════════════════════════════════
   🧠 الذكاء المركزي للتواصل (Saudia-visa)
   1) رسائل واتساب ذكية حسب الصفحة (تكشف من أين جاء العميل)
   2) أزرار واتساب/اتصال عائمة في الصفحة الرئيسية فقط (للهاتف)
   يعمل تلقائياً على كل صفحات الموقع لأن core.js محمّل في الجميع.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var WA_NUMBER = '962789881009';
  var TEL_NUMBER = '+962789881009';
  var BRAND = 'Saudia-visa';

  // يحدّد نوع الصفحة الحالية ويبني الرسالة المناسبة
  function buildContextMessage() {
    var path = (location.pathname || '').toLowerCase();
    var file = path.split('/').pop() || '';

    // صفحة مهنة محددة داخل /p/
    if (path.indexOf('/p/') !== -1) {
      var prof = extractProfessionName();
      if (prof) return 'مرحباً ' + BRAND + '، أود الاستفسار عن إجراءات تأشيرة مهنة: ' + prof + '.';
      return 'مرحباً ' + BRAND + '، أبحث عن متطلبات مهنة معينة وأحتاج لمساعدتكم.';
    }
    // صفحة الاعتماد المهني
    if (file.indexOf('professional') !== -1 || path.indexOf('/saudi-qvp-professional-accreditation') !== -1) {
      return 'مرحباً ' + BRAND + '، أود الاستفسار عن متطلبات الاعتماد المهني (QVP أو SVP).';
    }
    // صفحة التصديقات
    if (file.indexOf('certificate') !== -1) {
      return 'مرحباً ' + BRAND + '، أود الاستفسار عن إجراءات تصديق الشهادات.';
    }
    // صفحة المهن العامة (قبل الاختيار)
    if (file.indexOf('professions') !== -1) {
      return 'مرحباً ' + BRAND + '، أبحث عن متطلبات مهنة معينة وأحتاج لمساعدتكم.';
    }
    // الصفحة الرئيسية أو أي صفحة عامة
    return 'مرحباً ' + BRAND + '، لدي استفسار حول خدمات المكتب المعتمدة.';
  }

  // يستخرج اسم المهنة من عنوان صفحة /p/ (يزيل "تأشيرة عمل" و"السعودية")
  function extractProfessionName() {
    var h1 = document.querySelector('h1');
    var raw = (h1 && h1.textContent ? h1.textContent : document.title) || '';
    raw = raw.replace(/تأشيرة عمل/g, '')
             .replace(/السعودية/g, '')
             .replace(/\|.*$/, '')
             .replace(/الأوراق المطلوبة/g, '')
             .replace(/\s+/g, ' ')
             .trim();
    return raw;
  }

  // يحدّث كل روابط الواتساب في الصفحة بالرسالة الذكية —
  // إلا ما كان يحمل رسالة مخصّصة بالفعل (data-keep-msg) مثل أزرار المهن الديناميكية
  function updateWhatsAppLinks(message) {
    var encoded = encodeURIComponent(message);
    var links = document.querySelectorAll('a[href*="wa.me/"], a[href*="api.whatsapp.com"]');
    links.forEach(function (a) {
      if (a.hasAttribute('data-keep-msg')) return; // اترك الرسائل المخصّصة
      var href = a.getAttribute('href') || '';
      var base = href.split('?')[0];
      // أبقِ الرقم كما هو، استبدل/أضف نص الرسالة فقط
      if (base.indexOf('wa.me/') !== -1 || base.indexOf('whatsapp.com') !== -1) {
        a.setAttribute('href', base + '?text=' + encoded);
      }
    });
  }

  // ينشئ الأزرار العائمة (واتساب + اتصال) — للصفحة الرئيسية فقط، على الهاتف
  function injectFloatingButtons(message) {
    var path = (location.pathname || '').toLowerCase();
    var file = path.split('/').pop() || '';
    var isHome = path === '/' || file === '' || file === 'index.html';
    var isProfessionPage = path.indexOf('/p/') !== -1; // صفحات المهن الفردية بلا أزرار تواصل
    if (!isHome && !isProfessionPage) return;     // الرئيسية وصفحات المهن فقط
    if (document.getElementById('sv-floating-contact')) return; // عدم التكرار
    // إن كانت الصفحة تملك أصلاً أزرار تواصل عائمة (مثل الرئيسية) لا نكرّرها —
    // نكتفي بأن الذكاء المركزي حدّث رسالتها تلقائياً.
    if (document.querySelector('[data-testid="floating-whatsapp"], [data-testid="floating-call"]')) return;

    var wrap = document.createElement('div');
    wrap.id = 'sv-floating-contact';
    wrap.setAttribute('aria-label', 'تواصل سريع');
    wrap.innerHTML =
      '<a href="https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message) + '"' +
      ' target="_blank" rel="noopener" class="sv-fab sv-fab-wa" aria-label="تواصل عبر واتساب" title="تواصل عبر واتساب">' +
      window.SD_ICON.whatsapp + '</a>' +
      '<a href="tel:' + TEL_NUMBER + '" class="sv-fab sv-fab-call" aria-label="اتصال هاتفي بالمكتب" title="اتصال هاتفي بالمكتب">' +
      window.SD_ICON.phone + '</a>';
    document.body.appendChild(wrap);
  }

  // أنماط الأزرار العائمة (تُحقن مرة واحدة) — متجاوبة لكل الأحجام
  function injectFloatingStyles() {
    if (document.getElementById('sv-floating-style')) return;
    var css =
      '#sv-floating-contact{position:fixed;bottom:18px;left:18px;z-index:9998;' +
      'display:flex;flex-direction:column;gap:12px;}' +
      '#sv-floating-contact .sv-fab{width:56px;height:56px;border-radius:50%;' +
      'display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;' +
      'box-shadow:0 6px 18px rgba(0,0,0,.25);transition:transform .2s ease,box-shadow .2s ease;' +
      'text-decoration:none;}' +
      '#sv-floating-contact .sv-fab:hover{transform:scale(1.08);box-shadow:0 8px 22px rgba(0,0,0,.32);}' +
      '#sv-floating-contact .sv-fab-wa{background:#25D366;}' +
      '#sv-floating-contact .sv-fab-call{background:#1B2A41;}' +
      '#sv-floating-contact .sv-fab i{line-height:1;}' +
      /* على الشاشات الكبيرة نصغّر قليلاً ونبقيها أنيقة */
      '@media(min-width:768px){#sv-floating-contact{bottom:24px;left:24px;}' +
      '#sv-floating-contact .sv-fab{width:52px;height:52px;font-size:22px;}}' +
      /* لا تظهر عند الطباعة */
      '@media print{#sv-floating-contact{display:none!important;}}' +
      /* owner 2026-10-27: ONE style for every floating button on every page — 48px circles, navy with a gold ring and a
         symbol that says what the button does (WhatsApp, phone, share, up). Contact on the left, page tools on the right;
         the stacks never overlap, and they step aside while the visitor types in a field on a phone. */
      'html body #scroll-to-top-btn,html body #page-share-fab,html body #sv-floating-contact .sv-fab{width:48px;height:48px;padding:0;border-radius:50%;' +
      'display:grid;place-items:center;background:#1B2A41;color:#E7CD97;border:2px solid #C9A35E;box-shadow:0 8px 20px rgba(15,27,45,.28);font-size:0;cursor:pointer;}' +
      'html body #scroll-to-top-btn svg,html body #page-share-fab svg,html body #sv-floating-contact .sv-fab svg{width:22px;height:22px;}' +
      'html body #scroll-to-top-btn:hover,html body #page-share-fab:hover,html body #sv-floating-contact .sv-fab:hover{background:#26385A;color:#fff;transform:translateY(-2px);}' +
      'html body #scroll-to-top-btn:focus-visible,html body #page-share-fab:focus-visible,html body #sv-floating-contact .sv-fab:focus-visible{outline:3px solid #C9A35E;outline-offset:3px;}' +
      'html body #sv-floating-contact .sv-fab-call{background:#C9A35E;color:#0F1B2D;border-color:#1B2A41;}' +
      /* one column on the LEFT (the end of an Arabic line), so no button covers the start of a line of text:
         from the bottom: WhatsApp, phone (only where they exist), share, back to top */
      'html body #sv-floating-contact{left:16px;right:auto;bottom:16px;gap:10px;z-index:46;flex-direction:column-reverse;}' +
      'html body #page-share-fab{left:16px;right:auto;bottom:16px;z-index:46;}' +
      'html body #scroll-to-top-btn{left:16px;right:auto;bottom:74px;z-index:46;}' +
      'html body #page-share-menu{left:16px;right:auto;bottom:132px;}' +
      'html body.sd-has-contact #page-share-fab{bottom:132px;}' +
      'html body.sd-has-contact #scroll-to-top-btn{bottom:190px;}' +
      'html body.sd-has-contact #page-share-menu{bottom:190px;}' +
      '#page-share-menu .psm-title svg{width:16px;height:16px;color:#C9A35E;}#page-share-menu button svg{width:18px;height:18px;color:#C9A35E;}#page-share-menu button:hover svg{color:#1B2A41;}' +
      '@media(min-width:768px){html body #sv-floating-contact,html body #page-share-fab,html body #scroll-to-top-btn,html body #page-share-menu{left:24px;}}' +
      '@media(max-width:767px){body.sd-typing #sv-floating-contact,body.sd-typing #scroll-to-top-btn,body.sd-typing #page-share-fab,body.sd-typing #page-share-menu{display:none!important;}}' +
      /* owner 2026-10-27 (responsive): on phones the buttons sit in ONE slim bar at the bottom and the page reserves its
         height, so no button covers a line of text, a result or a field (a column of floating circles did). */
      '#sd-fab-dock{display:none}' +
      '@media(max-width:767px){' +
      'body.sd-fab-docked{padding-bottom:calc(68px + env(safe-area-inset-bottom,0px))!important;}' +
      'body.sd-fab-docked #sd-fab-dock{display:block;position:fixed;left:0;right:0;bottom:0;height:calc(64px + env(safe-area-inset-bottom,0px));background:rgba(255,255,255,.97);border-top:1px solid #DDE3EC;box-shadow:0 -6px 18px -12px rgba(15,27,45,.35);z-index:45;}' +
      'html body.sd-fab-docked #sv-floating-contact,html body.sd-fab-docked .sd-fab{flex-direction:row;bottom:calc(8px + env(safe-area-inset-bottom,0px));left:12px;gap:10px;}' +
      'html body.sd-fab-docked .sd-fab a{box-shadow:none;}' +
      'html body.sd-fab-docked #page-share-fab{bottom:calc(8px + env(safe-area-inset-bottom,0px));left:12px;}' +
      'html body.sd-fab-docked.sd-has-contact #page-share-fab{left:128px;}' +
      'html body.sd-fab-docked #scroll-to-top-btn{bottom:calc(8px + env(safe-area-inset-bottom,0px));left:auto;right:12px;}' +
      'html body.sd-fab-docked #page-share-menu{bottom:calc(72px + env(safe-area-inset-bottom,0px));}' +
      'html body.sd-fab-docked #sv-floating-contact .sv-fab,html body.sd-fab-docked #page-share-fab,html body.sd-fab-docked #scroll-to-top-btn{box-shadow:none;}' +
      'body.sd-fab-docked.sd-typing #sd-fab-dock{display:none;}body.sd-fab-docked.sd-typing{padding-bottom:0!important;}}' +
      '@media print{#sd-fab-dock{display:none!important}body.sd-fab-docked{padding-bottom:0!important}}' +
      '.global-back-btn svg{width:16px;height:16px;flex:none;}';
    var style = document.createElement('style');
    style.id = 'sv-floating-style';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function runContactIntelligence() {
    // floating buttons step aside while a form field has focus (phones: the keyboard + buttons would cover the field)
    document.addEventListener('focusin', function (e) { if (e.target && e.target.matches && e.target.matches('input:not([type=checkbox]):not([type=radio]),select,textarea')) document.body.classList.add('sd-typing'); });
    document.addEventListener('focusout', function () { document.body.classList.remove('sd-typing'); });
    var message = buildContextMessage();
    updateWhatsAppLinks(message);
    injectFloatingStyles();
    // owner 2026-10-27 (responsive): 14 older pages carry their own fixed WhatsApp circle, which sat on top of the share
    // button. It joins the shared group instead (same look, same place, the phone bottom bar); its link is kept.
    var legacyWa = document.querySelector('a[data-testid="whatsapp-float-btn"], a.fixed.bottom-6.left-6[href*="wa.me"], a.fixed[class*="bottom-6"][href*="wa.me"]');
    if (legacyWa && !document.getElementById('sv-floating-contact')) {
      var grp = document.createElement('div'); grp.id = 'sv-floating-contact'; grp.setAttribute('aria-label', 'تواصل سريع');
      legacyWa.className = 'sv-fab sv-fab-wa'; legacyWa.innerHTML = window.SD_ICON.whatsapp;
      if (!legacyWa.getAttribute('aria-label')) legacyWa.setAttribute('aria-label', 'تواصل عبر واتساب');
      grp.appendChild(legacyWa); document.body.appendChild(grp);
    }
    injectFloatingButtons(message);
    // owner 2026-10-27 (review): no :has() — older Firefox/Safari would stack share on top of WhatsApp. A class instead.
    if (document.getElementById('sv-floating-contact') || document.querySelector('.sd-fab')) document.body.classList.add('sd-has-contact');
    // phones: dock the floating buttons in one bottom bar — only on pages where they are actually shown
    // (a page with its own bottom bar, like «مسار أوراقي», hides them and gets no dock)
    var dock = function () {
      var shown = [document.getElementById('sv-floating-contact'), document.getElementById('page-share-fab'), document.querySelector('.sd-fab')].some(function (el) { return el && window.getComputedStyle(el).display !== 'none'; });
      if (shown && !document.getElementById('sd-fab-dock')) { var d = document.createElement('div'); d.id = 'sd-fab-dock'; d.setAttribute('aria-hidden', 'true'); document.body.appendChild(d); }
      document.body.classList.toggle('sd-fab-docked', shown);
    };
    dock(); window.addEventListener('load', dock);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runContactIntelligence);
  } else {
    runContactIntelligence();
  }
})();

/* Unified print → js/sd-print.js (2026-10-30): letterhead, A4 pages and the office watermark for every printed page */
(function () {
  if (window.SD_print || document.querySelector('script[data-sd-print]')) return;
  var s = document.createElement('script'); s.src = '/js/sd-print.js?v=20261031r'; s.defer = true; s.setAttribute('data-sd-print', ''); document.head.appendChild(s);
})();

/* «ثبّت التطبيق» (2026-10-31, restored): the browser's «can be installed» signal is kept from the first moment; the
   button itself (js/sd-install.js) loads after the page has finished loading, when the browser is idle */
(function () {
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); window.__sdDeferredInstall = e; });
  function load() { if (document.querySelector('script[data-sd-install]')) return; var s = document.createElement('script'); s.src = '/js/sd-install.js?v=20261107'; s.async = true; s.setAttribute('data-sd-install', ''); document.head.appendChild(s); }
  function later() { (window.requestIdleCallback || function (f) { setTimeout(f, 1500); })(load, { timeout: 4000 }); }
  if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });
})();

/* ════════════════════════════════════════════════════════════════
   Digits and dates (owner 2026-10-27): numbers are shown and read in Western digits 0–9.
   - Arabic-Indic / Persian digits typed in a number field are converted as you type.
   - A date field (input[type=date]) gets a text box «يوم/شهر/سنة» you can type into directly
     (no scrolling through years on a phone) and a calendar button; the original field keeps the
     ISO value the page's own code reads, and fires its usual change event.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var toLatin = function (s) { return String(s).replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x660); }).replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 0x6F0); }).replace(/٫/g, '.'); };
  window.SD_toLatin = toLatin;
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el || el.tagName !== 'INPUT' || el.type === 'date') return;
    if (!(el.hasAttribute('data-sd-digits') || /numeric|decimal|tel/.test(el.inputMode || el.getAttribute('inputmode') || '') || el.type === 'tel')) return;
    if (/[٠-٩۰-۹٫]/.test(el.value)) { var pos = el.selectionStart; el.value = toLatin(el.value); try { el.setSelectionRange(pos, pos); } catch (x) {} }
  }, true);

  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  function enhance(d) {
    if (d.dataset.sdDate) return; d.dataset.sdDate = '1';
    var wrap = document.createElement('div'); wrap.className = 'sd-date';
    var txt = document.createElement('input'); txt.type = 'text'; txt.inputMode = 'numeric'; txt.autocomplete = d.id === 'birthDate' ? 'bday' : 'off';
    txt.placeholder = 'يوم/شهر/سنة، مثال: 15/03/1995'; txt.maxLength = 10; txt.dir = 'ltr'; txt.className = d.className;
    var lab = d.id ? document.querySelector('label[for="' + d.id + '"]') : null;
    // review 2026-10-27: the label now points to the visible text box (clicking it no longer focuses the hidden native input)
    if (d.id) txt.id = d.id + '-typed';
    if (lab) { if (!lab.id) lab.id = d.id + '-lbl'; txt.setAttribute('aria-labelledby', lab.id); if (txt.id) lab.htmlFor = txt.id; }
    var hint = document.createElement('small'); hint.className = 'sd-date-msg'; hint.setAttribute('aria-live', 'polite');
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'sd-date-btn'; btn.setAttribute('aria-label', 'اختر التاريخ من التقويم');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
    d.parentNode.insertBefore(wrap, d); wrap.appendChild(txt); wrap.appendChild(btn); wrap.appendChild(d); wrap.after(hint);
    d.classList.add('sd-date-native'); d.tabIndex = -1; d.setAttribute('aria-hidden', 'true');
    var fromIso = function () { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d.value); txt.value = m ? m[3] + '/' + m[2] + '/' + m[1] : ''; };
    var fire = function () { d.dispatchEvent(new Event('input', { bubbles: true })); d.dispatchEvent(new Event('change', { bubbles: true })); };
    txt.addEventListener('input', function (ev) {
      var v = toLatin(txt.value).replace(/[^\d\/\-. ]/g, '').replace(/[\-. ]/g, '/').replace(/\/{2,}/g, '/');
      // a slash is added after the day and the month while typing forward (not while deleting)
      if (!/^delete/.test(ev.inputType || '') && (/^\d{2}$/.test(v) || /^\d{1,2}\/\d{2}$/.test(v))) v += '/';
      txt.value = v;
      var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(txt.value);
      if (!m) { hint.textContent = ''; if (d.value) { own = true; d.value = ''; own = false; fire(); } return; }
      var day = +m[1], mon = +m[2], yr = +m[3], dt = new Date(yr, mon - 1, day);
      var ok = dt.getFullYear() === yr && dt.getMonth() === mon - 1 && dt.getDate() === day && yr > 1900;
      var iso = yr + '-' + pad(mon) + '-' + pad(day);
      if (ok && d.max && iso > d.max) ok = false;
      if (ok && d.min && iso < d.min) ok = false;
      hint.textContent = ok ? '' : 'التاريخ غير صحيح. اكتبه هكذا: يوم/شهر/سنة، مثال 15/03/1995.';
      txt.setAttribute('aria-invalid', ok ? 'false' : 'true');
      own = true; d.value = ok ? iso : ''; own = false; fire();
    });
    btn.addEventListener('click', function () { try { if (d.showPicker) { d.showPicker(); return; } } catch (x) {} d.tabIndex = 0; d.focus(); d.click(); });
    d.addEventListener('change', function (e) { if (e.isTrusted) { fromIso(); hint.textContent = ''; } });
    // review 2026-10-27: a value set by the page's own code (reset, «today») is shown in the text box too
    var own = false, desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    try { Object.defineProperty(d, 'value', { configurable: true, get: function () { return desc.get.call(this); }, set: function (v) { desc.set.call(this, v); if (!own) { fromIso(); hint.textContent = ''; } } }); } catch (x) {}
    var form = d.form; if (form) form.addEventListener('reset', function () { setTimeout(function () { fromIso(); hint.textContent = ''; }, 0); });
    fromIso();
  }
  function run() { [].forEach.call(document.querySelectorAll('input[type="date"]'), enhance); }
  if (!document.getElementById('sd-date-css')) {
    var st = document.createElement('style'); st.id = 'sd-date-css';
    st.textContent = '.sd-date{position:relative;display:flex;gap:8px;align-items:stretch}.sd-date input[type=text]{flex:1;min-width:0;text-align:right}' +
      '.sd-date-btn{flex:none;width:48px;min-height:44px;border:1.5px solid #DDE3EC;border-radius:12px;background:#fff;color:#1B2A41;display:grid;place-items:center;cursor:pointer}' +
      '.sd-date-btn:focus-visible{outline:3px solid #C9A35E;outline-offset:2px}' +
      '.sd-date-native{position:absolute!important;left:0;bottom:0;width:1px!important;height:1px!important;opacity:0;pointer-events:none;border:0!important;padding:0!important;min-height:0!important}' +
      '.sd-date-msg{display:block;color:#B4483C;font-size:13px;min-height:0}';
    document.head.appendChild(st);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
