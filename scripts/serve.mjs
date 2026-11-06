// Local preview of the site — no packages needed (Node 18+).
//     node scripts/serve.mjs [port=8080]      → http://localhost:8080
// Serves frontend/public like Netlify does for plain files: "/" → index.html, "/x" → x.html when it exists,
// the site's 404 page for anything missing, and the simple one-to-one 301 / 302 rules of _redirects.
// (For the exact Netlify behaviour — every redirect rule, headers — use the official tool: npx netlify-cli serve)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const PUB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'frontend', 'public');
const PORT = +(process.argv[2] || process.env.PORT || 8080);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.pdf': 'application/pdf' };
const dec = (s) => { try { return decodeURIComponent(s); } catch (e) { return s; } };
const redirects = new Map();
for (const l of fs.readFileSync(path.join(PUB, '_redirects'), 'utf8').split(/\r?\n/)) { const m = l.trim().match(/^(\/[^\s*:]*)\s+(\/\S*|https?:\/\/\S+)\s+(30[12])!?$/); if (m && !redirects.has(dec(m[1]))) redirects.set(dec(m[1]), { to: m[2], status: +m[3] }); }
const file = (p) => { const f = path.join(PUB, p); if (!f.startsWith(PUB)) return null; try { if (fs.statSync(f).isFile()) return f; } catch (e) {} return null; };
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); const p = dec(u.pathname);
  if (/(^|\/)\./.test(p) && !p.startsWith('/.well-known/')) { res.writeHead(404); return res.end('Not found'); }
  const r = redirects.get(p); if (r && !file(p)) { res.writeHead(r.status, { Location: encodeURI(dec(r.to)) }); return res.end(); }
  const f = file(p.endsWith('/') ? p + 'index.html' : p) || file(p + '.html');
  if (!f) { res.writeHead(404, { 'Content-Type': TYPES['.html'] }); return res.end(fs.existsSync(path.join(PUB, '404.html')) ? fs.readFileSync(path.join(PUB, '404.html')) : 'Not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log(`site: http://localhost:${PORT}  (folder: ${PUB})`));
