import os
from datetime import datetime

def generate_sitemap():
    base_url = "https://saudia-visa.com"
    today = datetime.now().strftime("%Y-%m-%d")
    
    # 1. القواعد الأساسية
    static_pages = [
        {"loc": "/", "priority": "1.0", "changefreq": "daily"},
        {"loc": "/blog", "priority": "0.8", "changefreq": "weekly"},
        {"loc": "/professions", "priority": "0.8", "changefreq": "weekly"},
        {"loc": "/saudi-visa-inquiry", "priority": "0.8", "changefreq": "weekly"},
        {"loc": "/calculator", "priority": "0.7", "changefreq": "monthly"},
        {"loc": "/work-visa", "priority": "0.9", "changefreq": "weekly"},
        {"loc": "/visit-visa", "priority": "0.9", "changefreq": "weekly"},
        {"loc": "/certificates", "priority": "0.9", "changefreq": "weekly"},
        {"loc": "/professional", "priority": "0.9", "changefreq": "weekly"},
        {"loc": "/musadaqa", "priority": "0.7", "changefreq": "weekly"},
        {"loc": "/engineers", "priority": "0.7", "changefreq": "weekly"},
        {"loc": "/wafid-booking", "priority": "0.7", "changefreq": "monthly"},
        {"loc": "/privacy", "priority": "0.3", "changefreq": "monthly"},
        {"loc": "/terms", "priority": "0.3", "changefreq": "monthly"},
        {"loc": "/disclaimer", "priority": "0.3", "changefreq": "monthly"},
    ]
    
    urls = []
    for page in static_pages:
        urls.append(f"""    <url>
        <loc>{base_url}{page['loc']}</loc>
        <lastmod>{today}</lastmod>
        <changefreq>{page['changefreq']}</changefreq>
        <priority>{page['priority']}</priority>
    </url>""")

    # 2. إضافة صفحات المهن من مجلد p
    p_dir = "/home/ubuntu/project/N-main/frontend/public/p"
    if os.path.exists(p_dir):
        files = os.listdir(p_dir)
        for file in files:
            if file.endswith(".html"):
                urls.append(f"""    <url>
        <loc>{base_url}/p/{file}</loc>
        <lastmod>{today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>""")

    # 3. إضافة صفحات المدونة
    # سنقوم بفحص مجلد blog للبحث عن ملفات md أو html
    blog_dir = "/home/ubuntu/project/N-main/blog"
    if os.path.exists(blog_dir):
        for root, dirs, files in os.walk(blog_dir):
            for file in files:
                if file.endswith(".md"):
                    urls.append(f"""    <url>
        <loc>{base_url}/post.html?file={file}</loc>
        <lastmod>{today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>""")

    # تجميع الملف النهائي
    sitemap_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap_content += "\n".join(urls)
    sitemap_content += "\n</urlset>"
    
    with open("/home/ubuntu/project/N-main/sitemap.xml", "w") as f:
        f.write(sitemap_content)
    
    # نسخ الملف إلى الأماكن الأخرى المطلوبة لضمان التزامن
    destinations = [
        "/home/ubuntu/project/N-main/frontend/public/sitemap.xml",
        "/home/ubuntu/project/N-main/EnjazKSA-main/sitemap.xml"
    ]
    for dest in destinations:
        if os.path.exists(os.path.dirname(dest)):
            with open(dest, "w") as f:
                f.write(sitemap_content)

    print(f"Sitemap generated with {len(urls)} URLs.")

if __name__ == "__main__":
    generate_sitemap()
