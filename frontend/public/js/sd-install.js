/* js/sd-install.js — «ثبّت التطبيق» (restored 2026-10-31; the site had this button before the redesign).
   • Chrome / Edge / Android / desktop: when the browser says the site can be installed (beforeinstallprompt), a gold
     «ثبّت التطبيق» button appears; it opens the browser's own install window.
   • iPhone / iPad Safari (no install window exists there): a short hint — Share button, then «إضافة إلى الشاشة الرئيسية».
   • Never inside the installed app, never printed; closed = not shown again for 14 days; hides itself after 12 s.
   Loaded by core.js after the page has finished loading (no cost to the first view). */
(function () {
  'use strict';
  if (window.__sdInstall) return; window.__sdInstall = true;
  var EN = /^en/i.test(document.documentElement.lang || '');
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  if (standalone) return;
  var KEY = 'sd-install-dismissed';
  function dismissedRecently() { try { var t = +localStorage.getItem(KEY); return t && Date.now() - t < 14 * 864e5; } catch (e) { return false; } }
  function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* private mode */ } }
  if (dismissedRecently()) return;
  var CSS = '.sd-install{position:fixed;inset-inline-start:16px;bottom:96px;z-index:9990;display:flex;align-items:center;gap:8px;max-width:calc(100vw - 32px);' +
    'background:#C9A35E;color:#1B2A41;border-radius:999px;padding:10px 12px 10px 16px;box-shadow:0 10px 24px rgba(27,42,65,.28);font:700 14px/1.4 "Noto Kufi Arabic",Tahoma,sans-serif;direction:' + (EN ? 'ltr' : 'rtl') + ';transition:opacity .3s}' +
    '.sd-install button{font:inherit;border:0;cursor:pointer;background:none;color:inherit;padding:0}.sd-install .sd-install-go{display:inline-flex;align-items:center;gap:8px}' +
    '.sd-install .sd-install-x{width:28px;height:28px;border-radius:50%;background:rgba(27,42,65,.12);display:inline-flex;align-items:center;justify-content:center;font-size:16px;line-height:1}' +
    '.sd-install .sd-install-x:focus-visible,.sd-install .sd-install-go:focus-visible{outline:3px solid #1B2A41;outline-offset:2px}' +
    '.sd-install.ios{border-radius:14px;align-items:flex-start;font-weight:600;font-size:13px}' +
    '@media print{.sd-install{display:none!important}}@media (prefers-reduced-motion:reduce){.sd-install{transition:none}}';
  function show(html, cls, onGo) {
    if (document.querySelector('.sd-install')) return null;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var b = document.createElement('div'); b.className = 'sd-install' + (cls ? ' ' + cls : ''); b.setAttribute('role', 'region'); b.setAttribute('aria-label', EN ? 'Install the app' : 'تثبيت التطبيق');
    b.innerHTML = html + '<button type="button" class="sd-install-x" aria-label="' + (EN ? 'Close' : 'إغلاق') + '">×</button>';
    document.body.appendChild(b);
    var close = function (keep) { if (!keep) remember(); b.style.opacity = '0'; setTimeout(function () { b.remove(); }, 300); };
    b.querySelector('.sd-install-x').addEventListener('click', function () { close(false); });
    var go = b.querySelector('.sd-install-go'); if (go && onGo) go.addEventListener('click', function () { onGo(close); });
    setTimeout(function () { if (document.body.contains(b)) close(true); }, 12000); // as before: it hides itself (shown again next visit)
    return b;
  }
  var ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14"/></svg>';
  // Chrome / Edge / Android / desktop
  var deferred = window.__sdDeferredInstall || null;
  function offer() {
    if (!deferred) return;
    show('<button type="button" class="sd-install-go">' + ICON + (EN ? 'Install the app' : 'ثبّت التطبيق') + '</button>', '', function (close) {
      var p = deferred; deferred = null; window.__sdDeferredInstall = null;
      p.prompt(); (p.userChoice || Promise.resolve()).then(function () { close(true); }, function () { close(true); });
    });
  }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; offer(); });
  window.addEventListener('appinstalled', function () { var b = document.querySelector('.sd-install'); if (b) b.remove(); remember(); });
  if (deferred) offer();
  // iPhone / iPad Safari: instructions (Safari has no install window)
  var ua = navigator.userAgent || '';
  var iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var safari = iOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  if (safari) setTimeout(function () {
    // (the iOS «Share» icon: a box with an arrow going up)
    var SHARE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-3px"><path d="M12 15V3m0 0-4 4m4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
    show('<span>' + (EN ? 'To install: tap Share ' + SHARE + ' then «Add to Home Screen».' : 'لتثبيت التطبيق: اضغط زر المشاركة ' + SHARE + ' ثم «إضافة إلى الشاشة الرئيسية».') + '</span>', 'ios');
  }, 4000);
})();
