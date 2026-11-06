// Sitemap generator — runs on every Netlify build (netlify.toml → [build] command) and can be run by hand.
// No packages needed (Node 18+).
//
// What it does, from the files in frontend/public alone:
//   • finds every page that Google may index: .html files that are NOT noindex, NOT a meta-refresh stub, NOT 404 /
//     offline / verification files, NOT a redirect source in _redirects or netlify.toml, and whose canonical points to
//     ITSELF (a page that says "my original is elsewhere" is left out);
//   • writes sitemap.xml as a Sitemap INDEX that points to one file per section:
//       sitemap-pages.xml (main pages) · sitemap-professions.xml (/p/) · sitemap-blog.xml (/blog/) · sitemap-en.xml (/en/)
//       · sitemap-images.xml (the content images of each page)
//     (a section is split into -2, -3 … files automatically past 45,000 addresses — Google's limit is 50,000);
//   • every address is absolute https://saudia-visa.com/… exactly as the page's canonical says (Arabic letters
//     percent-encoded as browsers send them);
//   • <lastmod> = the date the page's VISIBLE TEXT last changed. scripts/sitemap-state.json keeps a fingerprint of
//     each page's text; when the text changes (or a page is new) the date becomes today (Amman time). Changes to tags in
//     <head> only (icons, sharing tags …) do not move the date.
//
// A new page, profession or article is picked up automatically; a deleted page drops out automatically.
// Run locally after adding / editing pages and commit the result, so the dates are kept between builds:
//     node scripts/sitemap.mjs            (writes the sitemaps + updates scripts/sitemap-state.json)
//     node scripts/sitemap.mjs --check    (writes nothing; exit 1 if the sitemaps in the folder are out of date)
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(REPO, 'frontend', 'public');
const STATE = path.join(REPO, 'scripts', 'sitemap-state.json');
const HOST = 'https://saudia-visa.com';
const CHECK = process.argv.includes('--check');
const MAX_PER_FILE = 45000;
const SKIP_DIR = /^(admin|admin-secure|content|data|vendor|fonts|images|icons|css|js|\.well-known|\.netlify)(\/|$)/;
const NEVER = /^(404|offline)\.html$|^google[\w-]*\.html$/;

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Amman', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const xmlEsc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// a folder page (x/index.html) is served and canonical at x/ — e.g. /saudi-qvp-professional-accreditation/
const urlOf = (rel) => `${HOST}/${rel.replace(/(^|\/)index\.html$/, '$1')}`;
const norm = (u) => { try { const x = new URL(u, HOST); let p = decodeURIComponent(x.pathname); p = p.replace(/(^|\/)index\.html$/, '$1'); return x.origin + p; } catch (e) { return u; } };
const locOf = (u) => { const x = new URL(u, HOST); return xmlEsc(HOST + encodeURI(decodeURIComponent(x.pathname))); };
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i')); return m ? m[1] : ''; };

// redirect sources (the file exists but visitors are sent elsewhere) — from both redirect files
const redirectSources = new Set();
const addSrc = (p) => { try { redirectSources.add(decodeURIComponent(p)); } catch (e) { redirectSources.add(p); } };
if (fs.existsSync(path.join(PUB, '_redirects'))) for (const l of fs.readFileSync(path.join(PUB, '_redirects'), 'utf8').split(/\r?\n/)) { const m = l.trim().match(/^(\/[^\s*:]*)\s+(\S+)\s+(30[1278])/); if (m) addSrc(m[1]); }
if (fs.existsSync(path.join(REPO, 'netlify.toml'))) for (const b of fs.readFileSync(path.join(REPO, 'netlify.toml'), 'utf8').split('[[redirects]]').slice(1)) { const f = (b.match(/from\s*=\s*"(\/[^"*:]*)"/) || [])[1], s = +((b.match(/status\s*=\s*(\d+)/) || [])[1] || 301); if (f && s >= 300 && s < 400) addSrc(f); }

const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); const rel = path.relative(PUB, p).split(path.sep).join('/'); if (e.isDirectory()) { if (!SKIP_DIR.test(rel) && !e.name.startsWith('.')) walk(p); } else if (e.name.endsWith('.html')) files.push(rel); } })(PUB);
files.sort();

