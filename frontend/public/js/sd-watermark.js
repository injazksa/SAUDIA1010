/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════
   SD_WM — the ONE watermark system of every printed / downloaded document of saudia-visa.com (owner 2026-10-30)
   ────────────────────────────────────────────────────────────────────────────────────────────────────────────
   Before: a «Saudia Visa» tile repeated over the whole sheet (≈17 marks per A4 page), drawn over the text.
   Now:    the document is laid out on explicit A4 pages, and on every page 3–5 marks are placed in its EMPTY areas
           (left side and bottom preferred), never over a heading, a number, a data line, a coloured box or an image.
           The number follows the free space of that page: a full page gets 3, a page with large empty areas up to 5.
   Change the look of ALL outputs here only (CONFIG). Used by:
     • core.js  SD_print()      — tool results (مسار أوراقي، الأهلية، الحاسبة، الجاهزية، التصديق) and Ctrl+P of any page
     • script.js printProfessionDocument() — the profession documents sheet (list of professions / profession details)
     • prototypes/secure-pdf    — the server-side, flattened + signed PDF (same layout, same marks)
   API:  SD_WM.layout(root[, opts]) → report   (root = element holding the document, already in the page)
         SD_WM.css()                            (the CSS of the pages and marks, incl. @page)
         SD_WM.CONFIG
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  if (global.SD_WM) return;
  var MM = 96 / 25.4; // CSS px per millimetre

  var CONFIG = {
    text: 'Saudia Visa', sub: 'saudia-visa.com',
    color: '#1B2A41',
    opacity: 0.11,          // normal mark: visible on inspection, quiet next to the text
    softOpacity: 0.07,      // only when a dense page has no empty area: lighter, and over plain text lines only
    angle: -24,             // degrees
    widthMm: 60,            // length of the mark
    minMarks: 3, maxMarks: 5,
    page: { widthMm: 210, heightMm: 297, marginMm: { top: 12, right: 12, bottom: 14, left: 12 } },
    clearMm: 2.5,           // free distance kept around every text line / box
    minGapMm: 42,           // minimum distance between two marks (centre to centre)
    fill: 0.95,             // share of the page height filled with content (a little room for print rounding)
  };

  function geom() {
    var p = CONFIG.page, m = p.marginMm;
    return { w: (p.widthMm - m.left - m.right) * MM, h: (p.heightMm - m.top - m.bottom) * MM };
  }
  // one mark (SVG): «Saudia Visa» over «saudia-visa.com», drawn on its own axis; rotation is applied by CSS
  // style «stipple» (used by the secure PDF): the same mark drawn as fine dark dots. Seen from reading distance it is as
  // light as the normal mark, but a «remove the light colour» filter keeps the dots, and removing isolated dots also
  // removes the dots of Arabic letters. Set window.SD_WM_STYLE = 'stipple' before layout.
  var uid = 0;
  function markSvg(opacity) {
    var w = Math.round(CONFIG.widthMm * MM), h = Math.round(w * 0.3);
    if (global.SD_WM_STYLE === 'stipple') {
      var id = 'sdwm-dots-' + (++uid), sp = 5.6, r = 1.12; // dot pitch / radius (viewBox units ≈ CSS px): solid dark dots, ≈12 % coverage
      return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 230 69"><defs><pattern id="' + id + '" width="' + sp + '" height="' + sp + '" patternUnits="userSpaceOnUse" patternTransform="rotate(12)"><circle cx="' + sp / 2 + '" cy="' + sp / 2 + '" r="' + r.toFixed(2) + '" fill="' + CONFIG.color + '"/></pattern></defs>' +
        '<g fill="url(#' + id + ')" font-family="Arial,Helvetica,sans-serif" text-anchor="middle"><text x="115" y="38" font-size="36" font-weight="700" letter-spacing="1">' + CONFIG.text +
        '</text><text x="115" y="60" font-size="15" font-weight="700" letter-spacing="1.5">' + CONFIG.sub + '</text></g></svg>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 230 69"><g fill="' + CONFIG.color + '" fill-opacity="' + opacity +
      '" font-family="Arial,Helvetica,sans-serif" text-anchor="middle"><text x="115" y="38" font-size="36" font-weight="700" letter-spacing="1">' + CONFIG.text +
      '</text><text x="115" y="60" font-size="15" letter-spacing="1.5">' + CONFIG.sub + '</text></g></svg>';
  }
  function markDims() { var w = CONFIG.widthMm * MM; return { w: w, h: w * 0.3, inkW: w * 0.92, inkH: w * 0.24 }; }

  function css() {
    var p = CONFIG.page, m = p.marginMm, g = geom();
    return '@page{size:A4;margin:' + m.top + 'mm ' + m.right + 'mm ' + m.bottom + 'mm ' + m.left + 'mm}' +
      '.sdp-page{position:relative;width:' + g.w.toFixed(2) + 'px;box-sizing:border-box;break-after:page;page-break-after:always}' +
      '.sdp-page:last-child{break-after:auto;page-break-after:auto}' +
      '.sdp-page-inner{position:relative;z-index:1;display:flow-root}' +
      '.sdp-wm{position:absolute;z-index:2;pointer-events:none;user-select:none;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      '.sdp-wm svg{display:block}' +
      '@media screen{.sdp-page{margin:0 auto 18px;outline:1px dashed rgba(27,42,65,.15)}}';
  }

  /* ── 1. pagination ─────────────────────────────────────────────────────────────────────────────────────────
     The document's blocks are moved onto pages of the printable height. A block that does not fit moves to the next
     page whole; a container that does not fit is split between its children (its frame is repeated on the next page;
     an <ol> keeps its numbering). Lines, list items, headings, notes and table rows are never split; a heading is
     never left alone at the bottom of a page. */
  var ATOM = /^(LI|P|H1|H2|H3|H4|H5|H6|TR|IMG|SVG|FIGURE|DETAILS|SUMMARY|BLOCKQUOTE|PRE|BUTTON|SELECT|INPUT|TEXTAREA)$/;
  var ATOM_CLASS = /\b(sdp-head|sdp-title|sdp-ctx|sdp-foot|m-slip|sd-notice|document-title|profession-info|print-header|footer|sd-noprint-atom|m-path)\b/;
  function isAtom(n) { return n.nodeType !== 1 || ATOM.test(n.tagName) || ATOM_CLASS.test(n.className && n.className.baseVal === undefined ? n.className : '') || n.getAttribute('data-sdp-atom') !== null; }
  function isHeading(n) { return n.nodeType === 1 && (/^H[1-4]$/.test(n.tagName) || /\b(document-title|m-group-head)\b/.test(n.className || '')); }

  function paginate(root, fill) {
    var g = geom(), avail = g.h * (fill || CONFIG.fill);
    var src = document.createElement('div');
    while (root.firstChild) src.appendChild(root.firstChild);
    root.style.width = g.w + 'px';
    // the pages are plain blocks one after another (a flex / fixed-height container breaks across printed pages
    // differently from what was measured)
    root.style.display = 'block'; root.style.height = 'auto'; root.style.minHeight = '0';
    var pages = [], page, inner, stack = [], placed;
    function shallow(entry) {
      var sh = entry.src.cloneNode(false);
      if (sh.tagName === 'OL') sh.setAttribute('start', String((parseInt(entry.src.getAttribute('start') || '1', 10)) + entry.li));
      if (sh.removeAttribute) sh.removeAttribute('id');
      return sh;
    }
    function newPage() {
      page = document.createElement('div'); page.className = 'sdp-page';
      inner = document.createElement('div'); inner.className = 'sdp-page-inner'; inner.style.display = 'flow-root'; page.appendChild(inner);
      root.appendChild(page); pages.push(page); placed = 0;
      var parent = inner;
      for (var i = 0; i < stack.length; i++) { var sh = shallow(stack[i]); parent.appendChild(sh); stack[i].shell = sh; parent = sh; }
    }
    function target() { return stack.length ? stack[stack.length - 1].shell : inner; }
    function over() { return inner.getBoundingClientRect().height > avail; }
    function countLi(node) { if (node.nodeType === 1 && node.tagName === 'LI' && stack.length && stack[stack.length - 1].src.tagName === 'OL') stack[stack.length - 1].li++; }
    function add(node, next) {
      if (node.nodeType === 3 && !node.textContent.trim()) { target().appendChild(node.cloneNode(false)); return; }
      if (node.nodeType !== 1 && node.nodeType !== 3) return;
      var full = node.cloneNode(true), t = target();
      t.appendChild(full);
      // keep a heading with what follows it: it needs room for itself and ~3 lines after it
      var orphan = isHeading(node) && next && inner.getBoundingClientRect().height + 3 * 16 * 1.6 > avail;
      if (!over() && !orphan) { placed++; countLi(node); return; }
      t.removeChild(full);
      var splittable = node.nodeType === 1 && !isAtom(node) && node.childNodes.length > 1;
      if (!splittable || orphan) {
        if (placed === 0) { t.appendChild(full); placed++; countLi(node); return; } // taller than a page: printed as is
        newPage(); target().appendChild(full); placed++; countLi(node); return;
      }
      var entry = { src: node, li: 0, shell: null }; entry.shell = shallow(entry); t.appendChild(entry.shell); stack.push(entry);
      var kids = Array.prototype.slice.call(node.childNodes);
      for (var i = 0; i < kids.length; i++) add(kids[i], nextElem(kids, i));
      stack.pop();
    }
    function nextElem(arr, i) { for (var j = i + 1; j < arr.length; j++) if (arr[j].nodeType === 1 || (arr[j].nodeType === 3 && arr[j].textContent.trim())) return arr[j]; return null; }
    newPage();
    var top = Array.prototype.slice.call(src.childNodes);
    for (var i = 0; i < top.length; i++) add(top[i], nextElem(top, i));
    // a page left empty by a shell-only split is removed
    pages = pages.filter(function (p) { if (!p.textContent.trim() && !p.querySelector('img,svg')) { p.remove(); return false; } return true; });
    return pages;
  }

  /* ── 2. marks ──────────────────────────────────────────────────────────────────────────────────────────────
     Obstacles = every text line (exact line boxes), image, and box with a background colour, grown by clearMm.
     «hard» = headings, letterhead / title / footer, lines with digits (codes, dates, numbers), coloured boxes, images.
     «soft» = other plain text lines. A mark is a rotated rectangle; overlap is tested exactly (separating axes). */
  // extraMm: placement keeps a little more room than the minimum the checks require (rounding between measuring and printing)
  function rectsOfPage(page, extraMm) {
    var base = page.getBoundingClientRect(), hard = [], soft = [], pad = (CONFIG.clearMm + (extraMm || 0)) * MM;
    var rel = function (r) { return { x: r.left - base.left - pad, y: r.top - base.top - pad, w: r.width + 2 * pad, h: r.height + 2 * pad }; };
    var walker = document.createTreeWalker(page.querySelector('.sdp-page-inner'), NodeFilter.SHOW_TEXT, null);
    var n, range = document.createRange();
    while ((n = walker.nextNode())) {
      if (!n.textContent.trim()) continue;
      var el = n.parentElement; if (!el || el.closest('.sdp-wm')) continue;
      var cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      var isHard = /\d/.test(n.textContent) || !!el.closest('h1,h2,h3,h4,h5,h6,strong,b,th,.sdp-head,.sdp-title,.sdp-foot,.print-header,.document-title,.profession-info,.footer,.m-type,.m-st-line,.sd-num,[data-sdp-hard]');
      range.selectNodeContents(n);
      var rs = range.getClientRects();
      for (var i = 0; i < rs.length; i++) if (rs[i].width > 0.5 && rs[i].height > 0.5) (isHard ? hard : soft).push(rel(rs[i]));
    }
    Array.prototype.forEach.call(page.querySelectorAll('.sdp-page-inner *'), function (e) {
      var r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
      if (/^(IMG|SVG|CANVAS|VIDEO)$/i.test(e.tagName)) { hard.push(rel(r)); return; }
      // dark border lines (a card's navy / gold top rule, dark card edges): the line itself is an obstacle, the card is not
      var csb = e.ownerDocument.defaultView.getComputedStyle(e);
      [['Top', function (bw) { return { left: r.left, top: r.top, width: r.width, height: bw }; }], ['Bottom', function (bw) { return { left: r.left, top: r.bottom - bw, width: r.width, height: bw }; }],
       ['Left', function (bw) { return { left: r.left, top: r.top, width: bw, height: r.height }; }], ['Right', function (bw) { return { left: r.right - bw, top: r.top, width: bw, height: r.height }; }]].forEach(function (s) {
        var bw = parseFloat(csb['border' + s[0] + 'Width']) || 0; if (bw < 1 || csb['border' + s[0] + 'Style'] === 'none') return;
        var bc = (csb['border' + s[0] + 'Color'] || '').match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); if (!bc || (bc[4] !== undefined && +bc[4] < 0.3)) return;
        var bl = (0.2126 * bc[1] + 0.7152 * bc[2] + 0.0722 * bc[3]) / 255;
        if (bl < 0.45 || (bw >= 3 && bl < 0.8)) hard.push(rel(s[1](bw))); // dark lines, or thick coloured rules; thin grey separators may be crossed
      });
      // icons drawn by CSS (icon fonts, ::before / ::after content) are not text nodes: their small box is an obstacle
      if (r.width < 64 && r.height < 64) {
        var W = e.ownerDocument.defaultView, cb = W.getComputedStyle(e, '::before').content, ca = W.getComputedStyle(e, '::after').content;
        if ((cb && cb !== 'none' && cb !== 'normal' && cb !== '""') || (ca && ca !== 'none' && ca !== 'normal' && ca !== '""') || /\bfa[srbl]?\b|\bfa-/.test(typeof e.className === 'string' ? e.className : '')) { hard.push(rel(r)); return; }
      }
      // a box painted with a gradient / image (navy call-to-action panels, banners) is an obstacle like a coloured box
      var bgi = e.ownerDocument.defaultView.getComputedStyle(e).backgroundImage;
      if (bgi && bgi !== 'none') { hard.push(rel(r)); return; }
      var bg = getComputedStyle(e).backgroundColor;
      var m = bg && bg.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
      if (m && (m[4] === undefined || +m[4] > 0.05) && !(+m[1] > 245 && +m[2] > 245 && +m[3] > 245)) {
        // a large LIGHT background (a whole section) is the page itself, not a box: the marks may sit on it between its
        // cards; dark bars and boxes (title bar, notes, cards) stay obstacles
        var lum = (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) / 255;
        if (lum > 0.85 && r.width * r.height > 0.3 * base.width * Math.max(base.height, 1)) return;
        hard.push(rel(r));
      }
    });
    // the last page may use its empty space below the content (inside the sheet); other pages end with their content
    var last = !page.nextElementSibling || !/\bsdp-page\b/.test(page.nextElementSibling.className || '');
    return { hard: hard, soft: soft, w: base.width, h: last ? Math.max(base.height, geom().h * 0.97) : base.height };
  }
  // separating-axis test: rotated rectangle (cx, cy, w, h, angle) vs axis-aligned rectangle
  function hits(c, r) {
    var a = CONFIG.angle * Math.PI / 180, cos = Math.cos(a), sin = Math.sin(a), hw = c.w / 2, hh = c.h / 2;
    var corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(function (p) { return [c.x + p[0] * cos - p[1] * sin, c.y + p[0] * sin + p[1] * cos]; });
    var rc = [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]];
    var axes = [[1, 0], [0, 1], [cos, sin], [-sin, cos]];
    for (var i = 0; i < 4; i++) {
      var ax = axes[i], a1 = Infinity, a2 = -Infinity, b1 = Infinity, b2 = -Infinity;
      corners.forEach(function (p) { var d = p[0] * ax[0] + p[1] * ax[1]; a1 = Math.min(a1, d); a2 = Math.max(a2, d); });
      rc.forEach(function (p) { var d = p[0] * ax[0] + p[1] * ax[1]; b1 = Math.min(b1, d); b2 = Math.max(b2, d); });
      if (a2 < b1 || b2 < a1) return false;
    }
    return true;
  }
  // dense pages: if 3 full-size marks do not fit in the empty areas, smaller marks are tried (same look, same angle)
  // before any mark is allowed over plain text
  var SCALES = [1, 0.75, 0.6];
  function candidates(R, scale) {
    var d = markDims(), a = Math.abs(CONFIG.angle) * Math.PI / 180, w = d.inkW * scale, h = d.inkH * scale;
    var bw = w * Math.cos(a) + h * Math.sin(a), bh = w * Math.sin(a) + h * Math.cos(a); // bounding box of the ink
    var step = 9 * MM / 2, cands = [];
    for (var y = bh / 2 + 2; y <= R.h - bh / 2 - 2; y += step) for (var x = bw / 2 + 2; x <= R.w - bw / 2 - 2; x += step) {
      var c = { x: x, y: y, w: w, h: h, scale: scale };
      if (R.hard.some(function (r) { return hits(c, r); })) continue;
      c.soft = R.soft.filter(function (r) { return hits(c, r); }).length;
      // preference: left side and lower part of the sheet (RTL documents leave them emptier); full size first
      c.pref = (1 - x / R.w) * 0.6 + (y / R.h) * 0.4 + scale * 0.3;
      cands.push(c);
    }
    return cands;
  }
  function decorate(page) {
    Array.prototype.forEach.call(page.querySelectorAll(':scope > .sdp-wm'), function (e) { e.remove(); });
    var R = rectsOfPage(page, 2), d = markDims();
    var cands = candidates(R, 1);
    var free = cands.filter(function (c) { return !c.soft; });
    // free share of the sheet (coarse grid) → how many marks this page deserves
    var cells = 0, empty = 0, cs = 12 * MM;
    for (var gy = cs / 2; gy < R.h; gy += cs) for (var gx = cs / 2; gx < R.w; gx += cs) { cells++; var cell = { x: gx - cs / 2, y: gy - cs / 2, w: cs, h: cs }; var ov = function (r) { return !(r.x > cell.x + cell.w || r.x + r.w < cell.x || r.y > cell.y + cell.h || r.y + r.h < cell.y); }; if (!R.hard.some(ov) && !R.soft.some(ov)) empty++; }
    var freeShare = cells ? empty / cells : 0;
    var want = freeShare < 0.3 ? CONFIG.minMarks : freeShare < 0.55 ? CONFIG.minMarks + 1 : CONFIG.maxMarks;
    var chosen = [];
    function pick(pool, gap, soft) {
      while (chosen.length < want) {
        var best = null, bestScore = -Infinity;
        pool.forEach(function (c) {
          var md = chosen.reduce(function (m, k) { return Math.min(m, Math.hypot(c.x - k.x, c.y - k.y)); }, Infinity);
          if (md < gap) return;
          // two marks never touch: in the marks' own axis (same angle), their rectangles + 6 mm must not overlap
          var ang = CONFIG.angle * Math.PI / 180, co = Math.cos(ang), si = Math.sin(ang), sep = 6 * MM;
          if (chosen.some(function (k) { var dx = c.x - k.x, dy = c.y - k.y, u = dx * co + dy * si, v = -dx * si + dy * co; return Math.abs(u) < (c.w + k.w) / 2 + sep && Math.abs(v) < (c.h + k.h) / 2 + sep; })) return;
          // spread: far from the other marks, and not on the same line as them (balanced, not a row)
          var mdy = chosen.reduce(function (m, k) { return Math.min(m, Math.abs(c.y - k.y)); }, Infinity);
          var score = (chosen.length ? Math.min(md, 400) / 400 * 1.2 + Math.min(mdy, 220) / 220 * 0.6 : 0) + c.pref - (soft ? c.soft * 0.15 : 0);
          if (score > bestScore) { bestScore = score; best = c; }
        });
        if (!best) return;
        best.isSoft = !!soft; chosen.push(best);
      }
    }
    pick(free, CONFIG.minGapMm * MM, false);
    if (chosen.length < want) pick(free, CONFIG.minGapMm * MM * 0.7, false);
    for (var si = 1; si < SCALES.length && chosen.length < CONFIG.minMarks; si++) {
      var keep0 = want; want = CONFIG.minMarks;
      pick(candidates(R, SCALES[si]).filter(function (c) { return !c.soft; }), CONFIG.minGapMm * MM * SCALES[si] * 0.8, false); want = keep0;
    }
    // (owner 2026-10-30: never over the content — a page with no empty room for 3 marks keeps the ones that fit)
    chosen.forEach(function (c) {
      var e = document.createElement('div'); e.className = 'sdp-wm' + (c.isSoft ? ' sdp-wm-soft' : ''); e.setAttribute('aria-hidden', 'true');
      var s = c.scale || 1, w = d.w * s, h = d.h * s;
      e.style.left = (c.x - w / 2).toFixed(1) + 'px'; e.style.top = (c.y - h / 2).toFixed(1) + 'px';
      e.style.width = w.toFixed(1) + 'px'; e.style.height = h.toFixed(1) + 'px';
      e.setAttribute('data-scale', String(s));
      e.style.transform = 'rotate(' + CONFIG.angle + 'deg)';
      e.innerHTML = markSvg(c.isSoft ? CONFIG.softOpacity : CONFIG.opacity).replace(/width="\d+" height="\d+"/, 'width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '"');
      page.appendChild(e);
    });
    return { marks: chosen.length, soft: chosen.filter(function (c) { return c.isSoft; }).length, freeShare: +freeShare.toFixed(2), centres: chosen.map(function (c) { return [Math.round(c.x), Math.round(c.y)]; }) };
  }

  // opts.fill: share of the page height to fill (default CONFIG.fill). A sheet whose print styles ARE its screen styles
  // (the profession sheet) can use 0.99; a page clone printed with extra print rules keeps the safety margin.
  function layout(root, opts) {
    var pages = paginate(root, opts && opts.fill);
    // the document's footer stays at the bottom of the last page (as on the original sheets); the empty space between
    // the content and the footer is where that page's marks go
    var last = pages[pages.length - 1], inner = last && last.querySelector('.sdp-page-inner');
    if (inner && inner.querySelector('.footer,.sdp-foot,[data-sdp-bottom]')) {
      // the free height of the last page is added above the footer (block layout kept: margins still collapse, so the
      // measured page is the printed page)
      var f = inner.querySelector('.footer,.sdp-foot,[data-sdp-bottom]'); var top = f; while (top.parentNode !== inner) top = top.parentNode;
      var target = geom().h * ((opts && opts.fill) || CONFIG.fill) - 2;
      for (var k = 0; k < 3; k++) {
        var free = target - inner.getBoundingClientRect().height; if (free < 1) break;
        top.style.marginTop = ((parseFloat(getComputedStyle(top).marginTop) || 0) + free).toFixed(1) + 'px';
      }
    }
    var rep = pages.map(decorate);
    // measured height of every page (diagnostics: compare with the printed page)
    pages.forEach(function (p) { p.setAttribute('data-h', String(Math.round(p.getBoundingClientRect().height))); var kids = p.firstChild.children; p.setAttribute('data-kids', [].map.call(kids, function (k) { return Math.round(k.getBoundingClientRect().height); }).join(',')); });
    return rep;
  }

  global.SD_WM = { CONFIG: CONFIG, css: css, layout: layout, paginate: paginate, decorate: decorate, markSvg: markSvg, _hits: hits, _rects: rectsOfPage };
})(typeof window !== 'undefined' ? window : this);
