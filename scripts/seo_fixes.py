# -*- coding: utf-8 -*-
import json, re, os, glob, urllib.parse, math, datetime

PUB = '/app/frontend/public'
os.chdir(PUB)
TODAY = '2026-06-16'
PER_PAGE = 50

profs = json.load(open('professions.json', encoding='utf-8'))
items = []
for p in profs:
    slug = p['slug']
    fn = f"p/{slug}.html"
    if os.path.exists(fn):
        items.append({'name': p['profession_name_ar'], 'code': p['code'], 'slug': slug})
items.sort(key=lambda x: int(x['code']) if x['code'].isdigit() else 999999)
TOTAL_PAGES = math.ceil(len(items) / PER_PAGE)
print(f"professions with pages: {len(items)}, dalil pages: {TOTAL_PAGES}")

def enc(slug):
    return '/p/' + urllib.parse.quote(slug) + '.html'

# ═══ 1. Generate paginated directory pages p/dalil-N.html ═══
def pagination_nav(cur):
    links = []
    if cur > 1:
        links.append(f'<a href="/p/dalil-{cur-1}.html" class="px-4 py-2 bg-white border border-gray-200 rounded-lg font-bold text-navy hover:border-gold transition">&rarr; الصفحة السابقة</a>')
    nums = []
    for i in range(1, TOTAL_PAGES + 1):
        if i == cur:
            nums.append(f'<span class="w-9 h-9 inline-flex items-center justify-center bg-gold text-white rounded-lg font-bold text-sm">{i}</span>')
        else:
            nums.append(f'<a href="/p/dalil-{i}.html" class="w-9 h-9 inline-flex items-center justify-center bg-white border border-gray-200 rounded-lg font-bold text-navy text-sm hover:border-gold transition">{i}</a>')
    if cur < TOTAL_PAGES:
        links.append(f'<a href="/p/dalil-{cur+1}.html" class="px-4 py-2 bg-white border border-gray-200 rounded-lg font-bold text-navy hover:border-gold transition">الصفحة التالية &larr;</a>')
    return ('<nav aria-label="ترقيم صفحات الدليل" class="mt-10">'
            '<div class="flex flex-wrap items-center justify-center gap-2">'
            + ''.join(nums) + '</div>'
            '<div class="flex items-center justify-center gap-3 mt-4">' + ''.join(links) + '</div></nav>')

for n in range(1, TOTAL_PAGES + 1):
    chunk = items[(n-1)*PER_PAGE : n*PER_PAGE]
    li = ''.join(
        f'<li><a href="{enc(it["slug"])}" class="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-gold transition"><span class="font-bold text-navy">{it["name"]}</span><span class="text-xs text-gold font-bold">{it["code"]}</span></a></li>'
        for it in chunk)
    prev_link = f'<link rel="prev" href="https://saudia-visa.com/p/dalil-{n-1}.html">' if n > 1 else ''
    next_link = f'<link rel="next" href="https://saudia-visa.com/p/dalil-{n+1}.html">' if n < TOTAL_PAGES else ''
    html = f'''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>دليل المهن المعتمدة للسعودية — الصفحة {n} من {TOTAL_PAGES}</title>
    <meta name="description" content="دليل روابط المهن المعتمدة من السفارة السعودية مع الأوراق المطلوبة لكل مهنة — الصفحة {n} من {TOTAL_PAGES}. مكتب تأشيرات السعودية المعتمد في الأردن.">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="stylesheet" href="/css/tailwind.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body {{ font-family: 'Alexandria', sans-serif; }}</style>
    <link rel="canonical" href="https://saudia-visa.com/p/dalil-{n}.html">
    {prev_link}
    {next_link}
    <meta name="robots" content="index, follow">
</head>
<body class="bg-gray-50">
    <header class="bg-white border-b sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" class="flex items-center gap-2">
                <img src="/icons/logo-192.png" alt="مكتب تأشيرات السعودية" class="h-10">
                <span class="font-bold text-navy hidden sm:block">مكتب تأشيرات السعودية</span>
            </a>
            <nav class="flex gap-4">
                <a href="/" class="font-bold text-navy hover:text-gold">الرئيسية</a>
                <a href="/professions.html" class="font-bold text-navy hover:text-gold">المهن</a>
            </nav>
        </div>
    </header>

    <section class="bg-navy text-white py-12">
        <div class="max-w-4xl mx-auto px-4">
            <h1 class="text-3xl md:text-4xl font-bold mb-3">دليل المهن المعتمدة — الصفحة {n} من {TOTAL_PAGES}</h1>
            <p class="text-gray-300">روابط المهن المعتمدة من السفارة السعودية مع الأوراق المطلوبة لكل مهنة. للبحث الذكي انتقل إلى <a href="/professions.html" class="text-gold underline">صفحة المهن والأوراق</a>.</p>
        </div>
    </section>

    <main class="max-w-4xl mx-auto px-4 py-12">
        <ul class="grid sm:grid-cols-2 gap-3">{li}</ul>
        {pagination_nav(n)}
    </main>

    <footer class="bg-white border-t py-8 text-center text-gray-500 text-sm">
        <p>© 2026 مكتب تأشيرات السعودية في الأردن. جميع الحقوق محفوظة.</p>
    </footer>
</body>
</html>
'''
    open(f'p/dalil-{n}.html', 'w', encoding='utf-8').write(html)
