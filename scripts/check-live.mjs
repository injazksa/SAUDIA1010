// AFTER a Netlify deploy (a Deploy Preview is enough) — read-only check of what Netlify REALLY sends.
// No packages needed (Node 18+). Netlify's local tool rewrites cache headers, so this can only be checked online.
//     node scripts/check-live.mjs https://<deploy-preview-address>
// Checks: cache rule per file type (and that two rules were not merged into one contradictory header), content types
// (service worker = JavaScript, manifest), security headers, sitemaps, robots.txt, a few redirects, the 404 page.
const BASE = (process.argv[2] || '').replace(/\/$/, '');
if (!/^https:\/\//.test(BASE)) { console.log('Usage: node scripts/check-live.mjs https://<deploy-preview-address>'); process.exit(2); }
let bad = 0;
const get = async (p, opt = {}) => { const r = await fetch(BASE + p, { redirect: 'manual', ...opt }); await r.arrayBuffer(); return r; };
const line = (ok, ...cols) => { if (!ok) bad++; console.log(`${ok ? 'OK  ' : 'DIFF'} ${cols.join('  ')}`); };
console.log('── cache and type per file type');
const CHECKS = [
  ['/', /max-age=0/, /text\/html/, 'pages: always the latest version'],
  ['/professions.html', /max-age=0/, /text\/html/, 'pages'],
  ['/service-worker.js', /no-cache|no-store/, /javascript/, 'service worker: never stuck on an old version, must be JavaScript'],
  ['/manifest.json', /max-age=86400/, /manifest\+json|json/, 'manifest: one day'],
  ['/core.js', /max-age=3600/, /javascript/, 'scripts: one hour'],
  ['/css/saudia-ds.css?v=20261029', /max-age=3600/, /text\/css/, 'styles: one hour'],
  ['/images/home-hero-visa.webp', /max-age=31536000/, /image\/webp/, 'images: one year'],
  ['/icons/pwa-any-192.png', /max-age=31536000/, /image\/png/, 'app icons: one year'],
  ['/fonts/notokufiarabic-arabic.woff2', /max-age=31536000/, /font\/woff2/, 'fonts: one year'],
  ['/vendor/fontawesome/6.4.0/css/all.min.css', /max-age=31536000/, /text\/css/, 'self-hosted icons (versioned path): one year'],
  ['/fonts/google/alexandria-v6-UMBXrPdDqW66y0Y2usFeai3dAw.woff2', /max-age=31536000/, /font\/woff2/, 'self-hosted fonts: one year'],
  ['/css/gf-6981e41e.css', /max-age=31536000/, /text\/css/, 'self-hosted font styles (hashed name): one year'],
  ['/sitemap.xml', /max-age=3600/, /xml/, 'sitemap index'],
  ['/robots.txt', /max-age=3600/, /text\/plain/, 'robots.txt'],
];
for (const [p, cacheRe, typeRe, why] of CHECKS) {
  const r = await get(p); const cc = r.headers.get('cache-control') || '—'; const ct = (r.headers.get('content-type') || '—').split(';')[0];
  const ages = [...cc.matchAll(/max-age=(\d+)/g)].map((m) => m[1]); const merged = new Set(ages).size > 1;
  line(r.status === 200 && cacheRe.test(cc) && typeRe.test(ct) && !merged, String(r.status).padEnd(4), p.padEnd(60), cc.padEnd(50), ct.padEnd(24), merged ? 'TWO RULES MERGED → see docs/NETLIFY-GUIDE.md §4' : why);
}
console.log('\n── security headers on «/»');
const h = await get('/', { method: 'HEAD' });
for (const k of ['strict-transport-security', 'content-security-policy', 'x-frame-options', 'x-content-type-options', 'referrer-policy']) line(!!h.headers.get(k), k);
console.log('\n── sitemaps, redirects, 404');
const sm = await (await fetch(BASE + '/sitemap.xml')).text();
for (const m of sm.matchAll(/<loc>https:\/\/saudia-visa\.com(\/[^<]+)<\/loc>/g)) { const r = await get(m[1]); line(r.status === 200, String(r.status), m[1]); }
const REDIRECTS = [['/engineers', '/saudi-council-of-engineers-registration.html'], ['/post?id=umrah', '/blog/umrah-visa-guide-2026.html'], ['/blog/family', '/blog/family-sponsorship-guide.html'], [`/p/${encodeURIComponent('مؤرخ-263301')}.html`, null]];
for (const [from, to] of REDIRECTS) { const r = await get(from); const loc = decodeURIComponent((r.headers.get('location') || '').replace(/^https?:\/\/[^/]+/, '').split('?')[0]); line(r.status === 301 && (!to || loc === to), String(r.status), decodeURIComponent(from), '→', loc || '—'); }
const nf = await get('/no-such-page-check-live.html'); line(nf.status === 404, String(nf.status), '/no-such-page-check-live.html (must be 404)');
console.log(bad ? `\n${bad} difference(s) — see docs/NETLIFY-GUIDE.md` : '\nAll checks match.');
process.exit(bad ? 1 : 0);
