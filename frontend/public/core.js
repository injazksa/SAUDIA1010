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
      { match: (p) => p.endsWith('/professional.html'),
        msg: 'مرحبًا، لدي استفسار حول برنامج التحقق والفحص المهني (QVP) للمملكة العربية السعودية. أرجو إفادتي بالمتطلبات.' },
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
    //    نُحدّث النص دائماً (حتى لو فيه ?text= قديم) — الهدف رسالة ذكية سياقية.
    //    الاستثناء الوحيد: data-wa-keep (لو أحد أراد الإبقاء على نص مخصص).
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

    // قائمة الروابط الموحّدة
    const NAV_ITEMS = [
      { href: '/index.html',         label: 'الرئيسية',         icon: 'fa-home' },
      { href: '/about.html',         label: 'من نحن',           icon: 'fa-building' },
      { href: '/index.html#services',label: 'خدماتنا',          icon: 'fa-briefcase' },
      { href: '/corporate.html',     label: 'خدمات الشركات',    icon: 'fa-city' },
      { href: '/professions.html',   label: 'المهن والأوراق',   icon: 'fa-list-check' },
      { href: '/professional.html',  label: 'الاعتماد المهني (QVP)', icon: 'fa-user-check' },
      { href: '/certificates.html',  label: 'تصديق الشهادات',   icon: 'fa-certificate' },
      { href: '/work-visa.html',     label: 'تأشيرة العمل',     icon: 'fa-passport' },
      { href: '/calculator.html',    label: 'حاسبة الرسوم',     icon: 'fa-calculator' },
      { href: '/other-services.html',label: 'خدمات أخرى',        icon: 'fa-concierge-bell' },
      { href: '/blog.html',          label: 'المدونة',          icon: 'fa-newspaper' },
      { href: '/faq.html',           label: 'الأسئلة الشائعة',  icon: 'fa-circle-question' }
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
        <a href="/" class="uh-brand" data-testid="uh-brand">
          <img src="/icons/logo-192.png" alt="مكتب تأشيرات السعودية في الأردن" class="uh-logo">
          <span class="uh-title">مكتب تأشيرات السعودية<span class="uh-title-sub"> في الأردن</span></span>
        </a>
        <button type="button" id="uh-toggle" class="uh-toggle" aria-label="فتح القائمة" aria-expanded="false" aria-controls="uh-drawer" data-testid="uh-menu-toggle">
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
    drawer.querySelectorAll('.uh-nav a').forEach(a => a.addEventListener('click', () => close()));

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
        }
        #uh-header .uh-logo { height: 38px; width: auto; display: block; }
        #uh-header .uh-title { font-weight: 800; font-size: 13px; line-height: 1.25; color: #1B2A41; letter-spacing: -.2px; }
        #uh-header .uh-title-sub { color: #C9A35E; font-weight: 700; }
        @media (min-width: 640px) { #uh-header .uh-title { font-size: 15px; } #uh-header .uh-logo { height: 42px; } }

        #uh-header .uh-toggle {
          width: 44px; height: 44px; border-radius: 12px;
          background: #1B2A41; color: #fff;
          display: inline-flex; align-items: center; justify-content: center;
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
      '.uh-nav a',                       // روابط الـ drawer
      '.rm-btn',                         // أزرار اقرأ المزيد
      '[data-stamp]'                     // أي عنصر يريد تفعيلها صراحةً
    ].join(',');

    document.addEventListener('pointerdown', (e) => {
      const target = e.target.closest(selector);
      if (!target) return;
      // ماعدا الروابط داخل iframe/external/ثقيلة
      if (target.matches('#uh-backdrop, #uh-close')) return;
      spawnStamp(target, e);
    }, { passive: true });

    function spawnStamp(el, event) {
      // اضمن أن العنصر يمكن احتواء المؤثر بداخله
      const cs = getComputedStyle(el);
      if (cs.position === 'static') el.style.position = 'relative';
      if (cs.overflow === 'visible') el.style.overflow = 'hidden';

      const rect = el.getBoundingClientRect();
      const x = (event.clientX ?? (rect.left + rect.width/2)) - rect.left;
      const y = (event.clientY ?? (rect.top + rect.height/2)) - rect.top;
      const maxDim = Math.max(rect.width, rect.height);
      const size = Math.max(maxDim * 1.6, 80);

      const stamp = document.createElement('span');
      stamp.className = 'stamp-fx';
      stamp.style.setProperty('--x', x + 'px');
      stamp.style.setProperty('--y', y + 'px');
      stamp.style.setProperty('--size', size + 'px');
      el.appendChild(stamp);
      // cleanup بعد انتهاء الأنيميشن
      setTimeout(() => stamp.remove(), 640);
    }

    if (!document.getElementById('stamp-fx-css')) {
      const style = document.createElement('style');
      style.id = 'stamp-fx-css';
      style.textContent = `
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
          0%   { transform: scale(.25); opacity: .0; }
          18%  { opacity: .95; }
          100% { transform: scale(1); opacity: 0; }
        }
        /* نسخة على الخلفيات الفاتحة — اجعل المزج normal حتى يبدو الذهب واضحاً */
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
          .stamp-fx { display: none !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ─── INIT ───
  function init() {
    initLazyImages();
    setupResourceHints();
    initUnifiedHeader();
    initBackButton();
    initScrollTop();
    initSmoothAnchors();
    initMobileMenu();
    initQuoteShare();
    initDynamicWhatsApp();
    initReadMoreButtons();
    initClickStamp();
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