print("dalil pages written")

# ═══ 2. Inject hidden crawlable nav into professions.html ═══
ph = open('professions.html', encoding='utf-8').read()
if 'dalil-1.html' not in ph:
    links = ''.join(f'<a href="/p/dalil-{i}.html">دليل المهن المعتمدة — الصفحة {i}</a>\n' for i in range(1, TOTAL_PAGES + 1))
    block = ('\n<!-- 🕸️ روابط نصية لدليل المهن (للعناكب وبوتات AI — لا تغيّر التصميم المرئي) -->\n'
             '<nav aria-label="دليل صفحات المهن المعتمدة" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">\n'
             + links + '</nav>\n\n')
    ph = ph.replace('<!-- Footer -->', block + '<!-- Footer -->', 1)
    open('professions.html', 'w', encoding='utf-8').write(ph)
    print("professions.html nav injected")

# ═══ 3. Sitemap: remove noindex pages, add dalil pages ═══
sm = open('sitemap.xml', encoding='utf-8').read()
removed = 0
for page in ['privacy.html', 'terms.html', 'disclaimer.html']:
    new_sm = re.sub(r'\s*<url>(?:(?!</url>).)*?' + re.escape(page) + r'(?:(?!</url>).)*?</url>', '', sm, flags=re.S)
    if new_sm != sm:
        removed += 1
        sm = new_sm
entries = ''.join(
    f'  <url>\n    <loc>https://saudia-visa.com/p/dalil-{i}.html</loc>\n    <lastmod>{TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n'
    for i in range(1, TOTAL_PAGES + 1))
if 'dalil-1.html' not in sm:
    sm = sm.replace('</urlset>', entries + '</urlset>')
open('sitemap.xml', 'w', encoding='utf-8').write(sm)
print(f"sitemap: removed {removed} noindex pages, added {TOTAL_PAGES} dalil entries")

# ═══ 4. Title tags <= 60 chars ═══
P_RE = re.compile(r'<title>تأشيرة عمل (.+?) السعودية \| الأوراق المطلوبة 2026</title>')
fixed_p = 0
for fn in glob.glob('p/*.html'):
    html = open(fn, encoding='utf-8').read()
    m = P_RE.search(html)
    if not m:
        continue
    name = m.group(1)
    old = m.group(0)
    if len(old) - len('<title></title>') <= 60:
        continue
    for cand in [f'تأشيرة عمل {name} السعودية | الأوراق 2026',
                 f'تأشيرة عمل {name} السعودية 2026',
                 f'تأشيرة عمل {name} 2026',
                 f'{name} | تأشيرة السعودية']:
        if len(cand) <= 60:
            html = html.replace(old, f'<title>{cand}</title>', 1)
            open(fn, 'w', encoding='utf-8').write(html)
            fixed_p += 1
            break
print(f"p/ titles shortened: {fixed_p}")

# Non-p pages: trim ' | ' segments from end until <= 60
fixed_r = 0
for fn in glob.glob('*.html') + glob.glob('blog/*.html'):
    html = open(fn, encoding='utf-8').read()
    m = re.search(r'<title>(.*?)</title>', html, re.S)
    if not m:
        continue
    t = m.group(1).strip()
    if len(t) <= 60:
        continue
    parts = [s.strip() for s in t.split('|')]
    while len(parts) > 1 and len(' | '.join(parts)) > 60:
        parts.pop()
    new_t = ' | '.join(parts)
    if len(new_t) <= 60 and new_t != t:
        html = html.replace(m.group(0), f'<title>{new_t}</title>', 1)
        open(fn, 'w', encoding='utf-8').write(html)
        fixed_r += 1
        print(f"  {fn}: '{new_t}' ({len(new_t)})")
    else:
        print(f"  !! could not shorten {fn}: {len(new_t)} chars")
print(f"root titles shortened: {fixed_r}")

# ═══ 5. Verify: multi-H1 + remaining long titles ═══
long_left = 0
multi_h1 = []
for fn in glob.glob('*.html') + glob.glob('p/*.html') + glob.glob('blog/*.html'):
    html = open(fn, encoding='utf-8').read()
    m = re.search(r'<title>(.*?)</title>', html, re.S)
    if m and len(m.group(1).strip()) > 60:
        long_left += 1
        print("  STILL LONG:", fn, len(m.group(1).strip()))
    if len(re.findall(r'<h1[\s>]', html, re.I)) > 1:
        multi_h1.append(fn)
print(f"remaining long titles: {long_left}, multi-H1 pages: {multi_h1}")
