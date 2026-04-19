/**
 * ⚡ CORE.JS — ملف موحّد يستبدل:
 *   - speed-optimization.js
 *   - performance-optimization.js
 *   - performance-optimizer.js
 *   - pages-optimizer.js
 *   - instant-navigation.js
 *   - back-button.js
 *
 * الهدف: ملف واحد خفيف بدلاً من 6 ملفات متكررة.
 * Version: 2.0.0
 */

(function () {
  'use strict';

  // ─── 1. LAZY LOADING للصور ───
  function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;
    const imgs = document.querySelectorAll('img:not([loading])');
    imgs.forEach((img) => {
      // above-the-fold: eager, below-the-fold: lazy
      const rect = img.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        img.setAttribute('loading', 'lazy');
      } else {
        img.setAttribute('loading', 'eager');
      }
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
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
      const link = document.createElement('link');
      link.rel = h.rel;
      link.href = h.href;
      document.head.appendChild(link);
    });
  }

  // ─── 3. BACK BUTTON (for sub-pages) ───
  function initBackButton() {
    const backBtn = document.querySelector('[data-back-button]');
    if (!backBtn) return;
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    });
  }

  // ─── 4. SMOOTH ANCHOR SCROLL ───
  function initSmoothAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
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

  // ─── INIT ───
  function init() {
    initLazyImages();
    setupResourceHints();
    initBackButton();
    initSmoothAnchors();
    initMobileMenu();
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
