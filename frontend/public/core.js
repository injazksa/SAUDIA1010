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

  // ─── 3. BACK BUTTON — يُحقَن تلقائياً في كل الصفحات (ما عدا الرئيسية) ───
  function initBackButton() {
    // إذا كنا في الصفحة الرئيسية، لا نضيف زر رجوع
    const path = location.pathname;
    if (path === '/' || path === '/index.html' || path.endsWith('/index.html')) return;
    if (document.getElementById('global-back-btn')) return; // موجود مسبقاً

    // مسارات مناسبة للعودة حسب الصفحة الحالية
    const isBlogPost = /\/blog\/[^/]+\.html/.test(path);
    const backHref = isBlogPost ? '/blog.html' : '/';
    const backLabel = isBlogPost ? 'العودة للمدونة' : 'العودة للرئيسية';

    const btn = document.createElement('a');
    btn.id = 'global-back-btn';
    btn.href = backHref;
    btn.setAttribute('data-testid', 'global-back-btn');
    btn.setAttribute('aria-label', backLabel);
    btn.className = 'global-back-btn';
    btn.innerHTML = `
      <i class="fas fa-arrow-right" aria-hidden="true"></i>
      <span>${backLabel}</span>
    `;
    btn.addEventListener('click', (e) => {
      // إذا في history حقيقي، استخدمه — وإلا اتبع الرابط
      if (window.history.length > 1 && document.referrer && document.referrer.includes(location.hostname)) {
        e.preventDefault();
        window.history.back();
      }
    });

    document.body.appendChild(btn);

    // CSS مضمّن لضمان التصميم الموحّد
    if (!document.getElementById('global-back-btn-css')) {
      const style = document.createElement('style');
      style.id = 'global-back-btn-css';
      style.textContent = `
        .global-back-btn {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 45;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #1B2A41;
          color: #C9A35E;
          border: 1.5px solid #C9A35E;
          padding: 10px 18px;
          border-radius: 999px;
          font-family: 'Alexandria', 'Tajawal', sans-serif;
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(27,42,65,0.15);
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .global-back-btn:hover {
          background: #C9A35E;
          color: #fff;
          transform: translateX(4px);
          box-shadow: 0 6px 20px rgba(201,163,94,0.35);
        }
        .global-back-btn i { font-size: 14px; }
        @media (max-width: 640px) {
          .global-back-btn {
            top: auto;
            bottom: 100px;
            right: 20px;
            padding: 10px 14px;
            font-size: 12px;
          }
          .global-back-btn span { display: none; }
          .global-back-btn i { font-size: 16px; }
        }
        @media print {
          .global-back-btn { display: none !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ─── 3.5 SCROLL-TO-TOP BUTTON — زر صعود سريع ───
  function initScrollTop() {
    if (document.getElementById('scroll-to-top-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'scroll-to-top-btn';
    btn.type = 'button';
    btn.setAttribute('data-testid', 'scroll-to-top-btn');
    btn.setAttribute('aria-label', 'العودة لأعلى الصفحة');
    btn.className = 'scroll-to-top-btn';
    btn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
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
    initScrollTop();
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
