/* js/sd-print.js — moved out of core.js on 2026-10-30 (loaded by core.js, and directly by the pages without core.js). */
/* ════════════════════════════════════════════════════════════════
   Unified print (owner 2026-10-27): every printed page of the site carries the office letterhead, a quiet
   «Saudia Visa» watermark and a short footer. Contact details are the ones already used across the site
   (schema-markup.js / footer): address, phone, e-mail, website. Dates use Western digits (dd/mm/yyyy).
   window.SD_print(element, title, context) prints ONE result (a tool's result card) on a clean sheet.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.SD_print) return;
  var EN = /^en/i.test(document.documentElement.lang || '');
  var OFFICE = EN
    ? { name: 'Saudi Visa Office in Jordan', sub: 'Saudia Visa', address: 'First Circle, Jabal Amman, Jordan', phone: '+962 78 988 1009', email: 'Visa@saudia-visa.com', web: 'www.saudia-visa.com' }
    : { name: 'مكتب تأشيرات السعودية في الأردن', sub: 'Saudia Visa', address: 'الدوار الأول - جبل عمّان، الأردن', phone: '+962 78 988 1009', email: 'Visa@saudia-visa.com', web: 'www.saudia-visa.com' };
  function today() { var d = new Date(); var p = function (n) { return (n < 10 ? '0' : '') + n; }; return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function esc(s) { return String(s || '').replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function headHtml(title, context) {
    return '<div class="sdp-head"' + (EN ? ' dir="ltr" style="direction:ltr"' : '') + '><img src="/icons/logo-192.png" alt="" width="54" height="54"><div><b>' + OFFICE.name + '</b><span>' + OFFICE.sub + '</span></div>' +
      '<ul' + (EN ? ' style="text-align:right"' : '') + '><li>' + OFFICE.address + '</li><li dir="ltr">' + OFFICE.phone + '</li><li dir="ltr">' + OFFICE.email + '</li><li dir="ltr">' + OFFICE.web + '</li></ul></div>' +
      '<div class="sdp-title"' + (EN ? ' dir="ltr" style="direction:ltr"' : '') + '>' + (title ? '<h1>' + esc(title) + '</h1>' : '<i></i>') + '<span>' + (EN ? 'Printed: ' : 'تاريخ الطباعة: ') + '<bdi>' + today() + '</bdi></span></div>' +
      (context ? '<p class="sdp-ctx">' + esc(context) + '</p>' : '');
  }
  // 2026-10-30: the watermark is no longer a tile over the whole sheet. The document is laid out on A4 pages and every
  // page gets 3–5 marks in its empty areas — js/sd-watermark.js (SD_WM), the one system for every output of the site.
  var WM_SRC = '/js/sd-watermark.js?v=20261107';
  var FOOT = EN ? '<div class="sdp-foot" dir="ltr" style="direction:ltr">A guidance sheet from ' + OFFICE.name + '. The final requirements are set by the official authorities; this sheet does not mean the application is accepted or that a visa will be issued.</div>' : '<div class="sdp-foot">هذه ورقة إرشادية من ' + OFFICE.name + '. المتطلبات النهائية تحددها الجهات الرسمية، ولا تعني هذه الورقة قبول المعاملة أو ضمان صدور التأشيرة.</div>';
  // the sheet's own look applies on screen too (the sheet is measured off-screen before printing, so the measured pages
  // are the printed pages); it is hidden on screen except while it is being measured
  var CSS = '#sdp-sheet{display:none}#sdp-fallback{display:none}' +
    'body.sdp-measure #sdp-sheet{display:block!important;position:absolute!important;left:-30000px!important;top:0!important;background:#fff}' +
    '#sdp-sheet{background:#fff;color:#1B2A41}' +
    '.sdp-head{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;border-bottom:2px solid #C9A35E;padding-bottom:10px;margin-bottom:12px;direction:rtl;font-family:"Noto Kufi Arabic",Arial,sans-serif;color:#1B2A41}' +
    '.sdp-head img{width:54px;height:54px}.sdp-head b{display:block;font-size:15pt}.sdp-head div span{font-size:10pt;color:#8A5A0A;letter-spacing:.04em}' +
    '.sdp-head ul{list-style:none;margin:0;padding:0;font-size:8.5pt;line-height:1.55;color:#334155;text-align:left}' +
    '.sdp-title{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:6px 0 8px;direction:rtl}.sdp-title h1{font-size:15pt;margin:0;color:#1B2A41}.sdp-title span{font-size:9pt;color:#475569}' +
    '.sdp-ctx{font-size:10pt;color:#334155;margin:0 0 10px}' +
    '.sdp-foot{margin-top:14px;padding-top:8px;border-top:1px solid #cbd5e1;font-size:8.5pt;color:#475569;line-height:1.6;direction:rtl}' +
    '#sdp-sheet .sd-noprint,#sdp-sheet button,#sdp-sheet .sd-ready-actions,#sdp-sheet select,#sdp-sheet .m-status,#sdp-sheet .sd-skip,#sdp-sheet .sd-fab,#sdp-sheet .m-dock,#sdp-sheet #uh-header,#sdp-sheet .sd-footer{display:none!important}' +
    '#sdp-sheet .m-prof h2,#sdp-sheet .m-print-ctx,#sdp-sheet .sd-ready-kicker,#sdp-sheet .m-tools,#sdp-sheet .m-link,#sdp-sheet .m-wa,#sdp-sheet .m-bar{display:none!important}' +
    'body.sd .sdp-title h1,.sdp-title h1{font-size:15pt!important;line-height:1.4!important}#sdp-sheet h2{font-size:13pt!important}#sdp-sheet h3{font-size:11.5pt!important}#sdp-sheet{font-size:11pt}' +
    '#sdp-sheet *{box-shadow:none!important}#sdp-sheet a{color:#000!important;text-decoration:none!important}' +
    // 2026-10-31: entrance animations start at opacity 0 and printing captures that first frame (the calculator result
    // printed empty): no animation inside the printed sheet
    '#sdp-sheet,#sdp-sheet *{animation:none!important;transition:none!important}' +
    '#sdp-sheet .sd-has-ph,#sdp-sheet .sd-has-ph *{background:#fff!important;color:#1B2A41!important}#sdp-sheet .sd-ph{display:none!important}' +
    '@media print{' +
    'html,body{background:#fff!important}' +
    'body:not(.sdp-mode) #sdp-fallback.on{display:block!important;position:fixed;inset:0;pointer-events:none;z-index:2147483000;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    'body.sdp-mode>*:not(#sdp-sheet){display:none!important}' +
    'body.sdp-mode #sdp-sheet{display:block!important;position:relative;z-index:1}' +
    // 2026-10-31: a page whose scrolling is locked (an open window or menu: body fixed, html/body overflow hidden) would
    // clip the printed sheet to one screen — blank, half or mid-document pages. While printing the sheet, the lock is off.
    'html:has(body.sdp-mode){overflow:visible!important;height:auto!important}' +
    'body.sdp-mode{position:static!important;overflow:visible!important;height:auto!important;top:auto!important;transform:none!important}' +
    'body:not(.sd)>section.bg-navy,body:not(.sd)>section.bg-navy *{background:#fff!important;color:#1B2A41!important}body:not(.sd)>section.bg-navy{padding:0 0 8px!important}main h1,body:not(.sd)>section.bg-navy h1{font-size:20pt!important;line-height:1.4!important}' +
    '#sv-floating-contact,#scroll-to-top-btn,#page-share-fab,#page-share-menu,#global-back-btn,.sd-fab,.m-dock,.sd-toast{display:none!important}' +
    '}';
  function loadWM(cb) {
    if (window.SD_WM) { cb(); return; }
    var s = document.querySelector('script[data-sd-wm]');
    if (!s) { s = document.createElement('script'); s.src = WM_SRC; s.setAttribute('data-sd-wm', ''); document.head.appendChild(s); }
    s.addEventListener('load', cb, { once: true });
  }
  function setup() {
    if (document.getElementById('sdp-style')) return;
    var st = document.createElement('style'); st.id = 'sdp-style'; st.textContent = CSS; document.head.appendChild(st);
    loadWM(function () { var w = document.createElement('style'); w.id = 'sdp-wm-style'; w.textContent = window.SD_WM.css(); document.head.appendChild(w); });
  }
  // build the sheet (letterhead + content + footer) and lay it out on A4 pages with the marks.
  // The layout is measured in an invisible frame exactly as wide as the printed page, with the page's stylesheets and
  // its print-only rules: responsive rules then resolve as they will on paper (a phone or a wide screen would not), so
  // the measured pages ARE the printed pages. The laid-out pages are then copied into this page and printed.
  function sheetEl() {
    var sheet = document.getElementById('sdp-sheet');
    if (!sheet) { sheet = document.createElement('div'); sheet.id = 'sdp-sheet'; sheet.setAttribute('aria-hidden', 'true'); document.body.appendChild(sheet); }
    return sheet;
  }
  function build(content, title, context, keepIds, done) {
    var clone = content.cloneNode(true); clone.hidden = false;
    if (!keepIds) { clone.removeAttribute('id'); [].forEach.call(clone.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); }); }
    var holder = document.createElement('div'); holder.innerHTML = headHtml(title, context); holder.appendChild(clone); holder.insertAdjacentHTML('beforeend', FOOT);
    var page = window.SD_WM.CONFIG.page, m = page.marginMm, wPx = Math.round((page.widthMm - m.left - m.right) * 96 / 25.4);
    var heads = [].map.call(document.querySelectorAll('link[rel="stylesheet"],style'), function (n) { return n.id === 'sdp-print-as-screen' ? '' : n.outerHTML; }).join('');
    var ifr = document.createElement('iframe'); ifr.setAttribute('aria-hidden', 'true'); ifr.tabIndex = -1;
    // (2026-10-31) the frame is as wide as the PAPER: on paper the page's responsive rules see the paper's width (A4 =
    // 794 px), not the text column — measured at the column width, layouts switched (one column / two columns) and the
    // measured pages were not the printed pages (blank pages, split cards). The sheet itself keeps the column width.
    ifr.style.cssText = 'position:fixed;left:-30000px;top:0;width:' + Math.round(page.widthMm * 96 / 25.4) + 'px;height:' + Math.round((page.heightMm || 297) * 96 / 25.4) + 'px;border:0;visibility:hidden';
    document.body.appendChild(ifr);
    var d = ifr.contentDocument, H = document.documentElement;
    d.open();
    d.write('<!doctype html><html lang="' + (H.lang || '') + '" dir="' + (H.dir || '') + '" class="' + (H.className || '') + '"><head><meta charset="utf-8"><base href="' + location.href + '">' + heads +
      '<style>' + printRules() + '</style><style>html,body{margin:0;padding:0;background:#fff}#sdp-sheet{display:block!important;position:static!important;width:' + wPx + 'px}</style></head>' +
      '<body class="' + (document.body.className || '').replace(/\bsdp-(mode|measure)\b/g, '') + '"><div id="sdp-sheet" dir="' + (EN ? 'ltr' : 'rtl') + '">' + holder.innerHTML + '</div>' +
      '<script src="' + WM_SRC + '"><\/script></body></html>');
    d.close();
    var finished = false;
    var go = function () {
      if (finished) return; finished = true;
      var w = ifr.contentWindow;
      var run = function () {
        var st = d.createElement('style'); st.textContent = w.SD_WM.css(); d.head.appendChild(st);
        var sh = d.getElementById('sdp-sheet'), orig = sh.innerHTML;
        w.SD_WM.layout(sh);
        // 2026-10-31 (owner): never a last page holding only the closing note. The last block of content (paragraph /
        // item) is given, for the measurement only, the note's height below it: it then moves to the next page and the
        // note follows it. The height is removed afterwards and given back above the note (the note stays at the bottom).
        if (footAlone(sh)) {
          var fh = Math.ceil(sh.querySelector('.sdp-foot').getBoundingClientRect().height) + 24;
          sh.innerHTML = orig; sh.removeAttribute('style');
          var L = lastBlock(sh);
          if (L) {
            L.style.paddingBottom = fh + 'px'; L.setAttribute('data-sdp-keepnote', '');
            w.SD_WM.layout(sh);
            var k = sh.querySelector('[data-sdp-keepnote]'), f = [].slice.call(sh.querySelectorAll('.sdp-foot')).pop();
            if (k) { k.style.paddingBottom = ''; k.removeAttribute('data-sdp-keepnote'); }
            if (f) f.style.marginTop = ((parseFloat(w.getComputedStyle(f).marginTop) || 0) + fh).toFixed(1) + 'px';
          } else w.SD_WM.layout(sh);
        }
        var sheet = sheetEl(); sheet.setAttribute('dir', EN ? 'ltr' : 'rtl'); sheet.innerHTML = d.getElementById('sdp-sheet').innerHTML;
        ifr.remove(); document.body.classList.add('sdp-mode'); done();
      };
      if (d.fonts && d.fonts.ready) d.fonts.ready.then(run); else run();
    };
    ifr.addEventListener('load', go, { once: true });
    setTimeout(function () { if (!finished && ifr.contentWindow && ifr.contentWindow.SD_WM) go(); }, 4000);
  }
  // the last page holds only the closing note (no content of the document)
  function footAlone(sh) {
    var ps = sh.querySelectorAll('.sdp-page'); if (ps.length < 2) return false;
    var inner = ps[ps.length - 1].querySelector('.sdp-page-inner'); if (!inner) return false;
    var f = inner.querySelector('.sdp-foot'); if (!f) return false;
    return inner.textContent.replace(/\s+/g, '').length - f.textContent.replace(/\s+/g, '').length < 40;
  }
  // the last block of text before the closing note (deepest last paragraph / item / heading with text)
  function lastBlock(sh) {
    var f = sh.querySelector('.sdp-foot'), n = f && f.previousElementSibling;
    while (n) {
      var kids = [].filter.call(n.children, function (c) { return c.textContent.trim() && !/^(BR|SPAN|B|STRONG|I|EM|A|BDI|SMALL|SVG)$/.test(c.tagName); });
      if (!kids.length || /^(P|LI|H[1-6]|TR|DETAILS|BLOCKQUOTE)$/.test(n.tagName)) return n.textContent.trim() ? n : null;
      n = kids[kids.length - 1];
    }
    return null;
  }
  // the page's printable content: [data-sd-print-root] / <main> / <article>, else its content sections
  function pageRoot() {
    var main = document.querySelector('[data-sd-print-root]') || document.querySelector('main') || document.querySelector('article');
    if (main) return main;
    main = document.createElement('div');
    [].forEach.call(document.body.children, function (n) {
      if (/^(SCRIPT|STYLE|NOSCRIPT|HEADER|FOOTER|NAV|TEMPLATE|LINK|IFRAME)$/.test(n.tagName) || n.id === 'sdp-sheet' || n.id === 'uh-header' || /\b(sd-footer|sd-fab|sd-skip|sd-toast)\b/.test(n.className || '')) return;
      var pos = getComputedStyle(n).position; if (pos === 'fixed' || pos === 'sticky' || getComputedStyle(n).display === 'none') return;
      main.appendChild(n.cloneNode(true));
    });
    return main.children.length ? main : null;
  }
  // printing from the browser menu cannot be prepared in advance: a light fallback — 3 small marks along the left edge of
  // every printed page (fixed elements repeat on each page)
  function fallbackMarks() {
    if (!window.SD_WM || document.getElementById('sdp-fallback')) return;
    var f = document.createElement('div'); f.id = 'sdp-fallback'; f.setAttribute('aria-hidden', 'true');
    f.innerHTML = [18, 50, 82].map(function (top) { return '<div style="position:absolute;left:0;top:' + top + '%;transform:rotate(' + window.SD_WM.CONFIG.angle + 'deg) scale(.7);transform-origin:left center">' + window.SD_WM.markSvg(window.SD_WM.CONFIG.softOpacity) + '</div>'; }).join('');
    document.body.appendChild(f);
  }
  // every rule inside «@media print» of the page's stylesheets (not @page; not the rules that hide the page around the
  // sheet, which only apply in sdp-mode), as plain rules
  function printRules() {
    var out = [];
    function walk(rules, inPrint) {
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (r.type === 4) { var m = r.media && r.media.mediaText || ''; var pr = /\bprint\b/.test(m) && !/\bscreen\b/.test(m); walk(r.cssRules, inPrint || pr); }
        else if (inPrint && r.type === 1) out.push(r.cssText);
      }
    }
    for (var i = 0; i < document.styleSheets.length; i++) { var s = document.styleSheets[i]; if (s.ownerNode && s.ownerNode.id === 'sdp-print-as-screen') continue; try { walk(s.cssRules, /\bprint\b/.test(s.media && s.media.mediaText || '')); } catch (e) { /* cross-origin sheet */ } }
    return out.join('\n');
  }
  function cleanup() { if (window.__SDP_KEEP) return; /* tests: keep the sheet between two prints */ document.body.classList.remove('sdp-mode'); var s = document.getElementById('sdp-sheet'); if (s) s.innerHTML = ''; var f = document.getElementById('sdp-fallback'); if (f) f.className = ''; }
  var printing = false;
  // el = a tool result (its own title / context) · no el = the whole page (print button, Ctrl+P)
  window.SD_print = function (el, title, context) {
    setup();
    if (printing) return;
    loadWM(function () {
      var content = el || pageRoot();
      if (!content) { window.print(); return; }
      printing = true;
      build(content, el ? title : '', el ? context : '', !el, function () {
        var done = function () { printing = false; cleanup(); window.removeEventListener('afterprint', done); };
        window.addEventListener('afterprint', done);
        setTimeout(function () { window.print(); }, 30);
      });
    });
  };
  // Ctrl+P / ⌘P goes through the same sheet (prepared first, then the print dialog)
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
      e.preventDefault();
      // 2026-10-31: with a profession's window open, Ctrl+P prints THAT profession's sheet (same as its «طباعة» button),
      // not the list page behind the window
      var pm = document.getElementById('professionModal');
      if (pm && !pm.classList.contains('hidden') && typeof window.printProfessionDetails === 'function') { window.printProfessionDetails(); return; }
      window.SD_print();
    }
  });
  // printing from the browser menu (not prepared): the light fallback marks
  window.addEventListener('beforeprint', function () {
    if (printing || document.body.classList.contains('sdp-mode')) return;
    fallbackMarks(); var f = document.getElementById('sdp-fallback'); if (f) f.className = 'on';
  });
  window.addEventListener('afterprint', function () { if (!printing) cleanup(); });
  window.SD_printToday = today;
  window.SD_printRules = printRules; // (tests: measure under the same rules)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
