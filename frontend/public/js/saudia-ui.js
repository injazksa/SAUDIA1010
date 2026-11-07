/* Saudia Design System — small, dependency-free behaviours for redesigned pages (body.sd).
   - Mobile drawer (Escape closes, focus returns to the button)
   - Map loads only when it is about to enter the screen (uses the existing /leaflet-map.js)
   - Copy the requirements list as plain text; print the page
   Nothing here blocks copying, pasting or selecting text. */
(function () {
  'use strict';
  if (!document.body || !document.body.classList.contains('sd')) return;

  /* toast */
  function toast(msg) {
    var t = document.getElementById('sd-toast');
    if (!t) { t = document.createElement('div'); t.id = 'sd-toast'; t.className = 'sd-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* drawer */
  var btn = document.getElementById('sd-menu-btn');
  var drawer = document.getElementById('sd-drawer');
  var backdrop = document.getElementById('sd-backdrop');
  if (btn && drawer && backdrop) {
    var close = drawer.querySelector('[data-sd-close]');
    var setOpen = function (open) {
      drawer.classList.toggle('open', open); backdrop.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open)); drawer.setAttribute('aria-hidden', String(!open));
      if (open) { var first = drawer.querySelector('nav a'); if (first) first.focus(); } else btn.focus({ preventScroll: true });
    };
    btn.addEventListener('click', function () { setOpen(true); });
    backdrop.addEventListener('click', function () { setOpen(false); });
    if (close) close.addEventListener('click', function () { setOpen(false); });
    /* every link in the drawer closes it (2026-11-07: «تواصل معنا» and the phone link sit outside <nav> and left it open) */
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) setOpen(false); });
  }

  /* lazy map: inject the existing leaflet-map.js only when the map is near the viewport */
  var map = document.getElementById('map');
  if (map) {
    var load = function () {
      if (window.__sdMapLoading) return; window.__sdMapLoading = true;
      var s = document.createElement('script'); s.src = '/leaflet-map.js'; s.defer = true;
      s.onload = function () { var w = document.querySelector('.sd-map-wait'); if (w) setTimeout(function () { w.remove(); }, 1200); };
      document.body.appendChild(s);
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); } }, { rootMargin: '400px' });
      io.observe(map);
    } else load();
  }

  /* copy requirements list (profession page) */
  document.querySelectorAll('[data-sd-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var list = document.querySelector(b.getAttribute('data-sd-copy'));
      if (!list) return;
      var title = (document.querySelector('h1') || {}).textContent || document.title;
      var items = Array.prototype.map.call(list.querySelectorAll('.flex-1'), function (s, i) { return (i + 1) + '. ' + s.textContent.trim(); });
      var note = document.querySelector('[data-sd-note]');
      var text = [title.trim(), ''].concat(items).concat(note ? ['', note.textContent.replace(/\s+/g, ' ').trim()] : []).concat(['', location.href.split('#')[0]]).join('\n');
      var done = function () { toast(b.getAttribute('data-sd-copy-msg') || 'نُسخت قائمة الأوراق'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
      function fallback() {
        var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast('حدّد النص وانسخه يدويًا'); }
        ta.remove();
      }
    });
  });

  /* print */
  document.querySelectorAll('[data-sd-print]').forEach(function (b) { b.addEventListener('click', function () { if (window.SD_print) window.SD_print(); else window.print(); }); /* 2026-10-30: same sheet + watermark as every output */ });

  /* home search: an empty search goes to the full list instead of an empty query */
  var form = document.getElementById('sd-home-search');
  if (form) form.addEventListener('submit', function (e) {
    var q = form.querySelector('input[name="search"]');
    if (q && !q.value.trim()) { e.preventDefault(); location.href = form.getAttribute('action'); }
  });
})();
