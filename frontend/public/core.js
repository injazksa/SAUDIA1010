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
    // reading progress bar init (auto-detect if article page)
    initReadingProgress();

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

  // ─── Shared helper: هل الصفحة الحالية مقال؟ (يعمل على أي مقال حالي ومستقبلي) ───
  function isArticlePage() {
    const path = location.pathname;
    const isBlogPath = /\/blog\/[^/]+\.html?(\?|$)/.test(path) || /\/post(-[^/]+)?\.html?(\?|$)/.test(path);
    if (isBlogPath) return true;
    const art = document.querySelector('article');
    if (art) {
      const txt = (art.innerText || art.textContent || '').trim();
      if (txt.length > 1500) return true;
    }
    return false;
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

  // ─── INIT ───
  function init() {
    initLazyImages();
    setupResourceHints();
    initBackButton();
    initScrollTop();
    initSmoothAnchors();
    initMobileMenu();
    initQuoteShare();
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
