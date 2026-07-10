# -*- coding: utf-8 -*-
"""مزامنة قوائم الأوراق في صفحات /p الثابتة مع قاعدة البيانات professions.json"""
import json, re, os, glob, html

PUB = '/app/frontend/public'
os.chdir(PUB)

db = json.load(open('professions.json', encoding='utf-8'))
by_code = {p['code']: p for p in db}

LI = ('<li class="bg-white border border-gray-100 p-4 rounded-xl flex gap-3 hover:border-gold transition">'
      '<span class="flex-shrink-0 w-8 h-8 bg-gold/15 text-gold rounded-full font-bold flex items-center justify-center">{n}</span>'
      '<span class="flex-1 text-gray-800">{txt}</span></li>')

ATTEST = 'يجب تصديق جميع الأوراق الرسمية والشهادات المطلوبة أعلاه من وزارة الخارجية الأردنية قبل تقديمها.'

UL_RE = re.compile(r'<ul class="space-y-4 mb-12">.*?</ul>(?:\s*<!-- sv-note-box -->.*?<!-- /sv-note-box -->)?', re.S)

synced, missing, skipped = 0, 0, 0
for fn in glob.glob('p/*.html'):
    base = os.path.basename(fn)[:-5]
    if base.startswith('dalil-'):
        continue
    cm = re.search(r'(\d+)$', base)
    if not cm or cm.group(1) not in by_code:
        missing += 1
        continue
    p = by_code[cm.group(1)]
    reqs = list(p['requirements'])

    # فصل أي بند يبدأ بـ"ملاحظة" عن القائمة المرقمة
    note_items = [r for r in reqs if re.match(r'^\s*ملاحظة', r)]
    reqs = [r for r in reqs if not re.match(r'^\s*ملاحظة', r)]

    lis = ''.join(LI.format(n=i, txt=html.escape(r, quote=False)) for i, r in enumerate(reqs, 1))

    notes_html = ''
    if p.get('note'):
        notes_html += f'<p class="text-sm text-blue-900 mb-2"><i class="fas fa-info-circle ml-2"></i><strong>ملاحظة:</strong> {html.escape(p["note"], quote=False)}</p>'
    for n in note_items:
        cleaned = re.sub(r'^\s*ملاحظة(\s+هامة\s+جداً)?\s*[:：]?\s*', '', n).strip()
        notes_html += f'<p class="text-sm text-blue-900 mb-2"><i class="fas fa-info-circle ml-2"></i><strong>ملاحظة:</strong> {html.escape(cleaned, quote=False)}</p>'
    notes_html += f'<p class="text-sm text-blue-900"><i class="fas fa-info-circle ml-2"></i><strong>ملاحظة هامة (التصديقات الخارجية):</strong> {ATTEST}</p>'

    new_block = (f'<ul class="space-y-4 mb-12">{lis}</ul>\n'
                 f'        <!-- sv-note-box -->\n'
                 f'        <div class="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg mb-12">{notes_html}</div>\n'
                 f'        <!-- /sv-note-box -->')

    h = open(fn, encoding='utf-8').read()
    new_h, cnt = UL_RE.subn(new_block, h, count=1)
    if cnt == 1:
        open(fn, 'w', encoding='utf-8').write(new_h)
        synced += 1
    else:
        skipped += 1
        print('  NO UL MATCH:', fn)

print(f"synced: {synced}, code not in DB: {missing}, no-ul skipped: {skipped}")

# تحقق عيّنة: مندوب مبيعات يجب أن تحتوي 9 بنود مع خبرة سنة واحدة
h = open('p/مندوب-مبيعات-332201.html', encoding='utf-8').read()
items = re.findall(r'<span class="flex-1 text-gray-800">(.*?)</span>', h)
print('مندوب مبيعات items:', len(items))
assert any('سنة واحدة' in i for i in items), 'خبرة سنة واحدة missing!'
assert 'sv-note-box' in h
h2 = open('p/عامل-مخزن-933103.html', encoding='utf-8').read()
i2 = re.findall(r'<span class="flex-1 text-gray-800">(.*?)</span>', h2)
h3 = open('p/عامل-تحميل-وتنزيل-933102.html', encoding='utf-8').read()
i3 = re.findall(r'<span class="flex-1 text-gray-800">(.*?)</span>', h3)
assert i2 == i3, 'عامل مخزن != عامل تحميل'
print('عامل مخزن == عامل تحميل وتنزيل:', len(i2), 'items ✓')
print('no numbered items start with ملاحظة:', not any(x.strip().startswith('ملاحظة') for x in items + i2))
