// Pre-deploy SEO check — runs on every Netlify build after scripts/sitemap.mjs, and can be run by hand.
// No packages needed (Node 18+). Reads frontend/public as Google first receives it (before JavaScript).
//
// STOPS the build (exit 1) only for mistakes that would hurt indexing of a page that is meant to be found:
//   • an indexable page without <title>, meta description or canonical; canonical not https://saudia-visa.com/…;
//     canonical pointing to a page that does not exist;
//   • a link inside the site to a page that does not exist (and is not redirected);
//   • broken JSON-LD (structured data that is not valid JSON); a rating / review in structured data;
//   • an hreflang pointing to a page that does not exist;
//   • the sitemap listing an address that has no page, or a noindex page.
// Only WARNS (build continues): long titles / descriptions, duplicate titles, images without alt, links that pass
// through a redirect, pages that no other page links to (orphans).
// To deploy anyway in an emergency, set the Netlify environment variable SEO_CHECK=warn (errors are then printed only).
//     node scripts/seo-check.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const PUB = path.join(REPO, 'frontend', 'public');
const HOST = 'https://saudia-visa.com';
const SKIP_DIR = /^(admin|admin-secure|content|data|vendor|fonts|images|icons|css|js|\.well-known|\.netlify)(\/|$)/;
const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); const rel = path.relative(PUB, p).split(path.sep).join('/'); if (e.isDirectory()) { if (!SKIP_DIR.test(rel) && !e.name.startsWith('.')) walk(p); } else if (e.name.endsWith('.html')) files.push(rel); } })(PUB);
const decode = (s) => { try { return decodeURIComponent(s); } catch (e) { return s; } };
const exists = (u) => { let p; try { p = decode(new URL(u, HOST).pathname); } catch (e) { return false; } if (p.endsWith('/')) p += 'index.html'; const f = path.join(PUB, p); return (fs.existsSync(f) && fs.statSync(f).isFile()) || fs.existsSync(f + '.html'); };
const urlOf = (rel) => (rel === 'index.html' ? HOST + '/' : `${HOST}/${rel}`);
const norm = (u) => { try { const x = new URL(u, HOST); let p = decode(x.pathname); if (p === '/index.html') p = '/'; return x.origin + p; } catch (e) { return u; } };
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i')); return m ? m[1] : ''; };
const redirects = new Set();
for (const l of fs.readFileSync(path.join(PUB, '_redirects'), 'utf8').split(/\r?\n/)) { const m = l.trim().match(/^(\/[^\s*:]*)\s+(\S+)\s+(\d{3})/); if (m) redirects.add(decode(m[1])); }
if (fs.existsSync(path.join(REPO, 'netlify.toml'))) for (const b of fs.readFileSync(path.join(REPO, 'netlify.toml'), 'utf8').split('[[redirects]]').slice(1)) { const f = (b.match(/from\s*=\s*"(\/[^"*:]*)"/) || [])[1]; if (f) redirects.add(f.split('?')[0]); }
const errors = [], warns = []; const err = (k, v) => errors.push(`${k}: ${v}`); const warn = (k, v) => warns.push(`${k}: ${v}`);
const noindexSet = new Set(); const titles = new Map(); const linked = new Set(); const indexable = [];
for (const rel of files) {
  const h = fs.readFileSync(path.join(PUB, rel), 'utf8'); const e = h.search(/<\/head>/i); const head = e > 0 ? h.slice(0, e) : h.slice(0, 4000); const body = e > 0 ? h.slice(e) : h;
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]); const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const meta = (k, v) => { const t = metas.find((x) => new RegExp(`\\b${k}\\s*=\\s*["']${v}["']`, 'i').test(x)); return t ? attr(t, 'content') : null; };
  const noindex = /noindex/i.test(meta('name', 'robots') || '') || metas.some((x) => /http-equiv=["']refresh/i.test(x)) || /^(404|offline)\.html$|^google[\w-]*\.html$/.test(rel);
  for (const m of h.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) { try { const d = JSON.parse(m[1]); if (/"(aggregateRating|ratingValue|reviewCount)"/.test(JSON.stringify(d))) err('rating / review in structured data (only allowed if real and shown on the page)', rel); } catch (x) { err('broken JSON-LD', `${rel} (${x.message.slice(0, 60)})`); } }
  if (noindex) { noindexSet.add(norm(urlOf(rel))); continue; }
  indexable.push(rel);
  const title = ((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').replace(/\s+/g, ' ').trim(); const desc = meta('name', 'description') || '';
  const canonTag = links.find((x) => /rel=["']canonical["']/i.test(x)); const canonical = canonTag ? attr(canonTag, 'href') : '';
  if (!title) err('page without <title>', rel); else { if ([...title].length > 70) warn('title longer than 70 characters', rel); titles.set(title, (titles.get(title) || []).concat(rel)); }
  if (!desc) err('page without meta description', rel); else if ([...desc].length > 170 || [...desc].length < 50) warn('description shorter than 50 or longer than 170', rel);
  if (!canonical) err('page without canonical', rel); else if (!canonical.startsWith(HOST + '/')) err('canonical not https://saudia-visa.com/…', `${rel}: ${canonical}`); else if (!exists(canonical)) err('canonical points to a missing page', `${rel}: ${canonical}`);
  for (const l of links.filter((x) => /rel=["']alternate["']/i.test(x) && /hreflang=/i.test(x))) if (!exists(attr(l, 'href'))) err('hreflang points to a missing page', `${rel} → ${attr(l, 'href')}`);
  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].filter((m) => !/\balt\s*=/i.test(m[0])).length; if (imgs) warn('images without alt', `${rel} (${imgs})`);
  for (const m of body.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"'#][^"']*)["']/gi)) {
    const u = m[1].trim(); if (/^(mailto|tel|javascript|whatsapp|sms):/i.test(u) || /\$\{|\{\{/.test(u)) continue;
    let abs; try { abs = new URL(u, urlOf(rel)); } catch (x) { continue; } if (!/^https?:\/\/(www\.)?saudia-visa\.com$/.test(abs.origin)) continue;
    const p = decode(abs.pathname); if (exists(p)) { let t = p === '/' ? 'index.html' : p.replace(/^\//, ''); if (t.endsWith('/')) t += 'index.html'; if (!t.endsWith('.html') && fs.existsSync(path.join(PUB, t + '.html'))) t += '.html'; if (t !== rel) linked.add(t); continue; } if (redirects.has(p)) { warn('link passes through a redirect', `${rel} → ${p}`); continue; }
    err('link to a missing page', `${rel} → ${p}`);
  }
}
for (const rel of indexable) if (rel !== 'index.html' && !linked.has(rel)) warn('page no other page links to (orphan: hard for Google to find)', rel);
for (const [t, l] of titles) if (l.length > 1) warn('same title on several pages', `${t.slice(0, 60)} (${l.length})`);
// sitemap(s)
const sm = fs.readFileSync(path.join(PUB, 'sitemap.xml'), 'utf8');
const smFiles = /<sitemapindex/.test(sm) ? [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]) : [];
for (const f of smFiles) if (!fs.existsSync(path.join(PUB, decode(new URL(f).pathname)))) err('sitemap index lists a missing file', f);
const smText = smFiles.length ? smFiles.filter((f) => fs.existsSync(path.join(PUB, decode(new URL(f).pathname)))).map((f) => fs.readFileSync(path.join(PUB, decode(new URL(f).pathname)), 'utf8')).join('\n') : sm;
for (const m of smText.matchAll(/<loc>([^<]+)<\/loc>/g)) { const u = m[1].replace(/&amp;/g, '&'); if (!exists(u)) err('sitemap address with no page', u); else if (noindexSet.has(norm(u))) err('noindex page in the sitemap', u); }
// report
const group = (list) => { const g = new Map(); for (const x of list) { const k = x.split(': ')[0]; g.set(k, (g.get(k) || []).concat(x.slice(k.length + 2))); } return g; };
console.log(`seo-check: ${files.length} pages · ${errors.length} error(s) · ${warns.length} warning(s)`);
for (const [k, v] of group(errors)) { console.log(`  ✗ ${k}: ${v.length}`); v.slice(0, 15).forEach((x) => console.log('      ' + x)); }
for (const [k, v] of group(warns)) console.log(`  ! ${k}: ${v.length}`);
if (errors.length && process.env.SEO_CHECK !== 'warn') { console.log('Build stopped by the SEO check (see ✗ above). Fix them, or set SEO_CHECK=warn to deploy anyway.'); process.exit(1); }