const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
const newState = {}; const pages = []; const excluded = {};
const skip = (why, rel) => { (excluded[why] = excluded[why] || []).push(rel); };
for (const rel of files) {
  if (NEVER.test(rel)) { skip('not a content page', rel); continue; }
  const h = fs.readFileSync(path.join(PUB, rel), 'utf8');
  const headEnd = h.search(/<\/head>/i); const head = headEnd > 0 ? h.slice(0, headEnd) : h.slice(0, 4000); const body = headEnd > 0 ? h.slice(headEnd) : h;
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const robots = (metas.find((t) => /\bname\s*=\s*["']robots["']/i.test(t)) || ''); const robotsVal = robots ? attr(robots, 'content').toLowerCase() : '';
  if (/noindex/.test(robotsVal)) { skip('noindex', rel); continue; }
  if (metas.some((t) => /http-equiv\s*=\s*["']refresh/i.test(t))) { skip('redirect page (meta refresh)', rel); continue; }
  // (/x/index.html → /x/ is the same page under its folder address, not a redirect away)
  if (redirectSources.has('/' + rel) && !/(^|\/)index\.html$/.test(rel)) { skip('redirect source', rel); continue; }
  const canonTag = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).find((t) => /rel\s*=\s*["']canonical["']/i.test(t));
  const canonical = canonTag ? attr(canonTag, 'href') : urlOf(rel);
  if (norm(canonical) !== norm(urlOf(rel))) { skip('canonical points to another page', rel); continue; }
  // visible text fingerprint (scripts, styles and tags removed)
  const text = body.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  const fp = crypto.createHash('sha1').update(text).digest('hex').slice(0, 16);
  const old = state[rel]; const lastmod = old && old.fp === fp ? old.lastmod : today;
  newState[rel] = { fp, lastmod };
  // content images (<img src / data-src> on this site, not icons or tracking pixels)
  const imgs = new Set();
  for (const m of body.matchAll(/<img\b[^>]*>/gi)) { const src = attr(m[0], 'data-src') || attr(m[0], 'src'); if (!src || /^data:/.test(src)) continue;
    let u; try { u = new URL(src, urlOf(rel)); } catch (e) { continue; } if (u.origin !== HOST) continue; const ip = decodeURIComponent(u.pathname);
    if (/^\/icons\//.test(ip) || /\.svg$/i.test(ip)) continue; if (fs.existsSync(path.join(PUB, ip))) imgs.add(HOST + encodeURI(ip)); }
  const section = rel.startsWith('p/') ? 'professions' : rel.startsWith('blog/') ? 'blog' : rel.startsWith('en/') ? 'en' : 'pages';
  pages.push({ rel, url: canonical, lastmod, section, imgs: [...imgs] });
}

// build the files
const out = {}; const indexEntries = [];
const urlset = (entries, extraNs = '') => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${extraNs}>\n${entries.join('\n')}\n</urlset>\n`;
const order = ['pages', 'professions', 'blog', 'en'];
for (const sec of order) {
  const list = pages.filter((p) => p.section === sec); if (!list.length) continue;
  for (let i = 0; i < list.length; i += MAX_PER_FILE) {
    const chunk = list.slice(i, i + MAX_PER_FILE); const name = `sitemap-${sec}${i ? '-' + (i / MAX_PER_FILE + 1) : ''}.xml`;
    out[name] = urlset(chunk.map((p) => `  <url>\n    <loc>${locOf(p.url)}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n  </url>`));
    indexEntries.push({ name, lastmod: chunk.reduce((a, p) => (p.lastmod > a ? p.lastmod : a), '0000') });
  }
}
const withImgs = pages.filter((p) => p.imgs.length);
if (withImgs.length) {
  out['sitemap-images.xml'] = urlset(withImgs.map((p) => `  <url>\n    <loc>${locOf(p.url)}</loc>\n${p.imgs.map((i) => `    <image:image><image:loc>${xmlEsc(i)}</image:loc></image:image>`).join('\n')}\n  </url>`), ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  indexEntries.push({ name: 'sitemap-images.xml', lastmod: withImgs.reduce((a, p) => (p.lastmod > a ? p.lastmod : a), '0000') });
}
out['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexEntries.map((e) => `  <sitemap>\n    <loc>${HOST}/${e.name}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n  </sitemap>`).join('\n')}\n</sitemapindex>\n`;

// sitemap files from an earlier run that are no longer produced (e.g. a section that became smaller)
const stale = fs.readdirSync(PUB).filter((f) => /^sitemap-[\w-]+\.xml$/.test(f) && !out[f]);

const counts = order.map((s) => `${s} ${pages.filter((p) => p.section === s).length}`).join(' · ');
console.log(`sitemap: ${pages.length} addresses (${counts}) · ${withImgs.reduce((a, p) => a + p.imgs.length, 0)} images on ${withImgs.length} pages · dated today: ${pages.filter((p) => p.lastmod === today).length}`);
for (const [why, l] of Object.entries(excluded)) console.log(`  left out — ${why}: ${l.length}${l.length <= 6 ? ' (' + l.join(', ') + ')' : ''}`);

if (CHECK) {
  const diff = Object.keys(out).filter((f) => !fs.existsSync(path.join(PUB, f)) || fs.readFileSync(path.join(PUB, f), 'utf8') !== out[f]).concat(stale);
  if (diff.length) { console.log('OUT OF DATE: ' + diff.join(', ') + '  → run: node scripts/sitemap.mjs'); process.exit(1); }
  console.log('sitemaps are up to date'); process.exit(0);
}
for (const [f, x] of Object.entries(out)) fs.writeFileSync(path.join(PUB, f), x);
for (const f of stale) fs.unlinkSync(path.join(PUB, f));
fs.writeFileSync(STATE, JSON.stringify(newState, null, 0).replace(/},"/g, '},\n"') + '\n');
console.log(`wrote: ${Object.keys(out).join(', ')}${stale.length ? ' · removed old: ' + stale.join(', ') : ''}`);
