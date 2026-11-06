// AI-readable files generator — runs on every Netlify build before the sitemap (netlify.toml → [build] command).
// No packages needed (Node 18+).
//
// Writes, in frontend/public:
//   llms.txt              short guide to the office and its main pages (llmstxt.org format)
//   llms-full.txt         the same + services, authorization steps, document rules, all FAQ answers, profession index
//   llms-professions.txt  every profession page: code, title, and its document list exactly as the page shows it
//   ai.txt                short pointer for AI crawlers
//
// Sources — nothing is typed twice:
//   scripts/ai-facts.json   the office facts, each one copied from a visible page (edit this file, then re-run)
//   the pages themselves    titles, descriptions, FAQ (from each page's FAQ structured data, which the tests keep equal to
//                           the visible text), profession codes and document lists (from the visible HTML)
//
// Safety: the build stops if a listed page is missing, redirected or noindex-without-reason, or if any output contains a
// licence number or a rating. "Last updated" changes only when the content of a file changes (scripts/ai-files-state.json).
//     node scripts/ai-files.mjs           write the files
//     node scripts/ai-files.mjs --check   write nothing; exit 1 if the files in the folder are out of date
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(REPO, 'frontend', 'public');
const STATE = path.join(REPO, 'scripts', 'ai-files-state.json');
const F = JSON.parse(fs.readFileSync(path.join(REPO, 'scripts', 'ai-facts.json'), 'utf8'));
const HOST = F.site.replace(/\/$/, '');
const CHECK = process.argv.includes('--check');
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Amman', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const problems = [];

