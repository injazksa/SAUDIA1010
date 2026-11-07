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
    bandMm: 50,             // 2026-11-07: (checks) every horizontal band of this height holds part of a mark
    maxGapMm: 28,           // 2026-11-07: largest vertical gap allowed between the ink of two marks (crop resistance)
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
  // 2026-11-07: the mark is drawn as OUTLINES (one path, Arial Bold «Saudia Visa» over «saudia-visa.com», generated once from
  // the font with mupdf text=path). In the PDF it is shapes, not text: it cannot be found or deleted by searching for «Saudia Visa».
  var MARK_D = 'M10.03 29.54L15.08 29.05C15.39 30.75 16 32 16.93 32.8C17.86 33.59 19.11 33.99 20.69 33.99C22.36 33.99 23.62 33.64 24.47 32.93C25.31 32.22 25.74 31.39 25.74 30.44C25.74 29.83 25.56 29.31 25.2 28.88C24.85 28.46 24.22 28.08 23.34 27.77C22.73 27.56 21.34 27.18 19.18 26.64C16.4 25.95 14.45 25.11 13.33 24.1C11.75 22.68 10.96 20.96 10.96 18.92C10.96 17.61 11.33 16.38 12.08 15.24C12.82 14.1 13.89 13.23 15.28 12.63C16.68 12.04 18.36 11.74 20.34 11.74C23.56 11.74 25.99 12.45 27.62 13.87C29.25 15.29 30.1 17.18 30.19 19.55L25 19.76C24.78 18.44 24.3 17.49 23.57 16.91C22.84 16.34 21.75 16.05 20.29 16.05C18.78 16.05 17.6 16.36 16.75 16.98C16.2 17.37 15.92 17.91 15.92 18.57C15.92 19.18 16.18 19.7 16.69 20.13C17.35 20.68 18.94 21.25 21.46 21.85C23.98 22.45 25.85 23.07 27.06 23.7C28.27 24.34 29.21 25.21 29.9 26.32C30.58 27.43 30.92 28.79 30.92 30.42C30.92 31.89 30.51 33.27 29.7 34.56C28.88 35.85 27.72 36.81 26.23 37.43C24.73 38.06 22.87 38.37 20.64 38.37C17.39 38.37 14.89 37.62 13.15 36.12C11.41 34.61 10.37 32.42 10.03 29.54ZM39.93 25.02L35.46 24.21C35.96 22.39 36.83 21.04 38.05 20.17C39.28 19.29 41.1 18.85 43.52 18.85C45.72 18.85 47.35 19.11 48.43 19.63C49.5 20.15 50.26 20.81 50.7 21.61C51.13 22.41 51.35 23.88 51.35 26.02L51.3 31.77C51.3 33.4 51.38 34.61 51.54 35.38C51.69 36.16 51.99 36.99 52.42 37.88L47.55 37.88C47.42 37.55 47.26 37.07 47.08 36.43C47 36.13 46.94 35.94 46.9 35.85C46.06 36.67 45.16 37.28 44.2 37.69C43.25 38.1 42.22 38.3 41.14 38.3C39.22 38.3 37.71 37.78 36.61 36.75C35.5 35.71 34.95 34.4 34.95 32.82C34.95 31.78 35.2 30.84 35.7 30.02C36.21 29.2 36.91 28.57 37.82 28.14C38.72 27.7 40.03 27.32 41.73 26.99C44.03 26.56 45.63 26.16 46.52 25.79L46.52 25.29C46.52 24.34 46.28 23.66 45.82 23.25C45.35 22.84 44.47 22.64 43.17 22.64C42.29 22.64 41.61 22.81 41.12 23.17C40.63 23.52 40.23 24.14 39.93 25.02M46.52 29.01C45.89 29.22 44.89 29.47 43.52 29.76C42.15 30.05 41.26 30.33 40.84 30.61C40.2 31.06 39.88 31.63 39.88 32.32C39.88 33 40.13 33.59 40.65 34.09C41.16 34.58 41.81 34.83 42.61 34.83C43.5 34.83 44.34 34.54 45.15 33.97C45.75 33.53 46.14 32.99 46.32 32.36C46.45 31.94 46.52 31.15 46.52 29.98L46.52 29.01ZM69.45 37.88L69.45 35.1C68.77 36.09 67.88 36.87 66.78 37.44C65.68 38.02 64.51 38.3 63.28 38.3C62.03 38.3 60.91 38.03 59.92 37.48C58.93 36.93 58.21 36.16 57.76 35.17C57.32 34.17 57.1 32.8 57.1 31.05L57.1 19.27L62.02 19.27L62.02 27.8C62.02 30.41 62.11 32.01 62.29 32.6C62.48 33.19 62.81 33.66 63.28 34C63.76 34.34 64.37 34.52 65.11 34.52C65.95 34.52 66.7 34.29 67.37 33.83C68.03 33.37 68.49 32.79 68.73 32.11C68.98 31.43 69.1 29.76 69.1 27.1L69.1 19.27L74.03 19.27L74.03 37.88L69.45 37.88ZM97.19 37.88L92.62 37.88L92.62 35.15C91.86 36.21 90.96 37 89.93 37.52C88.89 38.04 87.85 38.3 86.8 38.3C84.66 38.3 82.83 37.44 81.31 35.72C79.78 33.99 79.02 31.59 79.02 28.51C79.02 25.35 79.76 22.95 81.24 21.31C82.73 19.67 84.6 18.85 86.87 18.85C88.95 18.85 90.75 19.72 92.27 21.44L92.27 12.19L97.19 12.19L97.19 37.88M84.05 28.18C84.05 30.17 84.32 31.6 84.87 32.49C85.67 33.77 86.78 34.41 88.2 34.41C89.33 34.41 90.3 33.93 91.09 32.97C91.89 32.01 92.28 30.57 92.28 28.66C92.28 26.52 91.9 24.98 91.13 24.04C90.36 23.11 89.37 22.64 88.17 22.64C87 22.64 86.02 23.1 85.23 24.03C84.44 24.95 84.05 26.34 84.05 28.18ZM103.04 16.75L103.04 12.19L107.96 12.19L107.96 16.75L103.04 16.75M103.04 37.88L103.04 19.27L107.96 19.27L107.96 37.88L103.04 37.88ZM117.69 25.02L113.22 24.21C113.72 22.39 114.59 21.04 115.81 20.17C117.04 19.29 118.86 18.85 121.28 18.85C123.48 18.85 125.11 19.11 126.19 19.63C127.26 20.15 128.02 20.81 128.46 21.61C128.89 22.41 129.11 23.88 129.11 26.02L129.06 31.77C129.06 33.4 129.14 34.61 129.3 35.38C129.46 36.16 129.75 36.99 130.18 37.88L125.31 37.88C125.18 37.55 125.02 37.07 124.84 36.43C124.76 36.13 124.7 35.94 124.66 35.85C123.82 36.67 122.92 37.28 121.96 37.69C121.01 38.1 119.98 38.3 118.9 38.3C116.98 38.3 115.47 37.78 114.37 36.75C113.26 35.71 112.71 34.4 112.71 32.82C112.71 31.78 112.96 30.84 113.47 30.02C113.97 29.2 114.67 28.57 115.58 28.14C116.48 27.7 117.79 27.32 119.49 26.99C121.79 26.56 123.39 26.16 124.28 25.79L124.28 25.29C124.28 24.34 124.04 23.66 123.58 23.25C123.11 22.84 122.23 22.64 120.93 22.64C120.05 22.64 119.37 22.81 118.88 23.17C118.39 23.52 117.99 24.14 117.69 25.02M124.28 29.01C123.65 29.22 122.65 29.47 121.28 29.76C119.91 30.05 119.02 30.33 118.6 30.61C117.96 31.06 117.64 31.63 117.64 32.32C117.64 33 117.89 33.59 118.41 34.09C118.92 34.58 119.57 34.83 120.37 34.83C121.26 34.83 122.1 34.54 122.91 33.97C123.51 33.53 123.9 32.99 124.08 32.36C124.21 31.94 124.28 31.15 124.28 29.98L124.28 29.01ZM152.52 37.88L143.34 12.19L148.96 12.19L155.46 31.19L161.76 12.19L167.26 12.19L158.06 37.88L152.52 37.88ZM170.22 16.75L170.22 12.19L175.14 12.19L175.14 16.75L170.22 16.75M170.22 37.88L170.22 19.27L175.14 19.27L175.14 37.88L170.22 37.88ZM179.45 32.59L184.39 31.82C184.6 32.77 185.03 33.49 185.67 33.99C186.31 34.48 187.21 34.73 188.37 34.73C189.64 34.73 190.6 34.49 191.24 34.03C191.68 33.7 191.89 33.26 191.89 32.71C191.89 32.34 191.77 32.03 191.54 31.79C191.3 31.55 190.75 31.34 189.89 31.14C185.92 30.27 183.4 29.47 182.34 28.74C180.87 27.74 180.13 26.34 180.13 24.56C180.13 22.95 180.77 21.59 182.04 20.5C183.32 19.4 185.29 18.85 187.97 18.85C190.51 18.85 192.41 19.26 193.64 20.09C194.88 20.92 195.73 22.14 196.2 23.76L191.56 24.63C191.36 23.91 190.98 23.35 190.43 22.97C189.87 22.58 189.08 22.39 188.05 22.39C186.76 22.39 185.83 22.57 185.27 22.93C184.89 23.19 184.71 23.52 184.71 23.93C184.71 24.28 184.87 24.58 185.2 24.82C185.64 25.15 187.17 25.61 189.8 26.21C192.42 26.8 194.25 27.53 195.29 28.4C196.32 29.27 196.83 30.49 196.83 32.06C196.83 33.77 196.12 35.23 194.7 36.46C193.27 37.69 191.16 38.3 188.37 38.3C185.83 38.3 183.83 37.79 182.35 36.76C180.87 35.74 179.91 34.35 179.45 32.59ZM205.82 25.02L201.35 24.21C201.85 22.39 202.72 21.04 203.95 20.17C205.17 19.29 206.99 18.85 209.41 18.85C211.61 18.85 213.24 19.11 214.32 19.63C215.39 20.15 216.15 20.81 216.59 21.61C217.03 22.41 217.25 23.88 217.25 26.02L217.19 31.77C217.19 33.4 217.27 34.61 217.43 35.38C217.59 36.16 217.88 36.99 218.31 37.88L213.44 37.88C213.31 37.55 213.16 37.07 212.97 36.43C212.89 36.13 212.83 35.94 212.79 35.85C211.95 36.67 211.05 37.28 210.1 37.69C209.14 38.1 208.12 38.3 207.03 38.3C205.11 38.3 203.6 37.78 202.5 36.75C201.4 35.71 200.84 34.4 200.84 32.82C200.84 31.78 201.1 30.84 201.6 30.02C202.1 29.2 202.8 28.57 203.71 28.14C204.61 27.7 205.92 27.32 207.63 26.99C209.93 26.56 211.52 26.16 212.41 25.79L212.41 25.29C212.41 24.34 212.18 23.66 211.71 23.25C211.24 22.84 210.36 22.64 209.06 22.64C208.19 22.64 207.5 22.81 207.01 23.17C206.52 23.52 206.12 24.14 205.82 25.02M212.41 29.01C211.78 29.22 210.78 29.47 209.41 29.76C208.05 30.05 207.15 30.33 206.73 30.61C206.09 31.06 205.77 31.63 205.77 32.32C205.77 33 206.02 33.59 206.54 34.09C207.05 34.58 207.71 34.83 208.5 34.83C209.39 34.83 210.24 34.54 211.04 33.97C211.64 33.53 212.03 32.99 212.22 32.36C212.35 31.94 212.41 31.15 212.41 29.98L212.41 29.01ZM49.85 57.49L51.15 57.29C51.22 57.81 51.43 58.2 51.76 58.48C52.09 58.75 52.56 58.89 53.16 58.89C53.76 58.89 54.21 58.77 54.5 58.53C54.8 58.28 54.94 58 54.94 57.67C54.94 57.37 54.81 57.14 54.55 56.97C54.37 56.86 53.93 56.71 53.21 56.53C52.25 56.29 51.58 56.08 51.21 55.9C50.83 55.72 50.55 55.48 50.36 55.16C50.17 54.85 50.07 54.5 50.07 54.12C50.07 53.77 50.15 53.45 50.31 53.16C50.47 52.86 50.68 52.62 50.95 52.42C51.16 52.27 51.44 52.15 51.79 52.04C52.14 51.94 52.52 51.88 52.93 51.88C53.53 51.88 54.07 51.97 54.53 52.15C54.99 52.32 55.33 52.56 55.55 52.86C55.77 53.17 55.92 53.57 56 54.07L54.71 54.25C54.66 53.85 54.49 53.54 54.21 53.31C53.93 53.09 53.53 52.98 53.02 52.98C52.42 52.98 51.99 53.08 51.73 53.28C51.47 53.48 51.34 53.71 51.34 53.97C51.34 54.14 51.4 54.3 51.5 54.43C51.61 54.57 51.78 54.69 52.01 54.78C52.14 54.83 52.52 54.94 53.17 55.11C54.1 55.36 54.75 55.57 55.11 55.72C55.48 55.88 55.77 56.11 55.98 56.41C56.19 56.72 56.29 57.09 56.29 57.54C56.29 57.97 56.16 58.39 55.91 58.77C55.65 59.16 55.28 59.46 54.8 59.67C54.32 59.88 53.78 59.99 53.17 59.99C52.16 59.99 51.39 59.78 50.86 59.36C50.34 58.94 50 58.32 49.85 57.49ZM64.41 58.86C63.92 59.27 63.45 59.56 63 59.73C62.55 59.9 62.07 59.99 61.55 59.99C60.7 59.99 60.05 59.78 59.59 59.36C59.13 58.95 58.9 58.41 58.9 57.77C58.9 57.39 58.99 57.04 59.16 56.73C59.34 56.41 59.56 56.16 59.84 55.97C60.12 55.78 60.44 55.64 60.79 55.54C61.05 55.47 61.44 55.4 61.96 55.34C63.02 55.22 63.8 55.07 64.3 54.89C64.31 54.71 64.31 54.6 64.31 54.55C64.31 54.02 64.18 53.64 63.94 53.42C63.6 53.13 63.1 52.98 62.44 52.98C61.82 52.98 61.36 53.09 61.07 53.3C60.77 53.52 60.56 53.9 60.42 54.45L59.13 54.28C59.25 53.73 59.44 53.28 59.71 52.94C59.98 52.6 60.36 52.34 60.87 52.16C61.37 51.98 61.96 51.88 62.63 51.88C63.29 51.88 63.83 51.96 64.24 52.12C64.66 52.27 64.96 52.47 65.15 52.7C65.35 52.94 65.49 53.24 65.56 53.6C65.61 53.82 65.63 54.23 65.63 54.81L65.63 56.56C65.63 57.79 65.66 58.56 65.71 58.88C65.77 59.21 65.88 59.52 66.05 59.81L64.67 59.81C64.54 59.54 64.45 59.22 64.41 58.86M64.3 55.91C63.82 56.11 63.11 56.28 62.15 56.41C61.61 56.49 61.23 56.58 61.01 56.68C60.78 56.78 60.61 56.92 60.49 57.11C60.37 57.3 60.31 57.5 60.31 57.73C60.31 58.09 60.44 58.38 60.7 58.61C60.97 58.85 61.36 58.97 61.87 58.97C62.38 58.97 62.83 58.85 63.22 58.63C63.61 58.41 63.9 58.11 64.09 57.72C64.23 57.42 64.3 56.98 64.3 56.4L64.3 55.91ZM74.24 59.81L74.24 58.67C73.64 59.55 72.82 59.99 71.78 59.99C71.33 59.99 70.9 59.9 70.5 59.73C70.1 59.55 69.81 59.33 69.62 59.06C69.43 58.8 69.29 58.47 69.21 58.09C69.16 57.83 69.13 57.42 69.13 56.86L69.13 52.06L70.45 52.06L70.45 56.36C70.45 57.05 70.47 57.51 70.53 57.75C70.61 58.09 70.78 58.36 71.05 58.56C71.32 58.76 71.65 58.86 72.05 58.86C72.44 58.86 72.81 58.76 73.16 58.55C73.5 58.35 73.75 58.08 73.89 57.73C74.03 57.38 74.1 56.88 74.1 56.21L74.1 52.06L75.42 52.06L75.42 59.81L74.24 59.81ZM84 59.81L84 58.83C83.51 59.6 82.79 59.99 81.84 59.99C81.22 59.99 80.65 59.82 80.13 59.48C79.61 59.14 79.21 58.66 78.93 58.05C78.64 57.44 78.5 56.74 78.5 55.94C78.5 55.17 78.63 54.47 78.89 53.84C79.14 53.21 79.53 52.72 80.05 52.39C80.56 52.05 81.14 51.88 81.78 51.88C82.24 51.88 82.66 51.98 83.03 52.18C83.39 52.38 83.69 52.63 83.92 52.95L83.92 49.11L85.22 49.11L85.22 59.81L84 59.81M79.85 55.94C79.85 56.93 80.06 57.67 80.48 58.16C80.9 58.65 81.39 58.89 81.96 58.89C82.53 58.89 83.02 58.66 83.42 58.19C83.82 57.72 84.03 57.01 84.03 56.05C84.03 54.99 83.82 54.22 83.41 53.72C83 53.23 82.5 52.98 81.9 52.98C81.32 52.98 80.83 53.22 80.44 53.69C80.05 54.17 79.85 54.92 79.85 55.94ZM88.79 50.63L88.79 49.11L90.11 49.11L90.11 50.63L88.79 50.63M88.79 59.81L88.79 52.06L90.11 52.06L90.11 59.81L88.79 59.81ZM98.66 58.86C98.18 59.27 97.71 59.56 97.26 59.73C96.81 59.9 96.32 59.99 95.81 59.99C94.96 59.99 94.3 59.78 93.84 59.36C93.39 58.95 93.16 58.41 93.16 57.77C93.16 57.39 93.24 57.04 93.42 56.73C93.59 56.41 93.81 56.16 94.09 55.97C94.37 55.78 94.69 55.64 95.04 55.54C95.3 55.47 95.69 55.4 96.21 55.34C97.27 55.22 98.05 55.07 98.55 54.89C98.56 54.71 98.56 54.6 98.56 54.55C98.56 54.02 98.44 53.64 98.19 53.42C97.85 53.13 97.35 52.98 96.69 52.98C96.07 52.98 95.62 53.09 95.32 53.3C95.03 53.52 94.81 53.9 94.67 54.45L93.38 54.28C93.5 53.73 93.69 53.28 93.96 52.94C94.23 52.6 94.61 52.34 95.12 52.16C95.63 51.98 96.21 51.88 96.88 51.88C97.54 51.88 98.08 51.96 98.49 52.12C98.91 52.27 99.21 52.47 99.41 52.7C99.6 52.94 99.74 53.24 99.82 53.6C99.86 53.82 99.88 54.23 99.88 54.81L99.88 56.56C99.88 57.79 99.91 58.56 99.97 58.88C100.02 59.21 100.13 59.52 100.3 59.81L98.92 59.81C98.79 59.54 98.7 59.22 98.66 58.86M98.55 55.91C98.08 56.11 97.36 56.28 96.41 56.41C95.87 56.49 95.48 56.58 95.26 56.68C95.04 56.78 94.86 56.92 94.74 57.11C94.62 57.3 94.56 57.5 94.56 57.73C94.56 58.09 94.69 58.38 94.96 58.61C95.22 58.85 95.61 58.97 96.12 58.97C96.63 58.97 97.08 58.85 97.47 58.63C97.87 58.41 98.16 58.11 98.34 57.72C98.48 57.42 98.55 56.98 98.55 56.4L98.55 55.91ZM102.9 56.6L102.9 55.27L106.94 55.27L106.94 56.6L102.9 56.6ZM112.04 59.81L109.09 52.06L110.48 52.06L112.14 56.7C112.32 57.2 112.49 57.72 112.64 58.26C112.76 57.86 112.92 57.36 113.13 56.79L114.85 52.06L116.2 52.06L113.27 59.81L112.04 59.81ZM118.87 50.63L118.87 49.11L120.18 49.11L120.18 50.63L118.87 50.63M118.87 59.81L118.87 52.06L120.18 52.06L120.18 59.81L118.87 59.81ZM123.15 57.49L124.45 57.29C124.52 57.81 124.73 58.2 125.06 58.48C125.39 58.75 125.86 58.89 126.46 58.89C127.06 58.89 127.51 58.77 127.8 58.53C128.1 58.28 128.24 58 128.24 57.67C128.24 57.37 128.11 57.14 127.85 56.97C127.67 56.86 127.23 56.71 126.51 56.53C125.55 56.29 124.88 56.08 124.51 55.9C124.13 55.72 123.85 55.48 123.66 55.16C123.47 54.85 123.37 54.5 123.37 54.12C123.37 53.77 123.45 53.45 123.61 53.16C123.77 52.86 123.98 52.62 124.25 52.42C124.46 52.27 124.74 52.15 125.09 52.04C125.44 51.94 125.82 51.88 126.23 51.88C126.83 51.88 127.37 51.97 127.83 52.15C128.29 52.32 128.63 52.56 128.85 52.86C129.07 53.17 129.22 53.57 129.3 54.07L128.01 54.25C127.96 53.85 127.79 53.54 127.51 53.31C127.23 53.09 126.83 52.98 126.32 52.98C125.72 52.98 125.29 53.08 125.03 53.28C124.77 53.48 124.64 53.71 124.64 53.97C124.64 54.14 124.7 54.3 124.8 54.43C124.91 54.57 125.08 54.69 125.31 54.78C125.44 54.83 125.82 54.94 126.47 55.11C127.4 55.36 128.05 55.57 128.41 55.72C128.78 55.88 129.07 56.11 129.28 56.41C129.49 56.72 129.59 57.09 129.59 57.54C129.59 57.97 129.46 58.39 129.21 58.77C128.95 59.16 128.58 59.46 128.1 59.67C127.62 59.88 127.08 59.99 126.47 59.99C125.46 59.99 124.69 59.78 124.16 59.36C123.64 58.94 123.3 58.32 123.15 57.49ZM137.71 58.86C137.22 59.27 136.75 59.56 136.3 59.73C135.85 59.9 135.37 59.99 134.85 59.99C134 59.99 133.35 59.78 132.89 59.36C132.43 58.95 132.2 58.41 132.2 57.77C132.2 57.39 132.29 57.04 132.46 56.73C132.64 56.41 132.86 56.16 133.14 55.97C133.42 55.78 133.74 55.64 134.09 55.54C134.35 55.47 134.74 55.4 135.26 55.34C136.32 55.22 137.1 55.07 137.6 54.89C137.6 54.71 137.61 54.6 137.61 54.55C137.61 54.02 137.48 53.64 137.23 53.42C136.9 53.13 136.4 52.98 135.74 52.98C135.12 52.98 134.66 53.09 134.37 53.3C134.07 53.52 133.86 53.9 133.72 54.45L132.43 54.28C132.55 53.73 132.74 53.28 133.01 52.94C133.28 52.6 133.66 52.34 134.17 52.16C134.67 51.98 135.26 51.88 135.93 51.88C136.59 51.88 137.13 51.96 137.54 52.12C137.96 52.27 138.26 52.47 138.45 52.7C138.65 52.94 138.79 53.24 138.86 53.6C138.91 53.82 138.93 54.23 138.93 54.81L138.93 56.56C138.93 57.79 138.96 58.56 139.01 58.88C139.07 59.21 139.18 59.52 139.35 59.81L137.97 59.81C137.84 59.54 137.75 59.22 137.71 58.86M137.6 55.91C137.12 56.11 136.41 56.28 135.45 56.41C134.91 56.49 134.53 56.58 134.31 56.68C134.08 56.78 133.91 56.92 133.79 57.11C133.67 57.3 133.61 57.5 133.61 57.73C133.61 58.09 133.74 58.38 134 58.61C134.27 58.85 134.66 58.97 135.17 58.97C135.67 58.97 136.13 58.85 136.52 58.63C136.91 58.41 137.2 58.11 137.39 57.72C137.53 57.42 137.6 56.98 137.6 56.4L137.6 55.91ZM142.83 59.81L142.83 58.31L144.33 58.31L144.33 59.81L142.83 59.81ZM153.17 56.97L154.46 57.13C154.32 58.03 153.96 58.73 153.38 59.23C152.8 59.74 152.08 59.99 151.24 59.99C150.17 59.99 149.32 59.64 148.68 58.95C148.03 58.25 147.71 57.26 147.71 55.96C147.71 55.13 147.85 54.4 148.13 53.77C148.4 53.14 148.83 52.67 149.39 52.35C149.96 52.04 150.58 51.88 151.24 51.88C152.09 51.88 152.77 52.1 153.31 52.52C153.85 52.95 154.19 53.56 154.34 54.34L153.06 54.54C152.94 54.02 152.72 53.63 152.42 53.37C152.11 53.11 151.73 52.98 151.29 52.98C150.63 52.98 150.09 53.21 149.68 53.69C149.27 54.16 149.06 54.91 149.06 55.93C149.06 56.97 149.26 57.72 149.66 58.19C150.06 58.66 150.58 58.89 151.22 58.89C151.74 58.89 152.17 58.74 152.51 58.42C152.86 58.1 153.08 57.62 153.17 56.97ZM156.59 55.94C156.59 54.5 156.99 53.44 157.79 52.75C158.46 52.17 159.27 51.88 160.23 51.88C161.3 51.88 162.17 52.23 162.84 52.93C163.52 53.63 163.86 54.59 163.86 55.83C163.86 56.82 163.71 57.61 163.41 58.18C163.11 58.75 162.67 59.2 162.1 59.51C161.53 59.83 160.91 59.99 160.23 59.99C159.14 59.99 158.27 59.64 157.6 58.94C156.93 58.25 156.59 57.25 156.59 55.94M157.94 55.93C157.94 56.92 158.16 57.66 158.59 58.15C159.03 58.65 159.57 58.89 160.23 58.89C160.88 58.89 161.42 58.65 161.86 58.15C162.29 57.66 162.51 56.9 162.51 55.89C162.51 54.93 162.29 54.21 161.85 53.72C161.42 53.22 160.88 52.98 160.23 52.98C159.57 52.98 159.03 53.22 158.59 53.71C158.16 54.2 157.94 54.94 157.94 55.93ZM166.89 59.81L166.89 52.06L168.07 52.06L168.07 53.14C168.31 52.76 168.64 52.46 169.04 52.23C169.45 52 169.91 51.88 170.42 51.88C171 51.88 171.47 52 171.83 52.24C172.2 52.48 172.46 52.81 172.61 53.23C173.22 52.33 174.02 51.88 175.01 51.88C175.78 51.88 176.37 52.1 176.78 52.52C177.19 52.95 177.4 53.6 177.4 54.49L177.4 59.81L176.09 59.81L176.09 54.92C176.09 54.4 176.05 54.02 175.97 53.79C175.88 53.55 175.73 53.37 175.5 53.23C175.28 53.09 175.02 53.02 174.71 53.02C174.17 53.02 173.72 53.2 173.36 53.56C173 53.92 172.82 54.5 172.82 55.3L172.82 59.81L171.5 59.81L171.5 54.77C171.5 54.18 171.39 53.75 171.18 53.45C170.97 53.16 170.62 53.02 170.13 53.02C169.76 53.02 169.42 53.11 169.1 53.31C168.79 53.5 168.56 53.79 168.42 54.16C168.28 54.54 168.21 55.08 168.21 55.79L168.21 59.81L166.89 59.81Z';
  function markSvg(opacity) {
    var w = Math.round(CONFIG.widthMm * MM), h = Math.round(w * 0.3);
    if (global.SD_WM_STYLE === 'stipple') {
      var id = 'sdwm-dots-' + (++uid), sp = 5.6, r = 1.12; // dot pitch / radius (viewBox units ≈ CSS px): solid dark dots, ≈12 % coverage
      return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 230 69"><defs><pattern id="' + id + '" width="' + sp + '" height="' + sp + '" patternUnits="userSpaceOnUse" patternTransform="rotate(12)"><circle cx="' + sp / 2 + '" cy="' + sp / 2 + '" r="' + r.toFixed(2) + '" fill="' + CONFIG.color + '"/></pattern></defs>' +
        '<path fill="url(#' + id + ')" d="' + MARK_D + '"/></svg>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 230 69"><path fill="' + CONFIG.color + '" fill-opacity="' + opacity + '" d="' + MARK_D + '"/></svg>';
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
      // (2026-11-07) a list item whose number is drawn by ::before (ring badge, right side in RTL): the badge is an obstacle
      if (e.tagName === 'LI') { var lb = e.ownerDocument.defaultView.getComputedStyle(e, '::before').content; if (lb && lb !== 'none' && lb !== 'normal' && lb !== '""') hard.push(rel({ left: r.right - 32, top: r.top, width: 32, height: Math.min(r.height, 34) })); }
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
        // (2026-11-07) a LIGHT box (cream / pale card): its own text lines stay obstacles; only the crop-band marks may use its empty inside
        var hr = rel(r); if (lum > 0.85) hr.light = true; hard.push(hr);
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
    // 2026-11-07 (owner): a crop of the sheet from one item to another must still hold a mark. The page is cut into
    // horizontal bands of CONFIG.bandMm; every band without a mark gets one: first in its empty area (any of the three
    // sizes), and only if there is none, a LIGHT mark over plain text lines — never over a heading, a number, a coloured
    // box or an image (those stay «hard» obstacles). Bands alternate sides so the marks do not form one column.
    var BAND = CONFIG.bandMm * MM, sep6 = 6 * MM, angB = CONFIG.angle * Math.PI / 180, coB = Math.cos(angB), siB = Math.sin(angB);
    var apart = function (c) { return !chosen.some(function (k) { var dx = c.x - k.x, dy = c.y - k.y, u = dx * coB + dy * siB, v = -dx * siB + dy * coB; return Math.abs(u) < (c.w + k.w) / 2 + sep6 && Math.abs(v) < (c.h + k.h) / 2 + sep6; }); };
    var RB = { hard: R.hard.filter(function (r) { return !r.light; }), soft: R.soft, w: R.w, h: R.h };
    var pools = SCALES.concat([0.45]).map(function (s) { return candidates(RB, s); });
    // vertical extent of a mark's ink (rotated); a band is covered when some mark's ink enters it by at least 12 mm
    var absA = Math.abs(angB), inkY = function (k) { var s = k.scale || 1, bh = (d.inkW * s) * Math.sin(absA) + (d.inkH * s) * Math.cos(absA); return [k.y - bh / 2, k.y + bh / 2]; };
    var covers = function (k, a, b) { var e = inkY(k); return Math.min(e[1], b) - Math.max(e[0], a) >= Math.min(12 * MM, (b - a) * 0.5); };
    // gap filling: the vertical gap between the ink of two marks (and between the page edges and the first / last mark)
    // must not exceed CONFIG.maxGapMm, so any crop taller than ~2 × that gap keeps part of a mark
    var GAP = CONFIG.maxGapMm * MM, unfillable = [], lastSide = 0;
    for (var it = 0; it < 12; it++) {
      var ext = chosen.map(inkY).sort(function (a, b) { return a[0] - b[0]; }), cur = 0, gaps = [];
      ext.forEach(function (x) { if (x[0] - cur > GAP) gaps.push([cur, x[0]]); cur = Math.max(cur, x[1]); });
      if (R.h - cur > GAP) gaps.push([cur, R.h]);
      gaps = gaps.filter(function (g) { return !unfillable.some(function (u) { return Math.abs(u[0] - g[0]) < 1 && Math.abs(u[1] - g[1]) < 1; }); });
      if (!gaps.length) break;
      gaps.sort(function (a, b) { return (b[1] - b[0]) - (a[1] - a[0]); });
      var gp = gaps[0], mid = (gp[0] + gp[1]) / 2, side = lastSide ? 0 : 1, best = null, bestSc = -Infinity;
      for (var pass = 0; pass < 2 && !best; pass++) { // pass 0: empty area only; pass 1: light mark over plain text
        for (var pi = 0; pi < pools.length && !best; pi++) {
          pools[pi].forEach(function (c) {
            if ((pass === 0 && c.soft) || !apart(c)) return;
            var ie = inkY(c), ov = Math.min(ie[1], gp[1]) - Math.max(ie[0], gp[0]); if (ov < Math.min(10 * MM, (gp[1] - gp[0]) * 0.5)) return;
            var sideScore = side ? c.x / R.w : 1 - c.x / R.w;
            var sc = -Math.abs(c.y - mid) / (R.h || 1) * 2 + sideScore * 0.6 + (c.scale || 1) * 0.5 - c.soft * 0.2;
            if (sc > bestSc) { bestSc = sc; best = c; }
          });
        }
      }
      if (best) { best.isSoft = best.soft > 0; best.band = true; chosen.push(best); lastSide = side; } else unfillable.push(gp);
    }    chosen.forEach(function (c) {
      var e = document.createElement('div'); e.className = 'sdp-wm' + (c.isSoft ? ' sdp-wm-soft' : ''); e.setAttribute('aria-hidden', 'true');
      var s = c.scale || 1, w = d.w * s, h = d.h * s;
      e.style.left = (c.x - w / 2).toFixed(1) + 'px'; e.style.top = (c.y - h / 2).toFixed(1) + 'px';
      e.style.width = w.toFixed(1) + 'px'; e.style.height = h.toFixed(1) + 'px';
      e.setAttribute('data-scale', String(s));
      e.style.transform = 'rotate(' + CONFIG.angle + 'deg)';
      e.innerHTML = markSvg(c.isSoft ? CONFIG.softOpacity : CONFIG.opacity).replace(/width="\d+" height="\d+"/, 'width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '"');
      page.appendChild(e);
    });
    return { marks: chosen.length, bands: chosen.filter(function (c) { return c.band; }).length, soft: chosen.filter(function (c) { return c.isSoft; }).length, freeShare: +freeShare.toFixed(2), centres: chosen.map(function (c) { return [Math.round(c.x), Math.round(c.y)]; }) };
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
