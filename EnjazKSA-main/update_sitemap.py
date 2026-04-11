import os
from datetime import datetime

SITE_URL = "https://saudia-visa.com"
BLOG_DIR = "blog"
OUTPUT_FILE = "sitemap.xml"

def get_lastmod(file_path):
    ts = os.path.getmtime(file_path)
    return datetime.fromtimestamp(ts).strftime('%Y-%m-%d')

static_pages = [
    {"path": "index.html", "priority": "1.0", "freq": "daily"},
    {"path": "blog.html", "priority": "0.8", "freq": "weekly"},
    {"path": "professions.html", "priority": "0.8", "freq": "weekly"},
    {"path": "saudi-visa-inquiry.html", "priority": "0.8", "freq": "weekly"},
    {"path": "calculator.html", "priority": "0.7", "freq": "monthly"},
    {"path": "work-visa.html", "priority": "0.9", "freq": "weekly"},
    {"path": "visit-visa.html", "priority": "0.9", "freq": "weekly"},
    {"path": "certificates.html", "priority": "0.9", "freq": "weekly"},
    {"path": "professional.html", "priority": "0.9", "freq": "weekly"},
    {"path": "musadaqa.html", "priority": "0.7", "freq": "weekly"},
    {"path": "engineers.html", "priority": "0.7", "freq": "weekly"},
    {"path": "wafid-booking.html", "priority": "0.7", "freq": "monthly"},
    {"path": "privacy.html", "priority": "0.3", "freq": "monthly"},
    {"path": "terms.html", "priority": "0.3", "freq": "monthly"},
    {"path": "disclaimer.html", "priority": "0.3", "freq": "monthly"},
]

sitemap_content = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

# Add Root
sitemap_content += f'    <url>\n        <loc>{SITE_URL}/</loc>\n        <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>\n        <changefreq>daily</changefreq>\n        <priority>1.0</priority>\n    </url>\n'

# Add Static Pages
for page in static_pages:
    if os.path.exists(page["path"]):
        lastmod = get_lastmod(page["path"])
        # Use clean URLs without .html for better SEO and consistency with canonical tags
        clean_path = page["path"].replace(".html", "")
        if clean_path == "index":
            # Skip index.html as it's already added as root /
            continue
        sitemap_content += f'    <url>\n        <loc>{SITE_URL}/{clean_path}</loc>\n        <lastmod>{lastmod}</lastmod>\n        <changefreq>{page["freq"]}</changefreq>\n        <priority>{page["priority"]}</priority>\n    </url>\n'

# Add Blog Posts
if os.path.exists(BLOG_DIR):
    for filename in os.listdir(BLOG_DIR):
        if filename.endswith(".md"):
            file_path = os.path.join(BLOG_DIR, filename)
            lastmod = get_lastmod(file_path)
            sitemap_content += f'    <url>\n        <loc>{SITE_URL}/post.html?file={filename}</loc>\n        <lastmod>{lastmod}</lastmod>\n        <changefreq>weekly</changefreq>\n        <priority>0.7</priority>\n    </url>\n'

sitemap_content += '</urlset>'

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(sitemap_content)

print(f"Sitemap updated successfully: {OUTPUT_FILE}")
