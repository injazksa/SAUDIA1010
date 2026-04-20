#!/usr/bin/env python3
"""
🗺️ Sitemap Auto-Generator — Saudia Visa Jordan
تُشغَّل قبل كل نشر (أو حتى يدوياً) لتوليد sitemap.xml محدَّث تلقائياً.

تمسح جميع صفحات HTML في /app/frontend/public/ (ما عدا المُستثنى)،
وتُضيفها للـ sitemap مع أولويات ذكية حسب نوع الصفحة.

الاستخدام:
    python3 /app/scripts/generate_sitemap.py

النتيجة تحفظ في: /app/frontend/public/sitemap.xml
"""
from datetime import datetime
from pathlib import Path
import os

BASE_URL = 'https://saudia-visa.com'
PUBLIC = Path('/app/frontend/public')
OUTPUT = PUBLIC / 'sitemap.xml'

# صفحات مُستثناة من الفهرسة
EXCLUDE_PAGES = {
    '404.html', 'offline.html', 'speed-preload.html', 'post.html',
    'admin/index.html', 'images/index.html', 'data/index.html',
    'content/index.html'
}

# أولوية + changefreq حسب النوع
PAGE_PRIORITY = {
    'index.html':     {'priority': 1.0,  'freq': 'weekly',  'image': 'icons/logo-512.png', 'title': 'مكتب تأشيرات السعودية المعتمد في الأردن'},
    'about.html':     {'priority': 0.95, 'freq': 'monthly', 'image': 'icons/logo-512.png', 'title': 'من نحن'},
    'work-visa.html': {'priority': 0.95, 'freq': 'weekly'},
    'professions.html': {'priority': 0.95, 'freq': 'weekly'},
    'calculator.html':  {'priority': 0.9, 'freq': 'monthly'},
    'professional.html':{'priority': 0.9, 'freq': 'monthly'},
    'certificates.html':{'priority': 0.9, 'freq': 'monthly'},
    'corporate.html':   {'priority': 0.85,'freq': 'monthly'},
    'other-services.html': {'priority': 0.9, 'freq': 'monthly'},
    'faq.html':         {'priority': 0.85,'freq': 'monthly'},
    'blog.html':        {'priority': 0.9, 'freq': 'weekly'},
    # Blog posts (any /blog/*.html)
    'BLOG_POST':        {'priority': 0.9, 'freq': 'monthly'},
    # Legal pages
    'privacy.html':     {'priority': 0.5, 'freq': 'yearly'},
    'terms.html':       {'priority': 0.5, 'freq': 'yearly'},
    'disclaimer.html':  {'priority': 0.5, 'freq': 'yearly'},
}

# اسم الصورة الرئيسية لكل مقال (ذكي تلقائي حسب الاسم)
BLOG_IMAGE_MAP = {
    'umrah-visa-guide-2026.html': ('blog-umrah-hero.webp', 'دليل تأشيرة العمرة الشامل 2026'),
    'work-visa-comprehensive-2026.html': ('blog-work-visa-hero.webp', 'دليل تأشيرة العمل السعودية 2026'),
    'tourist-visa-guide.html': ('blog-tourist-visa-hero.webp', 'التأشيرة السياحية للسعودية 2026'),
    'family-sponsorship-guide.html': ('blog-family-visa-hero.webp', 'الاستقدام العائلي للسعودية'),
}


def collect_pages():
    """يجمع جميع صفحات HTML الحقيقية."""
    pages = []
    for html in PUBLIC.rglob('*.html'):
        rel = str(html.relative_to(PUBLIC)).replace('\\', '/')
        if rel in EXCLUDE_PAGES:
            continue
        # تخطي أي HTML في مجلدات مُستثناة
        if any(rel.startswith(p + '/') for p in ('admin', 'images', 'data', 'content')):
            continue
        pages.append((rel, html))
    return sorted(pages)


def format_url(path: str, config: dict, image: tuple = None, lastmod: str = None) -> str:
    """يبني وسم <url> واحداً."""
    url = f'{BASE_URL}/{"" if path == "index.html" else path}'
    loc = url.rstrip('/') + '/' if path == 'index.html' else url
    lastmod = lastmod or datetime.now().strftime('%Y-%m-%d')
    xml = f'''  <url>
    <loc>{loc}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>{config['freq']}</changefreq>
    <priority>{config['priority']}</priority>'''
    if image:
        img_file, img_title = image
        xml += f'''
    <image:image>
      <image:loc>{BASE_URL}/images/{img_file}</image:loc>
      <image:title>{img_title}</image:title>
    </image:image>'''
    elif 'image' in config:
        xml += f'''
    <image:image>
      <image:loc>{BASE_URL}/{config["image"]}</image:loc>
      <image:title>{config.get("title", "")}</image:title>
    </image:image>'''
    xml += '\n  </url>'
    return xml


def build_sitemap():
    pages = collect_pages()
    today = datetime.now().strftime('%Y-%m-%d')

    xml_parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml"',
        '        xmlns:image="http://www.google.com/schemas/sitemap-image/0.9">',
        '',
        f'  <!-- 🗺️ Auto-generated sitemap — {today} -->',
        f'  <!-- Total indexed pages: {len(pages)} -->',
        '',
    ]

    # أضف كل صفحة
    for rel, path in pages:
        # استخرج file mtime كـ lastmod فعلي
        mtime = datetime.fromtimestamp(path.stat().st_mtime).strftime('%Y-%m-%d')

        # لو كان مقال blog
        if rel.startswith('blog/'):
            filename = rel.split('/', 1)[1]
            image = BLOG_IMAGE_MAP.get(filename)
            config = PAGE_PRIORITY['BLOG_POST']
            xml_parts.append(format_url(rel, config, image=image, lastmod=mtime))
        else:
            config = PAGE_PRIORITY.get(rel, {'priority': 0.7, 'freq': 'monthly'})
            xml_parts.append(format_url(rel, config, lastmod=mtime))
        xml_parts.append('')

    xml_parts.append('</urlset>')

    content = '\n'.join(xml_parts)
    OUTPUT.write_text(content, encoding='utf-8')
    print(f'✅ sitemap.xml generated with {len(pages)} pages → {OUTPUT}')
    return len(pages)


if __name__ == '__main__':
    build_sitemap()