const dec = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n));
const text = (h) => dec(String(h).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
// a page's address as its canonical says: the home page is «/»; a folder page whose canonical is the folder («/x/») is
// listed as «/x/»; any other x/index.html (e.g. /en/index.html, canonical as written) keeps its file address
const canonOf = (rel) => { try { const h = fs.readFileSync(path.join(PUB, rel.replace(/^\//, '')), 'utf8'); return (h.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/) || [])[1] || ''; } catch (e) { return ''; } };
const abs = (rel) => { if (rel === '/index.html') return HOST + '/'; if (/\/index\.html$/.test(rel) && canonOf(rel).endsWith(encodeURI(rel.replace(/index\.html$/, '')))) return HOST + encodeURI(rel.replace(/index\.html$/, '')); return HOST + encodeURI(rel); };
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i')); return m ? dec(m[1]) : ''; };

// ── redirect sources (a page that sends visitors elsewhere must not be listed) ──
const redirected = new Set();
for (const l of fs.readFileSync(path.join(PUB, '_redirects'), 'utf8').split(/\r?\n/)) { const m = l.trim().match(/^(\/[^\s*:]*)\s+(\S+)\s+(30[1278])!?\s*$/); if (m) redirected.add(m[1]); }
for (const b of fs.readFileSync(path.join(REPO, 'netlify.toml'), 'utf8').split('[[redirects]]').slice(1)) { const f = (b.match(/from\s*=\s*"(\/[^"*:]*)"/) || [])[1], s = +((b.match(/status\s*=\s*(\d+)/) || [])[1] || 301); if (f && s >= 300 && s < 400 && !/query/.test(b)) redirected.add(f); }
redirected.delete('/index.html'); // /index.html → / is the same page (listed as https://saudia-visa.com/)

// ── page metadata ──
const meta = new Map();
const pageInfo = (rel) => {
  if (meta.has(rel)) return meta.get(rel);
  const file = path.join(PUB, rel.replace(/^\//, '').replace(/(^|\/)$/, '$1index.html'));
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return null;
  const h = fs.readFileSync(file, 'utf8'); const head = h.slice(0, Math.max(0, h.search(/<\/head>/i)) || 6000);
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const robots = attr(metas.find((t) => /name\s*=\s*["']robots["']/i.test(t)) || '', 'content').toLowerCase();
  const desc = attr(metas.find((t) => /name\s*=\s*["']description["']/i.test(t)) || '', 'content');
  const title = text((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
  const info = { rel, h, title, desc, noindex: /noindex/.test(robots) };
  meta.set(rel, info); return info;
};
const listed = (rel, why) => {
  const i = pageInfo(rel);
  if (!i) { problems.push(`${why}: page not found ${rel}`); return null; }
  if (redirected.has(rel)) { problems.push(`${why}: ${rel} is a redirect source`); return null; }
  return i;
};
// the .html files of a folder, plus its sub-folder pages (dir/x/index.html)
const htmlIn = (dir) => fs.readdirSync(path.join(PUB, dir), { withFileTypes: true }).flatMap((e) => (e.isFile() && e.name.endsWith('.html') ? [`/${dir}/${e.name}`] : e.isDirectory() && fs.existsSync(path.join(PUB, dir, e.name, 'index.html')) ? [`/${dir}/${e.name}/index.html`] : [])).sort();

// ── FAQ from the pages' FAQ structured data (kept equal to the visible text by tests/schema-visible-check.js) ──
const norm = (s) => s.replace(/[ً-ٰٟ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[؟?!.،,:«»"']/g, '').replace(/\s+/g, ' ').trim();
const excluded = new Set(F.faq_exclude.map((x) => norm(x.q)));
const faqOf = (i) => {
  const out = [];
  const visit = (o) => { if (Array.isArray(o)) return o.forEach(visit); if (!o || typeof o !== 'object') return;
    if ([].concat(o['@type'] || []).includes('Question') && o.name && o.acceptedAnswer) { const a = [].concat(o.acceptedAnswer)[0]; out.push({ q: text(o.name), a: text(a.text || '') }); }
    for (const v of Object.values(o)) if (v && typeof v === 'object') visit(v); };
  // visible questions first (<details><summary>question</summary>answer</details>), then the structured data
  const body = i.h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  for (const m of body.matchAll(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi)) out.push({ q: text(m[1]), a: text(m[2]) });
  for (const m of i.h.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) { try { visit(JSON.parse(m[1])); } catch (e) { problems.push(`broken structured data in ${i.rel}`); } }
  return out;
};

// ── professions, from the visible profession pages ──
const profJson = JSON.parse(fs.readFileSync(path.join(PUB, 'professions.json'), 'utf8'));
const byCode = new Map(); for (const p of profJson) if (!byCode.has(String(p.code))) byCode.set(String(p.code), p);
const bySlug = new Map(profJson.filter((p) => p.slug).map((p) => [p.slug, p]));
const professions = [];
for (const rel of htmlIn('p')) {
  if (/\/dalil-\d+\.html$/.test(rel)) continue;
  const i = pageInfo(rel); if (i.noindex || redirected.has(rel)) continue;
  const h = i.h; const slug = decodeURIComponent(path.basename(rel, '.html'));
  const codeTxt = text((h.match(/رمز المهنة:\s*([^<]*)</) || [])[1] || '');
  const fileCode = (slug.match(/-(\d{6})$/) || [])[1] || '';
  const rec = bySlug.get(slug) || byCode.get(fileCode) || {};
  const code = /^\d{6}$/.test(codeTxt) ? codeTxt : '';
  const nameAr = rec.name_ar || text((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '').replace(/^تأشيرة عمل\s+/, '').replace(/\s+السعودية$/, '');
  const nameEn = text((h.match(/class="sd-h1-en"[^>]*>([\s\S]*?)<\/p>/i) || [])[1] || '');
  const at = h.search(/الأوراق المطلوبة/); const ul = at > 0 ? (h.slice(at).match(/<ul\b[\s\S]*?<\/ul>/i) || [''])[0] : '';
  const docs = [...ul.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => { const s = m[1].match(/<span class="flex-1[^"]*">([\s\S]*?)<\/span>\s*$/i); return text(s ? s[1] : m[1].replace(/^\s*<span[^>]*>\s*\d+\s*<\/span>/, '')); }).filter(Boolean);
  const note = text((h.match(/<!-- sv-note-box -->([\s\S]*?)<!-- \/sv-note-box -->/) || [])[1] || '');
  if (!docs.length) problems.push(`profession page without a document list: ${rel}`);
  professions.push({ rel, url: abs(rel), code, codeLabel: code || 'بدون رمز رسمي مؤكد', nameAr, nameEn, category: rec.category || '', docs, note });
}
professions.sort((a, b) => (a.code || '999999').localeCompare(b.code || '999999') || a.nameAr.localeCompare(b.nameAr, 'ar'));
const dalil = htmlIn('p').filter((r) => /\/dalil-\d+\.html$/.test(r)).sort((a, b) => +a.match(/(\d+)\.html$/)[1] - +b.match(/(\d+)\.html$/)[1]);
const cats = {}; for (const p of professions) if (p.category) cats[p.category] = (cats[p.category] || 0) + 1;

// ── the lists that the files share ──
const svc = F.services.map((s) => ({ ...s, info: listed(s.url, 'services') })).filter((s) => s.info);
const tools = F.tools.map((s) => ({ ...s, info: listed(s.url, 'tools') })).filter((s) => s.info);
const blog = htmlIn('blog').map((r) => pageInfo(r)).filter((i) => !i.noindex && !redirected.has(i.rel));
const en = htmlIn('en').map((r) => pageInfo(r)).filter((i) => !i.noindex && !redirected.has(i.rel));
const core = ['/index.html', '/about.html', '/faq.html', '/blog.html'].map((r) => listed(r, 'core pages')).filter(Boolean);
const nidx = (i) => (i.noindex ? ' (page kept out of search results by the owner\'s choice; its content is valid / الصفحة غير مفهرسة في محركات البحث بقرار المالك، ومحتواها صحيح)' : '');
const line = (s) => `- [${s.ar} — ${s.en}](${abs(s.url)}): ${s.desc_ar} / ${s.desc_en}${nidx(s.info)}`;
const C = F.contact;

const header = (title) => [
  `# ${F.name_ar} — ${F.name_en}`, '',
  `> ${F.summary_ar}`, '>', `> ${F.summary_en}`, '',
  title, '',
];
const identity = [
  '## Office information / معلومات المكتب',
  `- Name / الاسم: ${F.name_ar} — ${F.name_en}`,
  `- Other names on the website / أسماء أخرى في الموقع: ${F.other_names.map((n) => n.name).join(' · ')}`,
  `- Website / الموقع: ${HOST} (the official domain / النطاق الرسمي)`,
  `- Address / العنوان: ${C.address_ar} — ${C.address_en}`,
  `- Hours / الدوام: ${C.hours_ar} — ${C.hours_en}`,
  `- Phone and WhatsApp / الهاتف وواتساب: ${C.phone} (${C.phone_local})`,
  `- WhatsApp: ${C.whatsapp} · WhatsApp Business: ${C.whatsapp_business}`,
  `- E-mail / البريد: ${C.email_main} (${C.email_main_note_ar}) · ${C.email_other}`,
  `- Facebook: ${C.facebook}`,
  `- Contact section / التواصل: ${C.contact_page}`,
  `- Languages / اللغات: ${C.languages}`,
  `- Founded / التأسيس: ${F.founded.ar} — ${F.founded.en}`,
  `- Privacy / الخصوصية: ${C.privacy_ar} — ${C.privacy_en}`,
  '',
  '## What the office is — and what the authorities decide / دور المكتب ودور الجهات الرسمية',
  ...F.status.map((s) => `- ${s.ar} — ${s.en}`),
  ...F.role_vs_authorities.map((s) => `- ${s.ar} — ${s.en}`),
  '',
];
const sections = [
  '## Services / الخدمات', ...svc.map(line), '',
  '## Free tools / الأدوات', ...tools.map(line), '',
  '## Professions and their documents / المهن وأوراقها',
  `- ${professions.length} profession pages, each with the official occupation code (when confirmed) and the full document list with stamps. / ${professions.length} صفحة مهنة، لكل منها رمز المهنة الرسمي (إن كان مؤكدًا) وقائمة الأوراق كاملة بأختامها.`,
  `- Directory in plain HTML links / الدليل بروابط HTML: ${dalil.map((r) => abs(r)).slice(0, 1)} … ${abs(dalil[dalil.length - 1] || '/p/dalil-1.html')} (${dalil.length} pages)`,
  `- Search by name or code / البحث بالاسم أو الرمز: ${abs('/professions.html')}`,
  `- All professions with their documents in one text file / كل المهن وأوراقها في ملف واحد: ${HOST}/llms-professions.txt`,
  '',
  '## Guides and articles / المقالات والأدلة', ...blog.map((i) => `- [${i.title}](${abs(i.rel)}): ${i.desc}`), `- [المدونة](${abs('/blog.html')})`, '',
  '## English pages', ...en.map((i) => `- [${i.title}](${abs(i.rel)}): ${i.desc}`), '',
  '## Main pages / الصفحات الأساسية', ...core.map((i) => `- [${i.title}](${abs(i.rel)}): ${i.desc}`), '',
];
const citing = ['## Using this information / استخدام هذه المعلومات',
  '- Facts here are taken from the visible pages of the website. Official requirements, fees and procedures can change; the office confirms each case before it starts. / المعلومات هنا منقولة من صفحات الموقع الظاهرة؛ المتطلبات والرسوم والإجراءات الرسمية قد تتغير، ويؤكد المكتب كل حالة قبل البدء.',
  `- Please cite as / عند الاقتباس: ${F.citation.ar} — ${F.citation.en}`, ''];

// ── llms.txt ──
const llms = [...header('This file follows the llms.txt format. The extended version is ' + HOST + '/llms-full.txt'),
  ...identity, ...sections,
  '## Optional', `- [Full version: services, steps, rules, FAQ and profession index](${HOST}/llms-full.txt)`, `- [All professions with their documents](${HOST}/llms-professions.txt)`, `- [Sitemap](${HOST}/sitemap.xml)`, '',
  ...citing];

// ── llms-full.txt ──
const faqBlocks = []; const seen = new Set(); let faqCount = 0;
const faqPages = ['/index.html', '/faq.html', ...svc.map((s) => s.url), ...tools.map((s) => s.url), '/about.html', ...blog.map((i) => i.rel), ...en.map((i) => i.rel)];
for (const rel of [...new Set(faqPages)]) {
  if (F.faq_pages_skip.includes(rel.replace(/^\//, ''))) continue;
  const i = pageInfo(rel); if (!i) continue;
  const qa = faqOf(i).filter((x) => { const k = norm(x.q); if (!x.a || excluded.has(k) || seen.has(k)) return false; seen.add(k); return true; });
  if (!qa.length) continue; faqCount += qa.length;
  faqBlocks.push(`### ${i.title} — ${abs(rel)}`, ...qa.map((x) => `- **${x.q}** ${x.a}`), '');
}
const full = [...header('Extended version of ' + HOST + '/llms.txt'),
  ...identity,
  '## Who the office serves / لمن الخدمات', ...F.audiences.map((a) => `- ${a.ar} — ${a.en}`), '',
  ...sections,
  `## Work-visa authorization, step by step / خطوات تفويض تأشيرة العمل (${abs(F.authorization_steps.source)})`,
  ...F.authorization_steps.steps.map((s, n) => `${n + 1}. ${s.ar} — ${s.en}`), `- ${F.authorization_steps.note_ar}`, '',
  '## How the documents are decided / كيف تتحدد الأوراق', ...F.document_rules.map((s) => `- ${s.ar} — ${s.en}`), '',
  `## Frequently asked questions / الأسئلة الشائعة (${faqCount}, as shown on each page)`, '', ...faqBlocks,
  `## Profession index / فهرس المهن (${professions.length})`,
  `- By category / حسب الفئة: ${Object.entries(cats).map(([k, n]) => `${k} ${n}`).join(' · ')}`,
  '- Format: code — Arabic title / English title — category — page. The documents of each profession are in ' + HOST + '/llms-professions.txt and on its page.',
  ...professions.map((p) => `- ${p.codeLabel} — ${p.nameAr}${p.nameEn ? ' / ' + p.nameEn : ''}${p.category ? ' — ' + p.category : ''} — ${p.url}`), '',
  ...citing];

// ── llms-professions.txt ──
const profs = [`# ${F.name_ar} — documents by profession / الأوراق حسب المهنة`, '',
  `> ${professions.length} professions. Each list is copied from the profession's page and is the list for a Jordanian male applicant; women, other nationalities and residents of other countries get an adjusted list on ${abs('/professions.html')} and ${abs('/saudi-visa-documents-tracker.html')}. The office confirms the documents of each case before it starts; the visa decision belongs to the official authorities.`,
  `> ${professions.length} مهنة. كل قائمة منقولة من صفحة المهنة، وهي قائمة المتقدم الأردني الذكر؛ وتتغير بعض البنود للنساء ولغير الأردنيين وللمقيمين خارج الأردن (انظر صفحة المهن ومسار أوراقي). يؤكد المكتب أوراق كل حالة قبل البدء، والقرار في التأشيرة للجهات الرسمية.`, '',
  `Contact / التواصل: ${C.phone} · ${C.whatsapp} · ${C.email_main}`, '',
  ...professions.flatMap((p) => [`## ${p.nameAr}${p.nameEn ? ' — ' + p.nameEn : ''} (${p.codeLabel})`, `${p.category ? 'الفئة: ' + p.category + ' · ' : ''}${p.url}`, ...p.docs.map((d, n) => `${n + 1}. ${d}`), ...(p.note ? [p.note] : []), '']),
  ...citing];

// ── ai.txt ──
const ai = ['# ai.txt — saudia-visa.com', '# Crawling rules are in robots.txt: all public pages may be crawled by search and AI crawlers.', '',
  'User-agent: *', 'Allow: /', '',
  `# ${F.name_ar} — ${F.name_en}`, `# ${C.address_en} · ${C.phone} · ${C.email_main}`,
  `# Summary for AI systems: ${HOST}/llms.txt`, `# Extended: ${HOST}/llms-full.txt`, `# Professions and documents: ${HOST}/llms-professions.txt`, `Sitemap: ${HOST}/sitemap.xml`, ''];

// ── safety checks on every output ──
const outputs = { 'llms.txt': llms, 'llms-full.txt': full, 'llms-professions.txt': profs, 'ai.txt': ai };
const FORBIDDEN = [[/رقم\s*(ال)?ترخيص|ترخيص\s*رقم|licen[cs]e\s*(no|number|#)/i, 'licence number'], [/\b\d(\.\d+)?\s*\/\s*5(\.0)?\b|ratingValue|aggregateRating|\d[\d,+]*\s*(تقييم|reviews?\b)/i, 'rating'], [/(الوحيد|الأول في الأردن|only (certified|official|authori[sz]ed))/i, 'unverifiable superlative']];
for (const [f, lines] of Object.entries(outputs)) { const t = lines.join('\n'); for (const [re, what] of FORBIDDEN) { const m = t.match(re); if (m) problems.push(`${f} contains a ${what}: «${m[0]}»`); } }
for (const [f, lines] of Object.entries(outputs)) for (const m of lines.join('\n').matchAll(/https:\/\/saudia-visa\.com(\/[^\s)#]*)?/g)) {
  let p = (m[1] || '/').replace(/[.,;:]+$/, ''); try { p = decodeURIComponent(p); } catch (e) {} if (p === '/') p = '/index.html';
  if (/^\/(llms(-full|-professions)?\.txt|sitemap\.xml)$/.test(p)) continue;
  if (p.endsWith('/')) p += 'index.html';
  if (!fs.existsSync(path.join(PUB, p))) problems.push(`${f}: link to a missing file ${p}`); else if (redirected.has(p)) problems.push(`${f}: link to a redirected address ${p}`);
}
if (problems.length) { console.error('ai-files: STOPPED\n  ' + [...new Set(problems)].join('\n  ')); process.exit(1); }

// ── dates and writing ──
const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
const newState = {}; const final = {};
for (const [f, lines] of Object.entries(outputs)) {
  const body = lines.join('\n'); const fp = crypto.createHash('sha1').update(body).digest('hex').slice(0, 16);
  const date = state[f] && state[f].fp === fp ? state[f].date : today; newState[f] = { fp, date };
  final[f] = f === 'ai.txt' ? body.replace(/\n$/, '') + `\n# Last updated: ${date}\n` : body.replace(/\n+$/, '') + `\n\nLast updated / آخر تحديث: ${date}\n`;
}
const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0) + ' KB';
console.log(`ai-files: ${svc.length} services · ${tools.length} tools · ${blog.length} articles · ${en.length} English pages · ${faqCount} FAQ · ${professions.length} professions · ` + Object.entries(final).map(([f, s]) => `${f} ${kb(s)}`).join(' · '));
if (CHECK) {
  const diff = Object.keys(final).filter((f) => !fs.existsSync(path.join(PUB, f)) || fs.readFileSync(path.join(PUB, f), 'utf8') !== final[f]);
  if (diff.length) { console.log('OUT OF DATE: ' + diff.join(', ') + '  → run: node scripts/ai-files.mjs'); process.exit(1); }
  console.log('AI files are up to date'); process.exit(0);
}
for (const [f, s] of Object.entries(final)) fs.writeFileSync(path.join(PUB, f), s);
fs.writeFileSync(STATE, JSON.stringify(newState, null, 1) + '\n');
